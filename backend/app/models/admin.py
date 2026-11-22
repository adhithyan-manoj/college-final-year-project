from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.scheme import Scheme

class SchemeUpdateRequest(BaseModel):
    scheme_name: Optional[str] = None
    sector: Optional[str] = None
    government_level: Optional[str] = None
    state_or_ut: Optional[str] = None
    implementing_authority: Optional[str] = None
    intended_beneficiaries: Optional[str] = None
    scheme_purpose: Optional[str] = None
    benefit_summary: Optional[str] = None
    benefit_amount_inr: Optional[float] = None
    minimum_age: Optional[int] = None
    maximum_age: Optional[int] = None
    maximum_annual_family_income_inr: Optional[float] = None
    education_requirement: Optional[str] = None
    social_category_requirement: Optional[str] = None
    official_application_url: Optional[str] = None
    application_deadline: Optional[str] = None
    workflow_status: Optional[str] = Field(None, description="draft, under_review, verified, published, archived")
    review_priority: Optional[str] = None
    research_notes: Optional[str] = None
    verification_notes: Optional[str] = None
    source_evidence_url: Optional[str] = None

class AdminVerificationRequest(BaseModel):
    new_status: str = Field(..., description="draft, under_review, verified, published, archived")
    reason: str
    source_evidence_url: str
    verified_by: str = "Admin"

class AdminSchemeStats(BaseModel):
    total_schemes: int
    published_count: int
    verified_count: int
    under_review_count: int
    draft_count: int
    pending_reports_count: int
