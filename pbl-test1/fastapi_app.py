from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pathlib import Path
import sys

# Ensure backend directory is in path
sys.path.insert(0, str(Path(__file__).parent))

from database import init_db, get_user_by_email, create_user, SessionLocal
from routers.auth import router as auth_router, user_router
from routers.recruiter import router as recruiter_router
from routers.candidate import router as candidate_router
from routers.interview import router as interview_router
from logger import logger

# Initialize Database & Demo Users
init_db()
db = SessionLocal()
try:
    if not get_user_by_email("recruiter@demo.ai"):
        create_user("recruiter@demo.ai", "password123", "RECRUITER")
        logger.info("Created demo recruiter account: recruiter@demo.ai")
    if not get_user_by_email("candidate@demo.ai"):
        create_user("candidate@demo.ai", "password123", "INDIVIDUAL")
        logger.info("Created demo candidate account: candidate@demo.ai")
finally:
    db.close()

# Create FastAPI App
app = FastAPI(
    title="SmartHire API",
    version="3.0.0 (Modularized & Persistent)",
    description="Enterprise-ready modular API for SmartHire AI Platform"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://smart-hire-8ysf.vercel.app",
        "https://smarthire-moksh.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(recruiter_router)
app.include_router(candidate_router)
app.include_router(interview_router)

@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat(), "modular": True}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting SmartHire Backend Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)