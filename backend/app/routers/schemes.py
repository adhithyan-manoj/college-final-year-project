from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from app.database import db
from app.models.scheme import Scheme, SchemeListResponse, SchemeReportCreate

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])

@router.get("", response_model=SchemeListResponse)
def list_schemes(
    query: Optional[str] = Query(None, description="Search term for name or purpose"),
    state_or_ut: Optional[str] = Query(None),
    government_level: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    workflow_status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    params = {}
    if state_or_ut:
        params["state_or_ut"] = f"eq.{state_or_ut}"
    if government_level:
        params["government_level"] = f"eq.{government_level}"
    if sector:
        params["sector"] = f"eq.{sector}"
    if workflow_status:
        params["workflow_status"] = f"eq.{workflow_status}"

    schemes_data = db.get_schemes(params)
    
    # Client-side text filter if query is provided
    if query:
        q_lower = query.lower()
        schemes_data = [
            s for s in schemes_data 
            if q_lower in (s.get("scheme_name") or "").lower() 
            or q_lower in (s.get("scheme_purpose") or "").lower()
            or q_lower in (s.get("sector") or "").lower()
        ]

    total = len(schemes_data)
    start = (page - 1) * page_size
    paged = schemes_data[start:start + page_size]

    return SchemeListResponse(
        total=total,
        page=page,
        page_size=page_size,
        schemes=[Scheme(**s) for s in paged]
    )

@router.get("/{scheme_id}", response_model=Scheme)
def get_scheme(scheme_id: str):
    data = db.get_scheme_by_id(scheme_id)
    if not data:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return Scheme(**data)

@router.post("/{scheme_id}/report")
def report_scheme(scheme_id: str, report: SchemeReportCreate):
    data = db.get_scheme_by_id(scheme_id)
    if not data:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    success = db.create_report({
        "scheme_id": scheme_id,
        "report_type": report.report_type,
        "description": report.description,
        "contact_email": report.contact_email
    })
    return {"success": success, "message": "Report submitted successfully for administrative review."}
