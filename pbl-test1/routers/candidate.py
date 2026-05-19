from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from database import SessionLocal, User, Assessment, get_assessments_by_user, create_assessment
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
    # Evaluate interview answers using agent_5
    mock_interview_feedback = {}
    if req.interview_answers:
        try:
            mock_interview_feedback = agent_5_interview_evaluator.run(req.interview_answers)
        except Exception as e:
            logger.error(f"[submit-assessment] Interview evaluation failed: {e}")
            mock_interview_feedback = {
                "overall_impression": "Evaluation unavailable.",
                "strengths": [],
                "areas_for_improvement": ["Unable to evaluate interview answers."],
                "technical_accuracy": "N/A"
            }

    # Save feedback to session
    session = get_session(req.session_id)
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
