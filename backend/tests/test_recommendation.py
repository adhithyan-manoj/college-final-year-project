import pytest
from app.models.profile import UserProfile
from app.models.scheme import Scheme
from app.services.recommendation_engine import RecommendationEngine

def test_sample_user_recommendations():
    """
    Test sample user from specification:
    - Age: 20
    - State: Kerala
    - Education: Undergraduate
    - Annual family income: ₹1,50,000
    - Employment status: Student
    - Assistance: Scholarships and education funding
    """
    sample_profile = UserProfile(
        age=20,
        state="Kerala",
        education_level="undergraduate",
        employment_status="student",
        annual_income_inr=150000.0,
        assistance_categories=["scholarships", "education funding"]
    )

    sample_schemes = [
        {
            "scheme_id": "SCH-001",
            "scheme_name": "Central Sector Scheme of Scholarships for College and University Students",
            "government_level": "Central",
            "state_or_ut": "All India",
            "sector": "Scholarship / fellowship",
            "intended_beneficiaries": "College and University students pursuing undergraduate courses",
            "eligibility_rule_verification": "unverified listing",
            "workflow_status": "published"
        },
        {
            "scheme_id": "SCH-002",
            "scheme_name": "Kerala Post Matric Scholarship for OBC",
            "government_level": "State",
            "state_or_ut": "Kerala",
            "sector": "Scholarship / fee assistance",
            "intended_beneficiaries": "Post-matric students in Kerala",
            "eligibility_rule_verification": "unverified listing",
            "workflow_status": "published"
        },
        {
            "scheme_id": "SCH-003",
            "scheme_name": "Tamil Nadu Chief Minister Fellowship",
            "government_level": "State",
            "state_or_ut": "Tamil Nadu",
            "sector": "Fellowship",
            "intended_beneficiaries": "Residents of Tamil Nadu",
            "eligibility_rule_verification": "unverified listing",
            "workflow_status": "published"
        }
    ]

    result = RecommendationEngine.rank_and_evaluate(sample_schemes, sample_profile)
    
    # Tamil Nadu state scheme should be filtered out for a Kerala resident
    scheme_ids = [item.scheme.scheme_id for item in result.recommendations]
    assert "SCH-001" in scheme_ids, "Central scheme should be included"
    assert "SCH-002" in scheme_ids, "Kerala state scheme should be included"
    assert "SCH-003" not in scheme_ids, "Tamil Nadu state scheme must be excluded for Kerala resident"

    # Status must be potential match because listing is unverified
    top_item = result.recommendations[0]
    assert top_item.eligibility_status == "Potential match"
    assert "Potential match — detailed eligibility requirements need verification" in top_item.next_steps or top_item.unverified_conditions or top_item.eligibility_status
