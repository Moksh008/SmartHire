from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import create_user, authenticate_user, get_or_create_google_user, update_user_profile
from logger import logger

router = APIRouter(prefix="/api/auth", tags=["auth"])
user_router = APIRouter(prefix="/api/user", tags=["user"])

class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    email: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None

@router.post("/register")
def register(req: RegisterRequest):
    logger.info(f"Registering new user: {req.email}")
    try:
        user = create_user(req.email, req.password, req.role)
        return {"id": user.id, "email": user.email, "role": user.role}
    except Exception as e:
        logger.error(f"Registration error: {e}")
        if "UNIQUE constraint" in str(e):
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login(req: LoginRequest):
    logger.info(f"Login attempt for: {req.email}")
    user = authenticate_user(req.email, req.password)
    if not user:
        logger.warning(f"Invalid credentials for: {req.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"id": user.id, "email": user.email, "role": user.role, "token": f"demo-token-{user.id}"}

@router.post("/google")
def google_auth(req: GoogleAuthRequest):
    logger.info(f"Google auth for: {req.email}")
    user = get_or_create_google_user(req.email)
    return {"id": user.id, "email": user.email, "role": user.role, "token": f"google-token-{user.id}"}

@user_router.put("/profile")
def update_profile_endpoint(req: UserUpdate, user_id: int):
    logger.info(f"Updating profile for user_id: {user_id}")
    user = update_user_profile(user_id, req.dict(exclude_unset=True))
    if not user:
        logger.error(f"User {user_id} not found during profile update")
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "user": {
        "full_name": user.full_name,
        "email": user.email,
        "bio": user.bio,
        "location": user.location,
        "avatar_url": user.avatar_url,
        "skills": user.skills,
        "experience_years": user.experience_years
    }}
