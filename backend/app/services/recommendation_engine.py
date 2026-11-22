from typing import List, Dict, Any, Optional, Tuple
import re
from app.models.profile import UserProfile
from app.models.scheme import Scheme
from app.models.recommendation import RecommendationItem, RecommendationResponse
from app.services.eligibility_checker import EligibilityChecker

class RecommendationEngine:
    @staticmethod
    def calculate_relevance(scheme: Scheme, profile: UserProfile) -> Tuple[int, List[str], str]:
        """
        Calculates how closely a scheme matches the user's search interests (0 - 100).
        This measures topical relevance, NOT legal eligibility.
        """
        score = 0
        matched_attributes = []
        reasons = []

        # Text corpora for matching
        scheme_text = " ".join([
            scheme.scheme_name or "",
            scheme.sector or "",
            scheme.scheme_purpose or "",
            scheme.benefit_summary or "",
            scheme.intended_beneficiaries or "",
            scheme.record_type or ""
        ]).lower()

        # 1. Assistance Category Matching (Up to 40 pts)
        assistance_keywords = {
            "scholarships": ["scholarship", "fellowship", "stipend", "merit", "nsp", "educational assistance"],
            "education funding": ["education", "tuition", "school", "college", "degree", "coaching", "hostel"],
            "skill development": ["skill", "training", "vocational", "apprenticeship", "pmkvy"],
            "employment and training": ["employment", "job", "career", "placement", "unemployed", "allowance"],
            "business assistance": ["business", "msme", "startup", "entrepreneur", "loan", "credit", "subsidy"],
            "agriculture": ["farmer", "agriculture", "kisan", "crop", "fisheries", "rural"],
            "healthcare": ["health", "medical", "treatment", "hospital", "ayushman", "insurance"],
            "housing": ["housing", "awas", "shelter", "construction"],
            "women and child welfare": ["women", "girl", "child", "maternity", "widow", "mahila"],
            "senior citizen assistance": ["senior", "elderly", "pension", "vridha", "age"]
        }

        category_matched = False
        user_categories = [c.lower() for c in profile.assistance_categories]
        if "all available opportunities" in user_categories or not user_categories:
            score += 25
            matched_attributes.append("All categories preference")
        else:
            for cat in user_categories:
                keywords = assistance_keywords.get(cat, [cat])
                if any(kw in scheme_text for kw in keywords):
                    score += 35
                    category_matched = True
                    matched_attributes.append(f"Matches assistance interest: '{cat.title()}'")
                    reasons.append(f"designed for {cat.title()}")
                    break

        # 2. Employment & Education Context (Up to 25 pts)
        emp_status = (profile.employment_status or "").lower()
        if emp_status == "student":
            if any(k in scheme_text for k in ["student", "scholarship", "fellowship", "education", "course", "nsp", "undergraduate"]):
                score += 25
                matched_attributes.append("Student status matches educational focus")
                reasons.append("supports active students")
        elif emp_status in ("unemployed", "job seeker"):
            if any(k in scheme_text for k in ["unemployed", "training", "skill", "employment", "placement"]):
                score += 25
                matched_attributes.append("Matches job seeker / employment support")
                reasons.append("offers employment/skilling support")
        elif emp_status in ("self-employed", "business"):
            if any(k in scheme_text for k in ["business", "credit", "entrepreneur", "msme", "subsidy"]):
                score += 25
                matched_attributes.append("Matches self-employed / business support")
                reasons.append("provides entrepreneurial backing")

        # 3. Geographic Relevance & Scope (Up to 20 pts)
        scheme_state = (scheme.state_or_ut or "").strip().lower()
        user_state = (profile.state or "").strip().lower()

        if scheme_state == user_state:
            score += 20
            matched_attributes.append(f"Specific to your state: {profile.state}")
            reasons.append(f"specifically created for {profile.state} residents")
        elif scheme.government_level and scheme.government_level.lower() == "central":
            score += 15
            matched_attributes.append("Central government initiative accessible across India")
            reasons.append("a Central Government program")
        elif scheme_state in ("all india", "india", "india (subject to scheme-specific restrictions)"):
            score += 15
            matched_attributes.append("National coverage")

        # 4. Target Beneficiary keywords (Up to 15 pts)
        beneficiaries = (scheme.intended_beneficiaries or "").lower()
        if "wards of" in beneficiaries and "police" in beneficiaries:
            matched_attributes.append("Special category: Wards of Police/Security Personnel")
        elif "girl" in beneficiaries or "women" in beneficiaries:
            matched_attributes.append("Targeted at Women / Girls")
        elif "minority" in beneficiaries:
            matched_attributes.append("Targeted at Minority communities")
        elif "sc" in beneficiaries or "st" in beneficiaries or "obc" in beneficiaries:
            matched_attributes.append("Targeted at Specific Social Categories")

        # Baseline adjustment and clamping
        if not category_matched and not reasons:
            score = max(score, 15)
        score = min(max(score, 10), 98)

        why_text = f"This scheme is recommended because it is {', '.join(reasons) if reasons else 'a relevant public opportunity matching your profile'}."
        return score, matched_attributes, why_text

    @classmethod
    def rank_and_evaluate(cls, schemes_data: List[Dict[str, Any]], profile: UserProfile) -> RecommendationResponse:
        recommendations = []
        verified_count = 0
        potential_count = 0
        more_info_count = 0
        not_eligible_count = 0

        user_state_lower = profile.state.lower().strip()

        for raw in schemes_data:
            scheme = Scheme(**raw)
            
            # Geographic filter: Keep if Central OR matches user's state OR nationwide
            s_state = (scheme.state_or_ut or "").lower().strip()
            s_gov = (scheme.government_level or "").lower().strip()
            
            is_state_match = (s_state == user_state_lower)
            is_national = s_state in ("all india", "india", "india (subject to scheme-specific restrictions)") or s_gov == "central"
            
            # If it's a state scheme for a DIFFERENT state, filter out
            if s_gov == "state" and s_state and not is_state_match and not is_national:
                continue

            # Calculate Relevance Score
            rel_score, matched_attrs, why_rec = cls.calculate_relevance(scheme, profile)

            # Evaluate Deterministic Eligibility
            elig_res = EligibilityChecker.evaluate(scheme, profile)
            status = elig_res["status"]

            if status == "Eligible based on verified criteria":
                verified_count += 1
            elif status == "Potential match":
                potential_count += 1
            elif status == "More information needed":
                more_info_count += 1
            elif status == "Not eligible based on verified criteria":
                not_eligible_count += 1

            # Prepare next steps guidance
            if scheme.official_application_url:
                next_step = f"Review official guidelines on the portal and verify eligibility criteria before applying: {scheme.official_application_url}"
            elif scheme.source_url:
                next_step = f"Check the listing source at {scheme.source_url} to confirm current application rules and dates."
            else:
                next_step = "Check the responsible ministry or department portal for active application notifications."

            item = RecommendationItem(
                scheme=scheme,
                relevance_score=rel_score,
                eligibility_status=status,
                why_recommended=why_rec,
                matched_profile_attributes=matched_attrs,
                verified_satisfied_conditions=elig_res["verified_satisfied"],
                verified_failed_conditions=elig_res["verified_failed"],
                unverified_conditions=elig_res["unverified_conditions"],
                missing_information=elig_res["missing_info"],
                next_steps=next_step,
                source_url=scheme.source_url,
                official_application_url=scheme.official_application_url
            )
            recommendations.append(item)

        # Sort primarily by relevance score descending, with verified eligibility taking precedence
        status_weights = {
            "Eligible based on verified criteria": 4,
            "Potential match": 3,
            "More information needed": 2,
            "Not eligible based on verified criteria": 1
        }
        recommendations.sort(
            key=lambda x: (status_weights.get(x.eligibility_status, 0), x.relevance_score),
            reverse=True
        )

        user_summary = {
            "age": profile.age,
            "state": profile.state,
            "education": profile.education_level or "Not specified",
            "employment": profile.employment_status or "Not specified",
            "income": f"₹{profile.annual_income_inr:,.0f}" if profile.annual_income_inr else "Not specified",
            "interests": profile.assistance_categories
        }

        return RecommendationResponse(
            total_opportunities=len(recommendations),
            verified_eligible_count=verified_count,
            potential_match_count=potential_count,
            more_info_needed_count=more_info_count,
            not_eligible_count=not_eligible_count,
            recommendations=recommendations,
            user_summary=user_summary
        )
