import sys
from pathlib import Path
import requests
import json

# Ensure Server is in path
sys.path.insert(0, str(Path(__file__).parent))

from database import init_db
from api_utils import create_session, get_session, update_session

def run_tests():
    print("==================================================")
    print(">>> RUNNING HACK2HIRE COMPLIANCE INTERVIEW FLOW TESTS")
    print("==================================================")

    # 1. Initialize DB and create session
    init_db()
    session_id = create_session()
    print(f"[TEST 1] Session created successfully: {session_id}")

    # Mock screen data
    mock_screener = {
        "ats_result": {
            "ats_score": 82.5,
            "matching_skills": [{"requirement": "React"}],
            "missing_skills": [{"requirement": "Docker"}],
            "summary": "Full Stack Engineer"
        },
        "interview_questions": {
            "technical": ["Initial Tech Q"],
            "behavioral": ["Initial Behav Q"],
            "scenario_based": ["Initial Scenario Q"]
        }
    }
    update_session(session_id, "screener", mock_screener)
    print("[TEST 2] Screen context populated in SQLite.")

    # 2. Test dynamic question loop call (Normal Case)
    url = "http://127.0.0.1:8000/api/interview/adaptive-next"
    payload = {
        "session_id": session_id,
        "current_difficulty": 2,
        "last_question": "Explain React state management.",
        "last_answer": "We can use useState and context APIs to manage localized and global state streams respectively.",
        "elapsed_seconds": 25
    }

    try:
        print("[TEST 3] Calling dynamic adaptive endpoint (Normal answer)...")
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            print("  - Response Status:", resp.status_code)
            print("  - Next Question Generated:", data.get("next_question"))
            print("  - Adapted Difficulty Index:", data.get("difficulty"))
            print("  - Evaluated Score on Last Answer:", data.get("score_on_last"))
            print("  - Terminate Flag:", data.get("terminate"))
        else:
            print("  - Error Status:", resp.status_code)
            print("  - Detail:", resp.text)
    except Exception as e:
        print(f"  - Request failed: {e}. (Ensure FastAPI is active on port 8000)")

    # 3. Test Cheating Force-Termination Trigger
    print("\n[TEST 4] Simulating Proctor Suspicion Integrity Trigger...")
    update_session(session_id, "suspicion_score", 70.0)
    try:
        payload["current_difficulty"] = 2
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            print("  - Terminate Flag:", data.get("terminate"))
            print("  - Termination Reason:", data.get("reason"))
        else:
            print("  - Error Status:", resp.status_code)
    except Exception as e:
        print(f"  - Request failed: {e}")

    # 4. Test Consecutive Stagnation Force-Termination Trigger
    print("\n[TEST 5] Simulating Stagnation Stalling Trigger...")
    session_id_2 = create_session()
    update_session(session_id_2, "screener", mock_screener)
    
    try:
        for i in range(3):
            print(f"  - Submitting empty answer {i+1} of 3...")
            payload = {
                "session_id": session_id_2,
                "current_difficulty": 2,
                "last_question": f"Question {i+1}",
                "last_answer": "i don't know",
                "elapsed_seconds": 5
            }
            resp = requests.post(url, json=payload, timeout=10)
            data = resp.json()
            if data.get("terminate"):
                print("    - Force-Terminated successfully on consecutive stagnation!")
                print("    - Reason:", data.get("reason"))
                break
    except Exception as e:
        print(f"  - Request failed: {e}")

    print("\n==================================================")
    print(">>> TESTS CONCLUDED.")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
