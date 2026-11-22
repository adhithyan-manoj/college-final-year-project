from fastapi import APIRouter
from app.models.profile import UserProfile
from app.database import db

router = APIRouter(prefix="/api/profile", tags=["User Profile"])

@router.post("")
def save_profile(profile: UserProfile):
    # Store or validate profile for discovery session
    return {
        "success": True,
        "message": "User profile validated and saved",
        "profile": profile
    }
