# SmartHire AI - Dual-Dashboard Recruitment & Assessment Platform

A comprehensive recruitment platform with dual dashboards: one for Recruiters to rank candidates, and one for Individuals to optimize resumes and take proctored assessments.

## Features

### For Recruiters
- **Job Description Management**: Create and store multiple job descriptions
- **Bulk Resume Upload**: Drag-and-drop multiple PDF resumes for analysis
- **Candidate Leaderboard**: Real-time ranking by ATS score, technical fit, and behavioral integrity
- **Detailed Drill-down**: View matching/missing skills for each candidate

### For Individuals  
- **Resume Optimizer**: Get AI suggestions to improve your resume
- **Proctored Assessments**: Take assessments with camera/mic monitoring
- **Assessment History**: Track progress over time
- **Voice AI**: TTS (text-to-speech) and STT (speech-to-text) for hands-free interview

### Advanced Features
- **Code Execution**: Run Python/C++ code in a secure Docker sandbox
- **Monaco Editor**: VS Code-like editor for coding assessments
- **WebSocket Progress**: Real-time bulk processing updates

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: SQLite (via SQLAlchemy)
- **Code Execution**: Docker containers with timeout (5s)
- **Voice AI**: Browser Web Speech API

## Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (for code execution)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd pbl-test1
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database (automatically created on first run):
```bash
python -c "from database import init_db; init_db()"
```

4. Start the FastAPI server:
```bash
python fastapi_app.py
# or
uvicorn fastapi_app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Docker Setup (for Code Execution)

Build the sandbox Docker image:
```bash
cd pbl-test1
docker build -t code-sandbox:latest -f Dockerfile.sandbox .
```

Or use docker-compose:
```bash
cd pbl-test1
docker-compose up --build
```

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get JWT |

### Jobs (Recruiter)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | GET | List all job descriptions |
| `/api/jobs` | POST | Create new job |

### Candidates (Recruiter)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recruiter/analyze-bulk` | POST | Bulk analyze resumes |
| `/api/recruiter/candidates/{jd_id}` | GET | Get candidates for a job |

### Individual
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/individual/profile` | GET | Get user profile |
| `/api/individual/history` | GET | Get assessment history |
| `/api/individual/submit-assessment` | POST | Submit assessment |

### Screening
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/screen` | POST | Screen a resume against JD |
| `/api/proctor` | POST | Send proctoring frame |
| `/api/results/{session_id}` | GET | Get session results |

### Code Execution
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/code/execute` | POST | Execute Python/C++ code |

### WebSocket
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ws/progress/{session_id}` | WebSocket | Bulk processing progress |

## Routes

| Path | Dashboard | Description |
|------|----------|-------------|
| `/recruiter/dashboard` | Recruiter | Main recruiter dashboard |
| `/recruiter/jobs` | Recruiter | Job openings |
| `/individual/dashboard` | Individual | User dashboard |
| `/individual/assessment` | Individual | Assessment suite |

## Running the Application

1. Start the backend:
```bash
cd pbl-test1
python fastapi_app.py
```

2. Start the frontend (in separate terminal):
```bash
cd Frontend
npm run dev
```

3. Open browser at `http://localhost:5173`

## Environment Variables

### Backend
- `DATABASE_URL`: SQLite database path (default: `sqlite:///data/app.db`)
- `SECRET_KEY`: JWT secret key

### Frontend
- `VITE_API_URL`: Backend API URL (default: `http://localhost:8000/api`)

## Project Structure

```
├── pbl-test1/                    # Backend
│   ├── fastapi_app.py           # Main FastAPI app
│   ├── database.py            # SQLAlchemy models
│   ├── code_executor.py      # Docker code executor
│   ├── Dockerfile.sandbox    # Code execution container
│   ├── docker-compose.yml  # Docker orchestration
│   └── data/                 # SQLite database
│
├── Frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Recruiter/   # Recruiter dashboards
│   │   │   ├── Individual/ # Individual dashboards
│   │   │   └── Interview/  # Assessment suite
│   │   └── components/
│   └── package.json
│
└── README.md
```

## Troubleshooting

### Database Issues
If you get database errors, reinitialize:
```bash
python -c "from database import init_db; init_db()"
```

### Docker Issues
Make sure Docker is running:
```bash
docker ps
```

If sandbox fails to build:
```bash
docker build -t code-sandbox:latest -f Dockerfile.sandbox pbl-test1/
```

### CORS Issues
The backend allows all origins for development. In production, update `fastapi_app.py` CORS configuration.

## License

MIT License