from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List
import tempfile
import time
import os
from pathlib import Path
import shutil

from database import SessionLocal, get_jobs, create_job, delete_job, JobDescription, create_resume, get_resumes_by_jd, Assessment, get_resume_by_id
from vector_store import store_resume_chunks, store_jd_requirements_tagged, clear_collections
from extractor import extract_resume, extract_text_from_pdf
from test_main_cli import _extract_jd_requirements, _extract_resume_skill_items
from fastapi.responses import FileResponse
import agent_3_validator
from logger import logger

router = APIRouter(prefix="/api", tags=["recruiter"])

class JobCreateRequest(BaseModel):
    title: str
    raw_text: str
    requirements: List[str]
    location: str = None
    department: str = None
    collaborators: List[str] = []

@router.get("/jobs/all")
def get_all_jobs_endpoint():
    logger.info("Fetching all jobs")
    from database import get_all_jobs
    jobs = get_all_jobs()
    return [
        {
            "id": j.id,
            "title": j.title,
            "raw_text": j.raw_text,
            "requirements": j.requirements,
            "location": j.location,
            "department": j.department,
            "collaborators": j.collaborators,
            "created_at": j.created_at.isoformat() if j.created_at else None,
            "resume_count": len(j.resumes) if j.resumes else 0,
            "recruiter_id": j.recruiter_id
        }
        for j in jobs
    ]

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
            "location": j.location,
            "department": j.department,
            "collaborators": j.collaborators,
            "created_at": j.created_at.isoformat() if j.created_at else None,
            "resume_count": len(j.resumes) if j.resumes else 0
        }
        for j in jobs
    ]

@router.post("/jobs")
def create_job_endpoint(req: JobCreateRequest, user_id: int):
    logger.info(f"Creating job '{req.title}' for user: {user_id}")
    job = create_job(user_id, req.title, req.raw_text, req.requirements, req.location, req.department, req.collaborators)
    return {"id": job.id, "title": job.title, "created_at": job.created_at.isoformat()}

@router.put("/jobs/{job_id}")
def update_job_endpoint(job_id: int, req: JobCreateRequest):
    logger.info(f"Updating job: {job_id}")
    from database import update_job
    job = update_job(job_id, req.title, req.raw_text, req.requirements, req.location, req.department, req.collaborators)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "success", "message": "Job updated"}

@router.delete("/jobs/{job_id}")
def delete_job_endpoint(job_id: int, user_id: int):
    logger.info(f"Deleting job: {job_id} by user: {user_id}")
    # Remove resume files associated with the job before deleting DB rows
    try:
        db = SessionLocal()
        job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
        if not job:
            db.close()
            raise HTTPException(status_code=404, detail="Job not found")

        # delete associated resume files (best-effort)
        for r in job.resumes or []:
            try:
                if r.file_path and Path(r.file_path).exists():
                    Path(r.file_path).unlink()
                    logger.info(f"Deleted resume file: {r.file_path}")
                else:
                    logger.debug(f"Resume file not present on disk: {r.file_path}")
            except Exception as e:
                logger.error(f"Failed to delete resume file {r.file_path}: {e}")

        db.close()

        success = delete_job(job_id)
        if not success:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"status": "success", "message": "Job deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting job {job_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {e}")

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

    data_dir = Path(__file__).parent / "data" / "resumes"
    data_dir.mkdir(parents=True, exist_ok=True)

    for file in files:
        dest_name = f"{int(time.time())}_{file.filename}"
        dest_path = data_dir / dest_name
        # Save uploaded file persistently
        try:
            contents = await file.read()
            with open(dest_path, "wb") as f:
                f.write(contents)

            clear_collections()
            chunks = extract_resume(str(dest_path))
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
                file_path=str(dest_path),
                file_name=file.filename,
                jd_id=job_id,
                analysis_data=result_data
            )

            results.append({"id": resume.id, "file": file.filename, "score": ats.ats_score})
        except Exception as e:
            logger.error(f"Error processing resume {file.filename}: {e}")
            # Clean up file if partially written
            try:
                if dest_path.exists():
                    dest_path.unlink()
            except Exception:
                pass
            results.append({"file": file.filename, "error": str(e)})
                
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

        # Pull partial_matches from analysis_data
        partial_matches = []
        if r.analysis_data:
            partial_matches = r.analysis_data.get("partial_matches", [])

        output.append({
            "id": r.id,
            "candidate_email": r.candidate_email,
            "file_name": r.file_name,
            "ats_score": r.ats_score,
            "matching_skills": r.matching_skills,
            "missing_skills": r.missing_skills,
            "partial_matches": partial_matches,
            "will_be_probed": will_be_probed,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
            "assessment": {
                "mcq_score": assessment.mcq_score,
                "integrity_score": assessment.integrity_score,
                "overall_score": assessment.overall_score,
                "dsa_code": assessment.dsa_code,
                "dsa_feedback": assessment.dsa_feedback,
                "behavior_summary": assessment.behavior_summary,
                "interview_feedback": assessment.interview_feedback,
                "completed_at": assessment.completed_at.isoformat()
            } if assessment else None
        })
    return output


@router.get("/recruiter/resume/{resume_id}")
def get_resume_text(resume_id: int):
    logger.info(f"Fetching resume text for id: {resume_id}")
    r = get_resume_by_id(resume_id)
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    file_path = r.file_path
    download_url = None
    text = None

    if file_path and Path(file_path).exists():
        download_url = f"/api/recruiter/resume/{r.id}/download"
        try:
            text = extract_text_from_pdf(file_path)
        except Exception as e:
            logger.error(f"Failed to extract resume text for {resume_id}: {e}")
            text = "Could not extract text from resume."
    else:
        text = "Resume file is not available on server. Please re-upload the resume."

    return {"id": r.id, "file_name": r.file_name, "text": text, "download_url": download_url}



@router.get("/recruiter/resume/{resume_id}/download")
def download_resume(resume_id: int):
    r = get_resume_by_id(resume_id)
    if not r or not r.file_path:
        raise HTTPException(status_code=404, detail="Resume not found")
    p = Path(r.file_path)
    if not p.exists():
        raise HTTPException(status_code=404, detail="Resume file not found on disk")
    return FileResponse(str(p), filename=r.file_name, media_type="application/pdf")
