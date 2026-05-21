# SmartHire AI — Deep Technical Study Guide

This document explains every system in the platform at the source-code level. Read this the night before your viva.

---

## 1. System Architecture Overview

```
Browser (React + Vite)
        │  HTTP/REST + FormData
        ▼
FastAPI Backend (Python)    ◄──── SQLite (SQLAlchemy ORM)
        │                   ◄──── ChromaDB (Vector Store)
        ├── Ollama (localhost:11434)  ← qwen2.5-coder:7b, gemma3:4b
        ├── HuggingFace CrossEncoder  ← cross-encoder/ms-marco-MiniLM-L-6-v2
        ├── SentenceTransformer       ← all-MiniLM-L6-v2
        └── Docker Sandbox            ← code-sandbox:latest
```

**FastAPI entry point:** `fastapi_app.py`
- Calls `init_db()` on startup → creates all SQLAlchemy tables if not existing
- Seeds two demo users (`recruiter@demo.ai`, `candidate@demo.ai`)
- Registers four routers via `app.include_router(...)`:
  - `/api/auth/` and `/api/user/` → `routers/auth.py`
  - `/api/` recruiter endpoints → `routers/recruiter.py`
  - `/api/` candidate endpoints → `routers/candidate.py`
  - `/api/` interview endpoints → `routers/interview.py`
- CORS configured to allow `localhost:5173` (dev) and `*.vercel.app` (production)

---

## 2. Database Layer — `database.py`

**ORM:** SQLAlchemy with SQLite. `Base.metadata.create_all(bind=engine)` creates tables automatically on first run.

### Key Tables & Relationships

| Table | Key Columns | Notes |
|---|---|---|
| `users` | id, email, password_hash (pbkdf2_sha256), role (RECRUITER/INDIVIDUAL), skills (JSON), full_name | |
| `job_descriptions` | id, recruiter_id (FK), title, raw_text, requirements (JSON), location, department, collaborators (JSON) | |
| `resumes` | id, candidate_email, file_path, file_name, jd_id (FK), ats_score, matching_skills (JSON), missing_skills (JSON), analysis_data (JSON) | |
| `assessments` | id, resume_id (FK), individual_id (FK), mcq_score, dsa_code, integrity_score, overall_score, interview_feedback (JSON), behavior_summary (JSON) | `overall_score = (mcq_score × 0.5) + (integrity_score × 0.5)` |
| `integrity_logs` | id, assessment_id (FK), event_type, message, score_increment | Proctoring events |
| `session_logs` | session_id (unique), screener_data (JSON), integrity_logs (JSON), suspicion_score | Transient interview sessions |

**Password hashing:** `passlib.CryptContext` using `pbkdf2_sha256`. The `authenticate_user()` function calls `pwd_context.verify(plain, hash)`.

---

## 3. Resume Processing Pipeline (ATS Workflow)

This is the most important workflow. It runs whenever a resume is uploaded (by a recruiter screening or a candidate applying).

### Step 1 — PDF Text Extraction (`extractor.py`)

```python
extract_resume(pdf_path) → List[ResumeChunk]
```

- Uses **PyPDF2** to read each page: `reader.pages[i].extract_text()`
- Splits raw text line-by-line, detects section headers using regex patterns:
  ```
  "skills", "experience", "education", "projects", "certifications"
  ```
- **Header lines are completely discarded** (name, email, phone, LinkedIn) to prevent personal data from polluting the vector search.
- Each section is stored as a `ResumeChunk(chunk_id, section, content)`.
- **Extra pass on the Skills section:** splits bullets/commas into individual skill items, each stored as a separate micro-chunk (`skill_item_N`).

### Step 2 — Embedding into ChromaDB (`vector_store.py` + `embedder.py`)

```python
store_resume_chunks(chunks)
```

- **Embedding model:** `all-MiniLM-L6-v2` from SentenceTransformer (lazy-loaded singleton).
- Each chunk's `content` text is encoded into a **384-dimensional dense vector**.
- Stored in ChromaDB collection `resume_chunks` with metadata `{section: "skills", ...}`.
- Similarly, `store_jd_requirements_tagged(jd_items, resume_items, job_title)` stores JD skill requirements as vectors in a separate `jd_requirements` collection.

