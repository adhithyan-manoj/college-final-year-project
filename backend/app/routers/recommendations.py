from fastapi import APIRouter
from app.models.profile import UserProfile
from app.models.recommendation import RecommendationResponse
from app.database import db
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.post("", response_model=RecommendationResponse)
def get_recommendations(profile: UserProfile):
    # Retrieve active/published schemes from database
    schemes_data = db.get_schemes({"workflow_status": "eq.published"})
    if not schemes_data:
        # Fallback to all schemes
        schemes_data = db.get_schemes({"limit": "251"})

    response = RecommendationEngine.rank_and_evaluate(schemes_data, profile)
    return response
