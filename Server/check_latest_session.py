import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from database import SessionLocal, SessionLog

def check():
    db = SessionLocal()
    try:
        sessions = db.query(SessionLog).order_by(SessionLog.start_time.desc()).limit(3).all()
        print("==================================================")
        print(">>> LATEST SESSIONS IN SQLITE APP.DB")
        print("==================================================")
        for s in sessions:
            print(f"Session ID: {s.session_id}")
            print(f"  - Start Time: {s.start_time}")
            print(f"  - Suspicion Score: {s.suspicion_score}")
            print(f"  - Has Screener Data: {s.screener_data is not None}")
            if s.screener_data:
                ats = s.screener_data.get("ats_result", {})
                print(f"    * ATS Score: {ats.get('ats_score')}%")
                print(f"    * Job Title: {ats.get('summary', 'N/A')[:40]}...")
            print(f"  - Extra Data Keys: {list(s.extra_data.keys()) if s.extra_data else []}")
            print("--------------------------------------------------")
    finally:
        db.close()

if __name__ == "__main__":
    check()