```python
embed_texts(["Python", "FastAPI", "Docker"]) → [[0.12, -0.45, ...], ...]
```

### Step 3 — ATS Scoring (`agent_3_validator.py`)

The main `run(jd_text)` function does **skill-based similarity matching** (with a fallback to CrossEncoder).

#### Primary Path — Structured Skill Extraction
1. `get_skills("resume")` → queries ChromaDB for all resume skill chunks
2. `get_skills("jd")` → queries ChromaDB for all JD skill chunks
3. Cleans JD skills with `clean_jd_skill()` — extracts actual tech keywords from noisy phrases like "experience with frameworks like node.js" → `"node.js"`. Non-technical phrases return `None`.
4. **Skill normalization:** `NORMALIZE` dict maps abbreviations: `"js"→"javascript"`, `"llm"→"large language models"`, `"cicd"→"ci/cd"`
5. For each JD skill, it is compared against every resume skill:
   - **Priority 1 — Exact match:** `jd_skill.lower() in resume_skills` → score 1.0
   - **Priority 2 — Direct substring match:** `is_direct_match()` handles `"node.js"` vs `"nodejs"` → score 1.0
   - **Priority 3 — Semantic similarity:**
     - `embed_single(skill)` → 384-dim vector (cached in `_skill_embedding_cache`)
     - `cosine_similarity(v1, v2)` → raw score in [0, 1]
     - Multiplied by **contextual confidence** `_contextual_confidence()`:
       - If skill appears with qualifier words ("basic", "familiar") → 0.60×
       - If skill appears with years ("3 years of Python") → 1.10×
       - If skill appears with senior verbs ("architected", "deployed") → 1.05×
       - Twice in the resume → 1.00×, once → 0.85×, not found → 0.75×

#### Thresholds
```
score >= 0.60  → MATCHED
score >= 0.38  → PARTIAL (counts as 0.5 match)
score <  0.38  → MISSING
```

#### Weighted ATS Score Formula
```
total_weight = Σ weight(jd_skill_i)  # Python=2.0, Docker=1.5, Git=1.2, etc.
matched_weight = Σ weight(matched_skill)
partial_weight = Σ 0.5 × weight(partial_skill)
ATS_score = (matched_weight + partial_weight) / total_weight × 100
```

#### Fallback — CrossEncoder (Legacy)
If skill extraction fails, uses `cross-encoder/ms-marco-MiniLM-L-6-v2`:
- For each JD requirement, queries ChromaDB top-5 resume chunks
- `model.predict([(requirement, chunk_content)])` → raw logit
- `sigmoid(logit)` → score in [0, 1]
- Combined with keyword boost: `max(semantic_score, keyword_boost_score)`

---

## 4. The 5 AI Agents

All agents communicate with Ollama via HTTP POST to `http://localhost:11434/api/generate` with `stream: false`.

### Agent 1 — Interviewer (`agent_1_interviewer.py`)
- **Model:** `qwen2.5-coder:7b`
- **Input:** `ATSResult` + `EvaluationResult`
- **What it does:** Calls `call_tool("query_resume", ...)` via MCP to retrieve relevant resume sections from ChromaDB (skills, experience). Builds a focused prompt with the ATS gaps and missing skills. Asks the model to generate **Technical, Behavioral, and Scenario-based** questions.
- **Output format:** Strict JSON `{"technical": [...], "behavioral": [...], "scenario_based": [...]}`
- **Fallback:** If JSON parse fails, returns hardcoded questions based on the matched/missing skills from ATS.
- **Temperature:** 0.3 (low randomness = consistent questions), `num_predict: 400`

### Agent 2 — Evaluator (`agent_2_evaluator.py`)
- **Model:** `qwen2.5-coder:7b`
- **Input:** Resume chunks + JD text
- **What it does:** Generates a qualitative evaluation of the candidate's resume: strengths, gaps, overall fit ("Strong Fit / Moderate Fit / Weak Fit"), and a list of things to probe in the interview.
- **Output format:** JSON `{"qualitative_feedback": "...", "strengths": [...], "gaps": [...], "will_be_probed": [...], "overall_fit": "..."}`

