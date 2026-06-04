import os
import requests
import json

def test_screener():
    print("==================================================")
    print(">>> VERIFYING DYNAMIC RESUME SCREENING & PARSING")
    print("==================================================")

    url = "http://127.0.0.1:8000/api/screen"
    resume_path = "../2410998600_Report.pdf"

    if not os.path.exists(resume_path):
        resume_path = "c:/Users/Moksh/OneDrive/Desktop/sem/sem 4/ML/AI screening APP/2410998600_Report.pdf"

    if not os.path.exists(resume_path):
        print(f"  - Error: Test resume file not found at {resume_path}!")
        return

    print(f"[TEST 1] Loading test resume file: {os.path.basename(resume_path)}")
    
    files = {
        "resume": (os.path.basename(resume_path), open(resume_path, "rb"), "application/pdf")
    }
    data = {
        "jd_text": "We are looking for a Senior Full-Stack Developer with expertise in React, TypeScript, FastAPI, and Docker containers.",
        "job_title": "Senior Full-Stack Engineer",
        "candidate_email": "candidate@demo.ai"
    }

    print("\n[TEST 2] Sending screening request to FastAPI server...")
    try:
        resp = requests.post(url, files=files, data=data, timeout=120)
        print("  - Response Status:", resp.status_code)
        if resp.status_code == 200:
            res_data = resp.json()
            print("  - Screening completed successfully!")
            print("  - Generated Session ID:", res_data.get("session_id"))
            
            payload = res_data.get("data", {})
            ats_result = payload.get("ats_result", {})
            print("  - ATS Compatibility Score:", ats_result.get("ats_score"), "%")
            print("  - Strengths Identified:", len(payload.get("evaluation", {}).get("strengths", [])))
            print("  - Gaps Identified:", len(payload.get("evaluation", {}).get("gaps", [])))
            print("  - Pre-generated Questions Count:", len(payload.get("interview_questions", {}).get("technical", [])))
        else:
            print("  - Screening failed:", resp.text)
    except Exception as e:
        print(f"  - Request failed: {e}")

    print("\n==================================================")
    print(">>> SCREENER VERIFICATION CONCLUDED.")
    print("==================================================")

if __name__ == "__main__":
    test_screener()
