import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from sqlalchemy import create_engine

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, joinedload
from passlib.context import CryptContext

Base = declarative_base()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "app.db"

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


class SessionLog(Base):
    __tablename__ = "session_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    screener_data = Column(JSON, nullable=True)
    integrity_logs = Column(JSON, default=list)
    suspicion_score = Column(Float, default=0.0)
    start_time = Column(DateTime, default=datetime.utcnow)
    extra_data = Column(JSON, default=dict)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # RECRUITER or INDIVIDUAL
    full_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    skills = Column(JSON, default=list)
    experience_years = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    jobs = relationship("JobDescription", back_populates="recruiter")
    resumes = relationship("Resume", back_populates="candidate")
    assessments = relationship("Assessment", back_populates="individual")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    requirements = Column(JSON, default=list)
    location = Column(String, nullable=True)
    department = Column(String, nullable=True)
    collaborators = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    recruiter = relationship("User", back_populates="jobs")
    resumes = relationship("Resume", back_populates="job", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    candidate_email = Column(String, index=True)
    file_path = Column(String)
    file_name = Column(String)
    jd_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True)
    ats_score = Column(Float, default=0.0)
    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    analysis_data = Column(JSON, default=dict)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("User", back_populates="resumes")
    job = relationship("JobDescription", back_populates="resumes")
    assessments = relationship("Assessment", back_populates="resume", cascade="all, delete-orphan")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    individual_id = Column(Integer, ForeignKey("users.id"))
    mcq_score = Column(Float, default=0.0)
    dsa_code = Column(Text)
    dsa_feedback = Column(JSON, default=dict)
    integrity_score = Column(Float, default=100.0)
    overall_score = Column(Float, default=0.0)
    behavior_summary = Column(JSON, default=dict)
    interview_feedback = Column(JSON, default=dict)
    completed_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="assessments")
    individual = relationship("User", back_populates="assessments")
    integrity_logs = relationship("IntegrityLog", back_populates="assessment", cascade="all, delete-orphan")


class IntegrityLog(Base):
    __tablename__ = "integrity_logs"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    event_type = Column(String)
    message = Column(String)
    score_increment = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("Assessment", back_populates="integrity_logs")


class UserCreate(BaseModel):
    email: str
    password: str
    role: str  # RECRUITER or INDIVIDUAL


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_user(email: str, password: str, role: str) -> User:
    email_normalized = email.strip().lower()
    password_hash = pwd_context.hash(password)
    user = User(email=email_normalized, password_hash=password_hash, role=role)
    db = SessionLocal()
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def get_or_create_google_user(email: str, role: Optional[str] = None) -> User:
    email_normalized = email.strip().lower()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email_normalized).first()
        if not user:
            # If no role is provided, default to INDIVIDUAL, but check hardcoded emails
            if not role:
                role = "INDIVIDUAL"
                if email_normalized == "moksh8600.beaift24@chitkara.edu.in":
                    role = "RECRUITER"
                elif email_normalized == "mokshkulshrestha@gmail.com":
                    role = "INDIVIDUAL"
            
            # For Google users, we don't need a real password hash
            user = User(email=email_normalized, password_hash="GOOGLE_OAUTH_ACCOUNT", role=role)
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    finally:
        db.close()


def authenticate_user(email: str, password: str) -> Optional[User]:
    email_normalized = email.strip().lower()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email_normalized).first()
        if user and pwd_context.verify(password, user.password_hash):
            return user
        return None
    finally:
        db.close()


def get_user_by_email(email: str) -> Optional[User]:
    email_normalized = email.strip().lower()
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email_normalized).first()
    finally:
        db.close()