### Agent 3 — Validator (`agent_3_validator.py`)
Covered in detail in Section 3. It is the ATS scoring engine.

### Agent 4 — Assessor (`agent_4_assessor.py`)
- **Model:** `gemma3:4b`
- **Input:** Candidate's tech stack (from ATS results)
- **What it does:** Generates a custom DSA (Data Structures & Algorithms) coding question tailored to the candidate's skills. Returns `DSAQuestion(title, description, constraints, base_code, language, solution_logic)`.
- **Why gemma3:4b?** It's faster and good at structured coding question generation, saving the larger `qwen` model for reasoning.

### Agent 5 — Interview Evaluator (`agent_5_interview_evaluator.py`)
- **Model:** `qwen2.5-coder:7b`
- **Input:** List of `{question, answer}` pairs from the interview session
- **What it does:**
  1. Runs `_analyze_filler_words(answers)` — counts occurrences of "um", "uh", "like", "you know", etc., calculates filler_rate = (filler_count / total_words) × 100. This is a communication quality metric.
  2. Builds a prompt with all Q&A pairs, asks the model to evaluate.
  3. Merges the voice_analysis into the JSON response.
- **Output format:** JSON `{"overall_impression": "...", "strengths": [...], "areas_for_improvement": [...], "technical_accuracy": "...", "vocal_confidence": "...", "voice_analysis": {"filler_count": 3, "filler_rate": 1.5, ...}}`

---

## 5. Code Execution Sandbox (`code_executor.py`)

**Security principle:** Never execute untrusted code on the host machine directly.

### Docker Path (Primary)
```python
docker run --rm
  -e CODE_INPUT={"code": "...", "test_cases": [...]}
  -e LANGUAGE=python
  code-sandbox:latest python
```
- `--rm` flag: Container is destroyed immediately after execution.
- Timeout: `TIMEOUT_SECONDS = 5` — subprocess kills the Docker process if it takes > 5s.
- The container runs `sandbox_entrypoint.sh` which reads `$CODE_INPUT`, writes the code to a temp file, runs it, and captures stdout.

### Local Fallback (When Docker is Not Running)
- **Python:** Writes code to a `NamedTemporaryFile`, uses `subprocess.run([sys.executable, tmp_path], timeout=5)`. A test runner template is injected that finds the first user-defined function via `inspect.getmembers()` and runs test cases.
- **C++:** Writes code to a temp `.cpp` file, compiles with `g++`, then executes the binary.

### Safety Check
```python
if "using namespace std" in code or "#include <" in code:
    return {"success": False, "error": "C++ code detected in Python runtime."}
```

---

## 6. Proctoring System (`monitoring_system/`)

Used during the AI assessment to detect cheating.

### YOLOv8 (Object Detection)
- Model: `yolov8n.pt` (nano — fast, low memory)
- Detects `class 0` (person) bounding boxes from each webcam frame.
- If **more than 1 person** is detected → flags as cheating.
- If **0 persons** detected → candidate has left the screen.

### MediaPipe (Pose & Face Landmarks)
- `FaceLandmarker` → detects facial keypoints (468 landmarks per face)
- `PoseLandmarker` → detects body keypoints (33 landmarks)
- Used to check gaze direction (are they looking at the screen?) and body posture.
- If the face orientation deviates significantly → eye contact score drops.

### Rules Engine (`logic/`)
- Aggregates detection events over time.
- Assigns a `suspicion_score` per event: e.g., "multiple faces" = +20, "no face" = +5 per second.
- `get_behavior_summary()` returns a dict with overall integrity assessment.
- This is saved into `assessment.integrity_score` in the database.

---

## 7. Authentication System (`routers/auth.py`)

### Email/Password Login
1. `POST /api/auth/login` → `authenticate_user(email, password)`
2. Backend: `pwd_context.verify(plain_password, stored_hash)`
3. Returns `{id, email, role, token: "demo-token-{id}"}`
4. Frontend stores this in `localStorage` and React Context (`AuthContext.tsx`)

