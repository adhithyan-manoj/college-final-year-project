from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.scheme import Scheme

class ConditionEvaluation(BaseModel):
    rule_type: str
    requirement: str
    user_value: Optional[str] = None
    satisfied: bool
    is_verified: bool
    explanation: str

class RecommendationItem(BaseModel):
    scheme: Scheme
    relevance_score: int = Field(..., ge=0, le=100, description="Match relevance percentage based on profile interests and scope")
    eligibility_status: str = Field(..., description="Eligible based on verified criteria | Potential match | More information needed | Not eligible based on verified criteria")
    why_recommended: str
    matched_profile_attributes: List[str]
    verified_satisfied_conditions: List[str]
    verified_failed_conditions: List[str]
    unverified_conditions: List[str]
    missing_information: List[str]
    next_steps: str
    source_url: Optional[str]
    official_application_url: Optional[str]

class RecommendationResponse(BaseModel):
    total_opportunities: int
    verified_eligible_count: int
    potential_match_count: int
    more_info_needed_count: int
    not_eligible_count: int
    recommendations: List[RecommendationItem]
    user_summary: Dict[str, Any]
