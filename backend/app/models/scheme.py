from typing import Optional, List
from pydantic import BaseModel, Field

class Scheme(BaseModel):
    scheme_id: str
    scheme_name: str
    record_type: Optional[str] = None
    government_level: Optional[str] = None
    state_or_ut: Optional[str] = None
    sector: Optional[str] = None
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
    residency_requirement: Optional[str] = None
    other_eligibility_conditions: Optional[str] = None
    required_documents: Optional[str] = None
    application_mode: Optional[str] = None
    official_application_url: Optional[str] = None
    opening_date: Optional[str] = None
    application_deadline: Optional[str] = None
    academic_or_financial_year: Optional[str] = None
    application_status: Optional[str] = None
    source_url: Optional[str] = None
    source_organisation: Optional[str] = None
    source_accessed_on: Optional[str] = None
    listing_evidence: Optional[str] = None
    eligibility_rule_verification: Optional[str] = None
    review_priority: Optional[str] = None
    research_notes: Optional[str] = None
    workflow_status: str = "published"

class SchemeFilter(BaseModel):
    query: Optional[str] = None
    government_level: Optional[str] = None
    state_or_ut: Optional[str] = None
    sector: Optional[str] = None
    workflow_status: Optional[str] = None
    has_benefit_amount: Optional[bool] = None
    has_application_link: Optional[bool] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

class SchemeListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    schemes: List[Scheme]

class SchemeReportCreate(BaseModel):
    scheme_id: str
    report_type: str  # 'expired_deadline', 'broken_link', 'incorrect_criteria', 'other'
    description: str
    contact_email: Optional[str] = None
