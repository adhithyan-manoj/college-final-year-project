from typing import Dict, Any, List, Tuple
from app.models.profile import UserProfile
from app.models.scheme import Scheme

class EligibilityChecker:
    @staticmethod
    def evaluate(scheme: Scheme, profile: UserProfile) -> Dict[str, Any]:
        """
        Deterministic, rule-based eligibility evaluation.
        Only verified requirements can lead to 'Eligible based on verified criteria' or 'Not eligible'.
        Incomplete/unverified listings are classified as 'Potential match' or 'More information needed'.
        Missing limits (income, age) are NEVER interpreted as unrestricted eligibility.
        """
        verified_satisfied = []
        verified_failed = []
        unverified_conditions = []
        missing_info = []

        is_rule_verified = bool(
            scheme.eligibility_rule_verification and 
            'verified' in str(scheme.eligibility_rule_verification).lower()
        )

        # 1. Geographic / State Residency Requirement
        state_req = (scheme.state_or_ut or '').strip()
        gov_level = (scheme.government_level or '').strip().lower()

        if gov_level == 'state' and state_req and state_req.lower() not in ('all india', 'india'):
            if profile.state.lower() != state_req.lower():
                if is_rule_verified:
                    verified_failed.append(f"Restricted to residents of {state_req} (User lives in {profile.state})")
                else:
                    unverified_conditions.append(f"State restriction to {state_req} requires verification (User is from {profile.state})")
            else:
                if is_rule_verified:
                    verified_satisfied.append(f"Satisfies state residency requirement for {state_req}")
                else:
                    unverified_conditions.append(f"State listed as {state_req} (matches user location, but specific residency proof unverified)")

        # 2. Minimum Age Check
        if scheme.minimum_age is not None:
            if profile.age is None:
                missing_info.append(f"Minimum age requirement ({scheme.minimum_age} years) requires your age")
            elif profile.age < scheme.minimum_age:
                if is_rule_verified:
                    verified_failed.append(f"Minimum age is {scheme.minimum_age} (User is {profile.age})")
                else:
                    unverified_conditions.append(f"Listed minimum age {scheme.minimum_age} (unverified rule)")
            else:
                if is_rule_verified:
                    verified_satisfied.append(f"Age {profile.age} meets verified minimum age requirement (>= {scheme.minimum_age})")
                else:
                    unverified_conditions.append(f"Age {profile.age} appears above listed minimum {scheme.minimum_age} (unverified)")
        else:
            unverified_conditions.append("Minimum age limit is not officially specified in dataset")

        # 3. Maximum Age Check
        if scheme.maximum_age is not None:
            if profile.age is None:
                missing_info.append(f"Maximum age limit ({scheme.maximum_age} years) requires your age")
            elif profile.age > scheme.maximum_age:
                if is_rule_verified:
                    verified_failed.append(f"Exceeds maximum age limit of {scheme.maximum_age} (User is {profile.age})")
                else:
                    unverified_conditions.append(f"Exceeds listed maximum age {scheme.maximum_age} (unverified rule)")
            else:
                if is_rule_verified:
                    verified_satisfied.append(f"Age {profile.age} meets verified maximum age limit (<= {scheme.maximum_age})")
                else:
                    unverified_conditions.append(f"Age {profile.age} appears below listed maximum {scheme.maximum_age} (unverified)")
        else:
            unverified_conditions.append("Maximum age limit is not officially specified in dataset")

        # 4. Income Limit Check
        if scheme.maximum_annual_family_income_inr is not None:
            if profile.annual_income_inr is None:
                missing_info.append(f"Income ceiling of ₹{scheme.maximum_annual_family_income_inr:,.0f} requires your annual family income")
            elif profile.annual_income_inr > scheme.maximum_annual_family_income_inr:
                if is_rule_verified:
                    verified_failed.append(f"Annual family income ₹{profile.annual_income_inr:,.0f} exceeds limit ₹{scheme.maximum_annual_family_income_inr:,.0f}")
                else:
                    unverified_conditions.append(f"Income ₹{profile.annual_income_inr:,.0f} exceeds listed limit ₹{scheme.maximum_annual_family_income_inr:,.0f} (unverified)")
            else:
                if is_rule_verified:
                    verified_satisfied.append(f"Income ₹{profile.annual_income_inr:,.0f} is within verified ceiling ₹{scheme.maximum_annual_family_income_inr:,.0f}")
                else:
                    unverified_conditions.append(f"Income within listed limit ₹{scheme.maximum_annual_family_income_inr:,.0f} (unverified)")
        else:
            unverified_conditions.append("Annual family income ceiling is unverified/not specified in dataset")

        # 5. Education & Social Category Check
        if scheme.education_requirement:
            unverified_conditions.append(f"Education requirement listed: '{scheme.education_requirement}' (Verification needed)")
            if not profile.education_level:
                missing_info.append("Your educational qualification is required to verify eligibility")

        if scheme.social_category_requirement:
            unverified_conditions.append(f"Category requirement listed: '{scheme.social_category_requirement}' (Verification needed)")
            if not profile.social_category:
                missing_info.append("Social category criteria may apply (Optional to answer)")

        if scheme.other_eligibility_conditions:
            unverified_conditions.append(f"Additional conditions: '{scheme.other_eligibility_conditions[:100]}...'")

        # Determine Final Status according to project requirements:
        # - "Eligible based on verified criteria": Every applicable mandatory condition verified and satisfied, no missing mandatory information.
        # - "Not eligible based on verified criteria": A verified mandatory requirement is not satisfied.
        # - "More information needed": Verified conditions exist, but necessary user answers are missing.
        # - "Potential match": The scheme is relevant, but some eligibility requirements are unverified.

        if verified_failed:
            status = "Not eligible based on verified criteria"
            summary = "One or more verified mandatory requirements are not satisfied based on your profile."
        elif is_rule_verified and verified_satisfied and not missing_info and not unverified_conditions:
            status = "Eligible based on verified criteria"
            summary = "All verified mandatory criteria have been evaluated and satisfied."
        elif missing_info and is_rule_verified:
            status = "More information needed"
            summary = "This scheme has verified requirements that require additional profile details."
        else:
            status = "Potential match"
            summary = "Potential match — detailed eligibility requirements need verification against official scheme guidelines."

        return {
            "status": status,
            "summary": summary,
            "verified_satisfied": verified_satisfied,
            "verified_failed": verified_failed,
            "unverified_conditions": unverified_conditions,
            "missing_info": missing_info,
            "is_rule_verified": is_rule_verified
        }
