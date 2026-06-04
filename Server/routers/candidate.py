from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import tempfile, os
from pathlib import Path

from database import SessionLocal, User, Assessment, JobDescription, get_assessments_by_user, create_assessment, create_resume
from api_utils import get_session, update_session
from code_executor import execute_code
from dependencies import get_detectors
import agent_5_interview_evaluator
from logger import logger

router = APIRouter(prefix="/api", tags=["candidate"])

@router.get("/individual/profile")
def get_profile(user_id: int):
    logger.info(f"Fetching profile for user: {user_id}")
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    assessments = get_assessments_by_user(user_id)
    return {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
        "bio": user.bio,
        "location": user.location,
        "avatar_url": user.avatar_url,
        "skills": user.skills,
        "experience_years": user.experience_years,
        "total_assessments": len(assessments),
        "average_score": sum(a.overall_score for a in assessments) / len(assessments) if assessments else 0
    }

@router.get("/individual/history")
def get_history(user_id: int):
    logger.info(f"Fetching history for user: {user_id}")
    assessments = get_assessments_by_user(user_id)
    return [
        {
            "id": a.id,
            "mcq_score": a.mcq_score,
            "integrity_score": a.integrity_score,
            "overall_score": a.overall_score,
            "interview_feedback": a.interview_feedback,
            "behavior_summary": a.behavior_summary,
            "completed_at": a.completed_at.isoformat() if a.completed_at else None
        }
        for a in assessments
    ]

@router.get("/individual/resume-suggestions")
def get_resume_suggestions(user_id: int = 2):
    logger.info(f"Fetching resume suggestions for user: {user_id}")
    # Fetch the last resume uploaded by this user
    db_session = SessionLocal()
    user = db_session.query(User).filter(User.id == user_id).first()
    if not user or not user.resumes:
        db_session.close()
        return {"suggestions": "Upload your resume in the assessment suite to get suggestions."}
    
    last_resume = user.resumes[-1]
    db_session.close()
    
    return {
        "missing_skills": last_resume.missing_skills,
        "matching_skills": last_resume.matching_skills,
        "ats_score": last_resume.ats_score,
        "file_name": last_resume.file_name
    }

@router.post("/individual/apply")
async def apply_to_job(
    job_id: int = Form(...),
    user_id: int = Form(...),
    file: UploadFile = File(...),
):
    """Candidate uploads their resume to apply for a specific job."""
    logger.info(f"User {user_id} applying to job {job_id} with file: {file.filename}")

    db_session = SessionLocal()
    job = db_session.query(JobDescription).filter(JobDescription.id == job_id).first()
    candidate = db_session.query(User).filter(User.id == user_id).first()
    db_session.close()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not candidate:
        raise HTTPException(status_code=404, detail="User not found")

    # Check already applied
    from database import Resume
    db_check = SessionLocal()
    already = db_check.query(Resume).filter(
        Resume.jd_id == job_id,
        Resume.candidate_email == candidate.email
    ).first()
    db_check.close()
    if already:
        raise HTTPException(status_code=409, detail="You have already applied to this job.")

    suffix = Path(file.filename).suffix if file.filename else ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        from extractor import extract_resume
        from vector_store import store_resume_chunks, store_jd_requirements_tagged, clear_collections
        from test_main_cli import _extract_jd_requirements, _extract_resume_skill_items
        import agent_3_validator

        clear_collections()
        chunks = extract_resume(tmp_path)
        store_resume_chunks(chunks)
        jd_items = _extract_jd_requirements(job.raw_text)
        resume_items = _extract_resume_skill_items(chunks)
        store_jd_requirements_tagged(jd_items, resume_items, job.title)
        ats = agent_3_validator.run(job.raw_text)

        result_data = {
            "ats_score": ats.ats_score,
            "matching_skills": [s.model_dump() if hasattr(s, "model_dump") else s.dict() for s in ats.matching_skills],
            "missing_skills": [s.model_dump() if hasattr(s, "model_dump") else s.dict() for s in ats.missing_skills],
        }

        resume = create_resume(
            candidate_email=candidate.email,
            file_path=tmp_path,
            file_name=file.filename or "resume.pdf",
            jd_id=job_id,
            analysis_data=result_data,
        )

        return {
            "status": "success",
            "resume_id": resume.id,
            "ats_score": ats.ats_score,
            "matching_count": len(ats.matching_skills),
            "missing_count": len(ats.missing_skills),
        }
    except Exception as e:
        logger.error(f"Apply failed: {e}")
        raise HTTPException(status_code=500, detail=f"Application processing failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


class CodeExecuteRequest(BaseModel):
    code: str
    language: str
    test_cases: List[dict]

@router.post("/code/execute")
def execute_code_endpoint(req: CodeExecuteRequest):
    logger.info(f"Executing code for language: {req.language}")
    result = execute_code(req.code, req.language, req.test_cases)
    return result

class AssessmentSubmitRequest(BaseModel):
    session_id: str
    interview_answers: List[dict] = []
    resume_id: Optional[int] = 1
    user_id: Optional[int] = 2
    mcq_score: float
    dsa_code: str
    dsa_feedback: dict
    integrity_score: float

@router.post("/individual/submit-assessment")
def submit_assessment(req: AssessmentSubmitRequest):
    logger.info(f"Submitting assessment for session: {req.session_id}")
    
    # Save feedback to session
    session = get_session(req.session_id)
    interview_answers = req.interview_answers
    if not interview_answers and session:
        interview_answers = session.get("adaptive_history", [])
        logger.info(f"Fetched {len(interview_answers)} adaptive answers from session logs.")

    # Evaluate interview answers using agent_5
    mock_interview_feedback = {}
    if interview_answers:
        try:
            mock_interview_feedback = agent_5_interview_evaluator.run(interview_answers)
        except Exception as e:
            logger.error(f"[submit-assessment] Interview evaluation failed: {e}")
            mock_interview_feedback = {
                "overall_impression": "Evaluation unavailable.",
                "strengths": [],
                "areas_for_improvement": ["Unable to evaluate interview answers."],
                "technical_accuracy": "N/A"
            }

    if session:
        update_session(req.session_id, "mock_interview_feedback", mock_interview_feedback)
        update_session(req.session_id, "dsa_feedback", req.dsa_feedback)

    # Get behavior summary from rules engine (active session)
    _, _, _, rules_obj = get_detectors()
    behavior_summary = rules_obj.get_behavior_summary()

    assessment = create_assessment(
        resume_id=req.resume_id or 1,
        individual_id=req.user_id or 2,
        mcq_score=req.mcq_score,
        dsa_code=req.dsa_code,
        dsa_feedback=req.dsa_feedback,
        integrity_score=req.integrity_score,
        behavior_summary=behavior_summary,
        interview_feedback=mock_interview_feedback
    )

    return {"status": "success", "assessment_id": assessment.id}
