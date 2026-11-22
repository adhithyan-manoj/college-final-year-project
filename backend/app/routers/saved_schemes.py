from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import db

router = APIRouter(prefix="/api", tags=["Saved Schemes and Checklist"])

class SaveSchemeRequest(BaseModel):
    user_id: str
    scheme_id: str

class ChecklistUpdateRequest(BaseModel):
    user_id: str
    scheme_id: str
    status: str
    notes: Optional[str] = None

@router.get("/saved-schemes")
def get_saved_schemes(user_id: str):
    items = db.get_saved_schemes(user_id)
    return {"saved_schemes": items}

@router.post("/saved-schemes")
def save_scheme(req: SaveSchemeRequest):
    success = db.save_scheme_for_user(req.user_id, req.scheme_id)
    if not success:
        raise HTTPException(status_code=400, detail="Could not save scheme")
    return {"success": True, "message": "Scheme saved to your collection"}

@router.delete("/saved-schemes/{scheme_id}")
def remove_saved(scheme_id: str, user_id: str):
    success = db.remove_saved_scheme(user_id, scheme_id)
    return {"success": success}

@router.get("/checklist")
def get_checklist(user_id: str):
    items = db.get_checklist(user_id)
    return {"checklist": items}

@router.post("/checklist")
def update_checklist(req: ChecklistUpdateRequest):
    success = db.update_checklist_status(req.user_id, req.scheme_id, req.status, req.notes)
    if not success:
        raise HTTPException(status_code=400, detail="Could not update checklist")
    return {"success": True, "message": "Application checklist updated"}
