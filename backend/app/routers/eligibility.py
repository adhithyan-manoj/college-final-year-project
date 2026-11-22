from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.profile import UserProfile
from app.models.scheme import Scheme
from app.database import db
from app.services.eligibility_checker import EligibilityChecker

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility"])

class EligibilityCheckRequest(BaseModel):
    scheme_id: str
    profile: UserProfile

@router.post("/check")
def check_scheme_eligibility(req: EligibilityCheckRequest):
    scheme_data = db.get_scheme_by_id(req.scheme_id)
    if not scheme_data:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    scheme = Scheme(**scheme_data)
    result = EligibilityChecker.evaluate(scheme, req.profile)
    return {
        "scheme_id": req.scheme_id,
        "scheme_name": scheme.scheme_name,
        "evaluation": result
    }
