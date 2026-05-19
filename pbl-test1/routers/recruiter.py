from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List
import tempfile
import time
import os
from pathlib import Path

from database import SessionLocal, get_jobs, create_job, delete_job, JobDescription, create_resume, get_resumes_by_jd, Assessment
from vector_store import store_resume_chunks, store_jd_requirements_tagged, clear_collections
from extractor import extract_resume
from test_main_cli import _extract_jd_requirements, _extract_resume_skill_items
import agent_3_validator
from logger import logger

router = APIRouter(prefix="/api", tags=["recruiter"])

class JobCreateRequest(BaseModel):
    title: str
    raw_text: str
    requirements: List[str]

@router.get("/jobs")
def list_jobs(user_id: int):
    logger.info(f"Listing jobs for user: {user_id}")
    jobs = get_jobs(user_id)
    return [
        {
            "id": j.id,
            "title": j.title,
            "raw_text": j.raw_text,
            "requirements": j.requirements,
            "created_at": j.created_at.isoformat() if j.created_at else None,
            "resume_count": len(j.resumes) if j.resumes else 0
        }
        for j in jobs
    ]

@router.post("/jobs")
def create_job_endpoint(req: JobCreateRequest, user_id: int):
    logger.info(f"Creating job '{req.title}' for user: {user_id}")
    job = create_job(user_id, req.title, req.raw_text, req.requirements)
    return {"id": job.id, "title": job.title, "created_at": job.created_at.isoformat()}

@router.delete("/jobs/{job_id}")
def delete_job_endpoint(job_id: int, user_id: int):
    logger.info(f"Deleting job: {job_id} by user: {user_id}")
    success = delete_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "success", "message": "Job deleted"}

@router.post("/recruiter/upload-resumes")
async def upload_resumes(
    job_id: int = Form(...),
    files: List[UploadFile] = File(...),
):
    logger.info(f"Uploading {len(files)} resumes for job_id: {job_id}")
    results = []
    # Fetch job text
    db_session = SessionLocal()
    job = db_session.query(JobDescription).filter(JobDescription.id == job_id).first()
    db_session.close()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for file in files:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        
        try:
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
                candidate_email=f"bulk_{int(time.time())}@example.com",
                file_path=tmp_path,
                file_name=file.filename,
                jd_id=job_id,
                analysis_data=result_data
            )
            
            results.append({"id": resume.id, "file": file.filename, "score": ats.ats_score})
        except Exception as e:
            logger.error(f"Error processing resume {file.filename}: {e}")
            results.append({"file": file.filename, "error": str(e)})
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    return {"status": "success", "processed": len(results), "results": results}

@router.get("/recruiter/candidates/{jd_id}")
def get_candidates(jd_id: int):
    logger.info(f"Getting candidates for jd_id: {jd_id}")
    resumes = get_resumes_by_jd(jd_id)
    output = []
    for r in resumes:
        # Get the latest assessment for this resume
        db = SessionLocal()
        assessment = db.query(Assessment).filter(Assessment.resume_id == r.id).order_by(Assessment.completed_at.desc()).first()
        db.close()
        
        # Extract "Will Be Probed" from resume analysis_data if evaluation exists
        will_be_probed = []
        if r.analysis_data and "evaluation" in r.analysis_data:
            will_be_probed = r.analysis_data["evaluation"].get("will_be_probed", [])

        output.append({
            "id": r.id,
            "candidate_email": r.candidate_email,
            "file_name": r.file_name,
            "ats_score": r.ats_score,
            "matching_skills": r.matching_skills,
            "missing_skills": r.missing_skills,
            "will_be_probed": will_be_probed,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
            "assessment": {
                "mcq_score": assessment.mcq_score,
                "integrity_score": assessment.integrity_score,
                "overall_score": assessment.overall_score,
                "behavior_summary": assessment.behavior_summary,
                "interview_feedback": assessment.interview_feedback,
                "completed_at": assessment.completed_at.isoformat()
            } if assessment else None
        })
    return output