def create_job(recruiter_id: int, title: str, raw_text: str, requirements: list, location: str = None, department: str = None, collaborators: list = None) -> JobDescription:
    db = SessionLocal()
    try:
        job = JobDescription(
            recruiter_id=recruiter_id,
            title=title,
            raw_text=raw_text,
            requirements=requirements,
            location=location,
            department=department,
            collaborators=collaborators or []
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    finally:
        db.close()


def get_jobs(recruiter_id: int) -> list:
    db = SessionLocal()
    try:
        return db.query(JobDescription).options(joinedload(JobDescription.resumes)).filter(JobDescription.recruiter_id == recruiter_id).all()
    finally:
        db.close()

def get_all_jobs() -> list:
    db = SessionLocal()
    try:
        return db.query(JobDescription).options(joinedload(JobDescription.resumes)).order_by(JobDescription.created_at.desc()).all()
    finally:
        db.close()

def update_job(job_id: int, title: str, raw_text: str, requirements: list, location: str = None, department: str = None, collaborators: list = None) -> Optional[JobDescription]:
    db = SessionLocal()
    try:
        job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
        if job:
            job.title = title
            job.raw_text = raw_text
            job.requirements = requirements
            job.location = location
            job.department = department
            job.collaborators = collaborators or []
            db.commit()
            db.refresh(job)
            return job
        return None
    finally:
        db.close()


def delete_job(job_id: int) -> bool:
    db = SessionLocal()
    try:
        job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
        if job:
            db.delete(job)
            db.commit()
            return True
        return False
    finally:
        db.close()



def create_resume(candidate_email: str, file_path: str, file_name: str, jd_id: Optional[int], analysis_data: dict) -> Resume:
    db = SessionLocal()
    try:
        # Check if ats_score is nested inside ats_result
        ats_score = analysis_data.get("ats_score")
        if ats_score is None:
            ats_score = analysis_data.get("ats_result", {}).get("ats_score", 0.0)
            
        matching_skills = analysis_data.get("matching_skills")
        if matching_skills is None:
            matching_skills = analysis_data.get("ats_result", {}).get("matching_skills", [])
            
        missing_skills = analysis_data.get("missing_skills")
        if missing_skills is None:
            missing_skills = analysis_data.get("ats_result", {}).get("missing_skills", [])

        candidate = db.query(User).filter(User.email == candidate_email).first()
        candidate_id = candidate.id if candidate else None

        resume = Resume(
            candidate_id=candidate_id,
            candidate_email=candidate_email,
            file_path=file_path,
            file_name=file_name,
            jd_id=jd_id,
            ats_score=ats_score,
            matching_skills=matching_skills,
            missing_skills=missing_skills,
            analysis_data=analysis_data
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume
    finally:
        db.close()


def get_resumes_by_jd(jd_id: int) -> list:
    db = SessionLocal()
    try:
        return db.query(Resume).filter(Resume.jd_id == jd_id).order_by(Resume.ats_score.desc()).all()
    finally:
        db.close()


def create_assessment(resume_id: int, individual_id: int, mcq_score: float, dsa_code: str, dsa_feedback: dict, integrity_score: float, behavior_summary: dict = None, interview_feedback: dict = None) -> Assessment:
    db = SessionLocal()
    try:
        # Fetch ATS score from resume
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        ats_score = resume.ats_score if resume else 75.0
        
        # Calculate coding sandbox score based on test cases passing or manual execution status
        dsa_success = dsa_feedback.get("success", False) if isinstance(dsa_feedback, dict) else False
        code_score = 100.0 if dsa_success else 20.0
        
        # Calculate verbal fluency score based on filler rate or default
        verbal_score = 75.0
        if interview_feedback and isinstance(interview_feedback, dict):
            voice_analysis = interview_feedback.get("voice_analysis", {})
            if voice_analysis and isinstance(voice_analysis, dict):
                filler_rate = voice_analysis.get("filler_rate", 0)
                verbal_score = max(0.0, 100.0 - (float(filler_rate) * 5.0))
        
        # Weighted Hiring Readiness Score synthesis:
        # ATS (20%) + Verbal (30%) + Code (25%) + MCQ (15%) + Integrity (10%)
        overall = (
            (float(ats_score) * 0.20) +
            (float(verbal_score) * 0.30) +
            (float(code_score) * 0.25) +
            (float(mcq_score) * 0.15) +
            (float(integrity_score) * 0.10)
        )
        overall = round(overall, 2)
        
        assessment = Assessment(
            resume_id=resume_id,
            individual_id=individual_id,
            mcq_score=mcq_score,
            dsa_code=dsa_code,
            dsa_feedback=dsa_feedback,
            integrity_score=integrity_score,
            overall_score=overall,
            behavior_summary=behavior_summary or {},
            interview_feedback=interview_feedback or {}
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        return assessment
    finally:
        db.close()


def get_assessments_by_user(user_id: int) -> list:
    db = SessionLocal()
    try:
        return db.query(Assessment).filter(Assessment.individual_id == user_id).order_by(Assessment.completed_at.desc()).all()
    finally:
        db.close()


def add_integrity_log(assessment_id: int, event_type: str, message: str, score_increment: int) -> IntegrityLog:
    db = SessionLocal()
    try:
        log = IntegrityLog(
            assessment_id=assessment_id,
            event_type=event_type,
            message=message,
            score_increment=score_increment
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    finally:
        db.close()


def get_resume_by_id(resume_id: int) -> Optional[Resume]:
    db = SessionLocal()
    try:
        return db.query(Resume).filter(Resume.id == resume_id).first()
    finally:
        db.close()


def update_resume_analysis(resume_id: int, ats_score: float, matching_skills: list, missing_skills: list, analysis_data: dict):
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            resume.ats_score = ats_score
            resume.matching_skills = matching_skills
            resume.missing_skills = missing_skills
            resume.analysis_data = analysis_data
            db.commit()
    finally:
        db.close()
def update_user_profile(user_id, data):
    db_session = SessionLocal()
    try:
        user = db_session.query(User).filter(User.id == user_id).first()
        if user:
            if 'full_name' in data: user.full_name = data['full_name']
            if 'email' in data: user.email = data['email']
            if 'bio' in data: user.bio = data['bio']
            if 'location' in data: user.location = data['location']
            if 'avatar_url' in data: user.avatar_url = data['avatar_url']
            if 'skills' in data: user.skills = data['skills']
            if 'experience_years' in data: user.experience_years = data['experience_years']
            db_session.commit()
            db_session.refresh(user)
            return user
        return None
    finally:
        db_session.close()
