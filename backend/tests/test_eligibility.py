import pytest
from app.models.profile import UserProfile
from app.models.scheme import Scheme
from app.services.eligibility_checker import EligibilityChecker

def test_verified_eligibility_statuses():
    profile = UserProfile(
        age=22,
        state="Kerala",
        annual_income_inr=200000.0,
        education_level="undergraduate"
    )

    # 1. Verified Eligible Scheme
    verified_scheme = Scheme(
        scheme_id="VER-001",
        scheme_name="Verified Youth Higher Ed Grant",
        minimum_age=18,
        maximum_age=25,
        maximum_annual_family_income_inr=250000.0,
        state_or_ut="Kerala",
        government_level="State",
        eligibility_rule_verification="Verified by Ministry Gazette 2026"
    )
    res1 = EligibilityChecker.evaluate(verified_scheme, profile)
    assert res1["status"] == "Eligible based on verified criteria"
    assert len(res1["verified_satisfied"]) >= 3

    # 2. Verified Ineligible Scheme (Age exceeded)
    ineligible_scheme = Scheme(
        scheme_id="VER-002",
        scheme_name="School Child Grant",
        minimum_age=6,
        maximum_age=14,
        eligibility_rule_verification="Verified official guidelines"
    )
    res2 = EligibilityChecker.evaluate(ineligible_scheme, profile)
    assert res2["status"] == "Not eligible based on verified criteria"
    assert len(res2["verified_failed"]) >= 1

    # 3. Unverified Listing (Potential Match)
    unverified_scheme = Scheme(
        scheme_id="UNVER-003",
        scheme_name="Unverified Opportunity",
        minimum_age=18,
        eligibility_rule_verification="unverified listing"
    )
    res3 = EligibilityChecker.evaluate(unverified_scheme, profile)
    assert res3["status"] == "Potential match"

    # 4. More Information Needed
    profile_missing_age = UserProfile(state="Kerala", annual_income_inr=100000.0)
    res4 = EligibilityChecker.evaluate(verified_scheme, profile_missing_age)
    assert res4["status"] == "More information needed"
    assert any("age" in msg.lower() for msg in res4["missing_info"])
