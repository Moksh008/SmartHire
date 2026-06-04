import sys
from pathlib import Path

# Ensure Server is in path
sys.path.insert(0, str(Path(__file__).parent))

from database import init_db
from api_utils import create_session, get_session, update_session
from routers.interview import get_adaptive_next, AdaptiveQuestionRequest

def run_internal_tests():
    print("==================================================")
    print(">>> RUNNING INTERNAL HACK2HIRE LOGIC VERIFICATIONS")
    print("==================================================")

    init_db()
    session_id = create_session()
    print(f"[TEST 1] Session created: {session_id}")

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

    # 1. Test normal dynamic grading & question generation
    print("\n[TEST 3] Running internal adaptive-next grader (Normal answer)...")
    req = AdaptiveQuestionRequest(
        session_id=session_id,
        current_difficulty=2,
        last_question="Explain React state management.",
        last_answer="We can use useState and context APIs to manage localized and global state streams respectively.",
        elapsed_seconds=25
    )
    try:
        res = get_adaptive_next(req)
        print("  - Graded Score on last answer:", res.get("score_on_last"))
        print("  - Feedback on last answer:", res.get("feedback_on_last"))
        print("  - Adapted Difficulty Index:", res.get("difficulty"))
        print("  - Terminate Flag:", res.get("terminate"))
        print("  - Next question generated successfully:", res.get("next_question"))
    except Exception as e:
        print(f"  - Grading failed: {e}")

    # 2. Test Cheating Suspicion early termination
    print("\n[TEST 4] Simulating biometric suspicion breach (suspicion = 70.0)...")
    update_session(session_id, "suspicion_score", 70.0)
    try:
        req = AdaptiveQuestionRequest(
            session_id=session_id,
            current_difficulty=2,
            last_question="Explain React state management.",
            last_answer="We can use useState.",
            elapsed_seconds=10
        )
        res = get_adaptive_next(req)
        print("  - Terminate Flag:", res.get("terminate"))
        print("  - Termination Reason:", res.get("reason"))
    except Exception as e:
        print(f"  - Suspected proctor verification failed: {e}")

    # 3. Test Consecutive Stagnation early termination
    print("\n[TEST 5] Simulating consecutive technical stagnation (consecutive failed attempts)...")
    session_id_2 = create_session()
    update_session(session_id_2, "screener", mock_screener)
    
    try:
        for i in range(3):
            print(f"  - Submitting empty answer {i+1} of 3...")
            req = AdaptiveQuestionRequest(
                session_id=session_id_2,
                current_difficulty=2,
                last_question=f"Question {i+1}",
                last_answer="i don't know",
                elapsed_seconds=5
            )
            res = get_adaptive_next(req)
            if res.get("terminate"):
                print("    - Force-Terminated successfully on consecutive stagnation!")
                print("    - Reason:", res.get("reason"))
                break
    except Exception as e:
        print(f"  - Stagnation check failed: {e}")

    print("\n==================================================")
    print(">>> INTERNAL TEST COMPLETE.")
    print("==================================================")

if __name__ == "__main__":
    run_internal_tests()
