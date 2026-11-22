from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class SourceCitation(BaseModel):
    scheme_id: str
    scheme_name: str
    source_url: Optional[str] = None
    official_application_url: Optional[str] = None
    authority: Optional[str] = None

class AIChatRequest(BaseModel):
    message: str
    language: str = "en"  # "en" for English, "ml" for Malayalam
    context_scheme_id: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    reply: str
    language: str
    citations: List[SourceCitation]
    missing_information: List[str] = []
    is_grounded: bool = True
