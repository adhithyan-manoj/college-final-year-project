from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    age: Optional[int] = Field(None, ge=1, le=120)
    state: str = Field("Kerala", description="State or UT of residence")
    district: Optional[str] = None
    residence_type: Optional[str] = Field(None, description="rural or urban")
    education_level: Optional[str] = Field(None, description="e.g. 10th, 12th, Undergraduate, Postgraduate, Diploma, PhD")
    employment_status: Optional[str] = Field(None, description="Student, Employed, Unemployed, Self-Employed, Retired")
    current_course: Optional[str] = None
    year_of_study: Optional[str] = None
    academic_marks_percent: Optional[float] = None
    annual_income_inr: Optional[float] = Field(None, ge=0)
    income_category: Optional[str] = Field(None, description="Below 1.5 Lakh, 1.5L - 3L, 3L - 6L, 6L - 8L, Above 8L")
    assistance_categories: List[str] = Field(default_factory=list, description="Scholarships, Education funding, Skill training, Agriculture, Healthcare, etc.")
    social_category: Optional[str] = Field(None, description="General, OBC, SC, ST, EWS")
    is_differently_abled: Optional[bool] = False
    minority_community: Optional[str] = None
    institution_type: Optional[str] = None
    business_stage: Optional[str] = None
    farming_type: Optional[str] = None
    extra_attributes: Dict[str, Any] = Field(default_factory=dict)

class QuestionnaireAnswer(BaseModel):
    step: int
    answers: Dict[str, Any]

class QuestionOption(BaseModel):
    label: str
    value: str
    description: Optional[str] = None

class QuestionItem(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    type: str  # 'select', 'multiselect', 'number', 'text', 'radio'
    options: Optional[List[QuestionOption]] = None
    required: bool = False
    category: str
    explanation: Optional[str] = None

class DynamicQuestionRequest(BaseModel):
    current_step: int
    answers: Dict[str, Any]

class DynamicQuestionResponse(BaseModel):
    step: int
    total_steps: int
    questions: List[QuestionItem]
    progress_percentage: int