### Google OAuth
1. Firebase Auth (frontend) authenticates the user and gets their email.
2. Frontend calls `POST /api/auth/google` with `{email}`.
3. Backend: `get_or_create_google_user(email)` — looks up or creates the user. Specific emails get pre-assigned roles (e.g., `moksh8600...@chitkara.edu.in` → `RECRUITER`).
4. Returns same session structure.

### Role-Based Access Control (RBAC) — Frontend
`ProtectedRoute.tsx` wraps routes and checks `user.role` from `AuthContext`:
```tsx
<Route element={<ProtectedRoute allowedRoles={["RECRUITER"]} />}>
  <Route path="/jobs" element={<JobOpenings />} />
</Route>
```
If wrong role → redirected to dashboard.

---

## 8. Frontend Data Flow

### API Configuration (`config/api.ts`)
```typescript
const rawUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
export const API_BASE = rawUrl; // Used everywhere: axios.get(`${API_BASE}/jobs?user_id=${id}`)
```
- `ngrok-skip-browser-warning` header is injected globally via `axios.defaults` AND by patching `window.fetch` — both are needed because some components use native fetch.

### State Management
No Redux or Zustand — pure React `useState` + `useEffect` + `useCallback` pattern.
- `useAuth()` provides `user` (id, email, role), `login()`, `logout()`, `updateUserContext()`.
- Components call `axios.get/post/put/delete` directly with `user.id` as a query param.

---

## 9. Key Viva Questions — With Exact Technical Answers

**Q: "How does the ATS score work?"**
> Skills from the resume and JD are extracted and embedded into 384-dimensional vectors using `all-MiniLM-L6-v2`. Each JD skill is compared to every resume skill via cosine similarity. If the adjusted score (raw similarity × contextual confidence) ≥ 0.60, it's a match. Weighted scores are summed: high-value skills like Python or React have weight 2.0, Git has 1.2. Final score = (matched_weight + 0.5×partial_weight) / total_weight × 100.

**Q: "Why two models — qwen and gemma?"**
> `qwen2.5-coder:7b` is a 7-billion parameter model specialized for code reasoning, used for interviewing and evaluation. `gemma3:4b` is a 4-billion parameter model that's faster and lighter, used for generating DSA questions where we don't need deep reasoning — just structured output.

**Q: "How does Docker sandboxing work?"**
> The candidate's code is passed as an environment variable `$CODE_INPUT` to a `docker run --rm` subprocess with a 5-second timeout. The container runs `sandbox_entrypoint.sh` which parses the JSON, writes code to a temp file, executes it, and prints the result. `--rm` destroys the container immediately. If Docker is unavailable, the backend falls back to a local `subprocess.run` with the same 5-second timeout.

**Q: "What is ChromaDB and why not just use SQLite for everything?"**
> SQLite can only do exact string matches. ChromaDB stores vectors (numerical representations of meaning). When we query `query_resume_top_k("work experience projects", k=5)`, ChromaDB finds the 5 resume chunks whose vector is closest in meaning — even if they use different words. This enables semantic matching: "architected backend services" can match the JD requirement "backend development experience".

**Q: "How does the filler word analysis work?"**
> Agent 5 calls `_analyze_filler_words(answers)`. It iterates over all interview answers, uses `re.findall(r"\b{filler}\b", text)` with word boundary anchors to count occurrences of "um", "ah", "uh", "like", "you know", "actually", "basically". `filler_rate = (filler_count / total_words) × 100`. This is returned as a `voice_analysis` object merged into the final interview evaluation JSON.

**Q: "What happens when an Ollama model is not found?"**
> The `_ollama_generate()` function checks the HTTP status code. If it's 404, it raises: `RuntimeError(f"Model '{MODEL}' not found. Run: ollama pull {MODEL}")`. If Ollama isn't running, `requests.exceptions.ConnectionError` is caught and raises a clear message: `"Ollama is not running. Start it with: ollama serve"`. Both agents have fallback question/evaluation sets if the LLM call fails entirely.
