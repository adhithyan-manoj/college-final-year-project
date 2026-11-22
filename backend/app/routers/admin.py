from typing import Optional, List
from fastapi import APIRouter, HTTPException, Header, UploadFile, File
import shutil
import os
from app.config import settings
from app.database import db
from app.models.scheme import Scheme
from app.models.admin import SchemeUpdateRequest, AdminVerificationRequest, AdminSchemeStats
from app.services.import_service import load_file_and_import

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

def verify_admin(x_admin_secret: Optional[str] = Header(None)):
    # For developmental convenience and project defense, allows access
    if x_admin_secret and x_admin_secret != settings.ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin secret")
    return True

@router.get("/stats", response_model=AdminSchemeStats)
def get_admin_stats():
    schemes = db.get_schemes({"limit": "300"})
    reports = db.get_reports()
    
    total = len(schemes)
    published = sum(1 for s in schemes if s.get("workflow_status") == "published")
    verified = sum(1 for s in schemes if s.get("workflow_status") == "verified")
    under_review = sum(1 for s in schemes if s.get("workflow_status") == "under_review")
    draft = sum(1 for s in schemes if s.get("workflow_status") == "draft")
    pending_reports = sum(1 for r in reports if r.get("status") == "pending")

    return AdminSchemeStats(
        total_schemes=total,
        published_count=published,
        verified_count=verified,
        under_review_count=under_review,
        draft_count=draft,
        pending_reports_count=pending_reports
    )

@router.get("/schemes")
def get_admin_schemes(status: Optional[str] = None):
    params = {"limit": "300", "order": "scheme_id.asc"}
    if status:
        params["workflow_status"] = f"eq.{status}"
    schemes = db.get_schemes(params)
    return {"schemes": schemes, "total": len(schemes)}

@router.patch("/schemes/{scheme_id}")
def update_scheme(scheme_id: str, updates: SchemeUpdateRequest):
    existing = db.get_scheme_by_id(scheme_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Scheme not found")

    payload = updates.dict(exclude_unset=True)
    
    # Handle workflow transition and history logging
    if "workflow_status" in payload:
        prev = existing.get("workflow_status", "published")
        new_st = payload["workflow_status"]
        if prev != new_st:
            db.log_verification_history({
                "scheme_id": scheme_id,
                "previous_status": prev,
                "new_status": new_st,
                "changed_by": "admin",
                "reason": payload.get("verification_notes") or f"Status changed from {prev} to {new_st}",
                "source_evidence_url": payload.get("source_evidence_url") or existing.get("source_url")
            })

    result = db.update_scheme(scheme_id, payload)
    return {"success": True, "scheme": result}

@router.post("/schemes")
def create_scheme(scheme: Scheme):
    existing = db.get_scheme_by_id(scheme.scheme_id)
    if existing:
        raise HTTPException(status_code=400, detail="Scheme ID already exists")
    
    res = db.insert_scheme(scheme.dict())
    return {"success": True, "scheme": res}

@router.post("/import")
def import_dataset(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = load_file_and_import(temp_path, settings.SUPABASE_URL, settings.SUPABASE_KEY)
        return {"success": True, "result": result}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/reports")
def list_reports():
    reports = db.get_reports()
    return {"reports": reports}
