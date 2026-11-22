from typing import Dict, Any, List
from app.models.profile import DynamicQuestionRequest, DynamicQuestionResponse, QuestionItem, QuestionOption

class QuestionnaireEngine:
    @staticmethod
    def get_questions_for_step(step: int, answers: Dict[str, Any]) -> DynamicQuestionResponse:
        total_steps = 5
        questions: List[QuestionItem] = []

        if step == 1:
            # Step 1: Basic Details
            questions = [
                QuestionItem(
                    id="age",
                    title="What is your age?",
                    subtitle="Used to identify age-restricted government welfare programs and scholarships.",
                    type="number",
                    required=True,
                    category="basic",
                    explanation="Many scholarships and youth programs have strict minimum and maximum age criteria."
                ),
                QuestionItem(
                    id="state",
                    title="Which State or Union Territory do you reside in?",
                    subtitle="Determines eligibility for state-specific and domicile-based programs.",
                    type="select",
                    options=[
                        QuestionOption(label="Kerala", value="Kerala"),
                        QuestionOption(label="Tamil Nadu", value="Tamil Nadu"),
                        QuestionOption(label="Karnataka", value="Karnataka"),
                        QuestionOption(label="Maharashtra", value="Maharashtra"),
                        QuestionOption(label="Delhi", value="Delhi"),
                        QuestionOption(label="Andhra Pradesh", value="Andhra Pradesh"),
                        QuestionOption(label="Telangana", value="Telangana"),
                        QuestionOption(label="Uttar Pradesh", value="Uttar Pradesh"),
                        QuestionOption(label="West Bengal", value="West Bengal"),
                        QuestionOption(label="Other State / UT", value="Other")
                    ],
                    required=True,
                    category="basic",
                    explanation="Kerala residents are matched with Kerala state initiatives and All-India central programs."
                ),
                QuestionItem(
                    id="district",
                    title="District (Optional)",
                    subtitle="Some schemes provide localized district funding.",
                    type="text",
                    required=False,
                    category="basic"
                ),
                QuestionItem(
                    id="residence_type",
                    title="Area of Residence (Optional)",
                    subtitle="Helps find rural development or urban welfare programs.",
                    type="radio",
                    options=[
                        QuestionOption(label="Rural (Panchayat / Village)", value="rural"),
                        QuestionOption(label="Urban (Municipality / Corporation)", value="urban")
                    ],
                    required=False,
                    category="basic"
                )
            ]

        elif step == 2:
            # Step 2: Education and Employment
            employment_status = answers.get("employment_status", "").lower()
            
            questions.append(QuestionItem(
                id="highest_qualification",
                title="Highest Educational Qualification",
                subtitle="Select your completed or highest qualification level.",
                type="select",
                options=[
                    QuestionOption(label="Below 10th Standard", value="below_10th"),
                    QuestionOption(label="10th Pass (SSLC / Matric)", value="10th"),
                    QuestionOption(label="12th Pass (Higher Secondary)", value="12th"),
                    QuestionOption(label="Diploma / Polytechnic", value="diploma"),
                    QuestionOption(label="Undergraduate Degree (BA, BSc, BCom, BTech, BCA, etc.)", value="undergraduate"),
                    QuestionOption(label="Postgraduate Degree (MA, MSc, MCom, MCA, etc.)", value="postgraduate"),
                    QuestionOption(label="Doctorate / PhD", value="doctorate")
                ],
                required=True,
                category="education"
            ))

            questions.append(QuestionItem(
                id="employment_status",
                title="Current Occupation Status",
                subtitle="Select your current primary activity.",
                type="radio",
                options=[
                    QuestionOption(label="Student (Currently studying)", value="student"),
                    QuestionOption(label="Unemployed / Job Seeker", value="unemployed"),
                    QuestionOption(label="Employed (Salaried / Private / Govt)", value="employed"),
                    QuestionOption(label="Self-Employed / Freelancer / Business Owner", value="self_employed"),
                    QuestionOption(label="Retired", value="retired")
                ],
                required=True,
                category="employment"
            ))

            # Dynamic Sub-questions if Student
            if employment_status == "student" or not employment_status:
                questions.append(QuestionItem(
                    id="current_course",
                    title="Current Course of Study",
                    subtitle="e.g. BCA, B.Tech, BSc Computer Science, MBBS",
                    type="text",
                    required=False,
                    category="education",
                    explanation="Higher education scholarships often distinguish between general degree and professional/technical courses."
                ))
                questions.append(QuestionItem(
                    id="year_of_study",
                    title="Year of Study",
                    subtitle="e.g. 1st Year, 2nd Year, Final Year",
                    type="select",
                    options=[
                        QuestionOption(label="1st Year", value="1st_year"),
                        QuestionOption(label="2nd Year", value="2nd_year"),
                        QuestionOption(label="3rd / Final Year", value="3rd_year"),
                        QuestionOption(label="4th Year (Engineering / Professional)", value="4th_year")
                    ],
                    required=False,
                    category="education"
                ))
                questions.append(QuestionItem(
                    id="academic_marks_percent",
                    title="Previous Academic Marks Percentage (Optional)",
                    subtitle="Enter percentage if applying for merit-based scholarships (e.g. 75)",
                    type="number",
                    required=False,
                    category="education"
                ))

        elif step == 3:
            # Step 3: Financial Information
            questions = [
                QuestionItem(
                    id="annual_income_inr",
                    title="Annual Family Income (in INR)",
                    subtitle="Enter your family's gross annual income. Leave blank if unsure.",
                    type="number",
                    required=False,
                    category="financial",
                    explanation="Many government scholarships have income ceilings (e.g., ₹2,50,000 or ₹8,00,000 per year)."
                ),
                QuestionItem(
                    id="income_category",
                    title="Approximate Family Income Range",
                    subtitle="Helpful if you don't know the exact annual figure.",
                    type="select",
                    options=[
                        QuestionOption(label="Below ₹1.5 Lakh per year (EWS/BPL range)", value="below_1.5L"),
                        QuestionOption(label="₹1.5 Lakh - ₹3.0 Lakh per year", value="1.5L_3L"),
                        QuestionOption(label="₹3.0 Lakh - ₹6.0 Lakh per year", value="3L_6L"),
                        QuestionOption(label="₹6.0 Lakh - ₹8.0 Lakh per year (Non-Creamy Layer limit)", value="6L_8L"),
                        QuestionOption(label="Above ₹8.0 Lakh per year", value="above_8L")
                    ],
                    required=False,
                    category="financial"
                )
            ]

        elif step == 4:
            # Step 4: Assistance Needed
            assistance = answers.get("assistance_categories", [])
            questions.append(QuestionItem(
                id="assistance_categories",
                title="What type of assistance or support are you looking for?",
                subtitle="Select one or more categories that interest you.",
                type="multiselect",
                options=[
                    QuestionOption(label="Scholarships & Educational Assistance", value="scholarships"),
                    QuestionOption(label="Education Funding & Tuition Support", value="education funding"),
                    QuestionOption(label="Skill Development & Free Training", value="skill development"),
                    QuestionOption(label="Employment & Job Placement Programs", value="employment and training"),
                    QuestionOption(label="Business Loans, MSME & Startup Subsidies", value="business assistance"),
                    QuestionOption(label="Agriculture, Farming & Rural Support", value="agriculture"),
                    QuestionOption(label="Healthcare & Medical Insurance", value="healthcare"),
                    QuestionOption(label="Housing & Shelter Assistance", value="housing"),
                    QuestionOption(label="Women & Child Welfare Programs", value="women and child welfare"),
                    QuestionOption(label="Senior Citizen Welfare & Pensions", value="senior citizen assistance"),
                    QuestionOption(label="All Available Opportunities", value="all available opportunities")
                ],
                required=True,
                category="interests"
            ))

            # Dynamic branch if Agriculture selected
            if "agriculture" in assistance:
                questions.append(QuestionItem(
                    id="farming_type",
                    title="Farming / Agricultural Activity",
                    subtitle="Tell us about your agricultural involvement.",
                    type="select",
                    options=[
                        QuestionOption(label="Small / Marginal Farmer (< 2 hectares)", value="small_farmer"),
                        QuestionOption(label="Tenant / Sharecropper", value="tenant"),
                        QuestionOption(label="Fisheries / Aquaculture", value="fisheries"),
                        QuestionOption(label="Animal Husbandry / Dairy", value="dairy"),
                        QuestionOption(label="Horticulture / Plantations", value="horticulture")
                    ],
                    required=False,
                    category="agriculture"
                ))

            # Dynamic branch if Business selected
            if "business assistance" in assistance:
                questions.append(QuestionItem(
                    id="business_stage",
                    title="Business / Entrepreneurship Stage",
                    subtitle="Helps determine appropriate loan schemes (e.g. MUDRA, PMEGP).",
                    type="select",
                    options=[
                        QuestionOption(label="Idea / Planning Stage", value="ideation"),
                        QuestionOption(label="Early-Stage Startup (< 2 years)", value="early_stage"),
                        QuestionOption(label="Established Micro / Small Enterprise", value="established")
                    ],
                    required=False,
                    category="business"
                ))

        elif step == 5:
            # Step 5: Optional Eligibility Details
            questions = [
                QuestionItem(
                    id="social_category",
                    title="Social / Reservation Category (Optional)",
                    subtitle="Collected only to find dedicated government welfare quotas (SC, ST, OBC, EWS).",
                    type="select",
                    options=[
                        QuestionOption(label="Prefer not to say", value="prefer_not_to_say"),
                        QuestionOption(label="General Category", value="general"),
                        QuestionOption(label="OBC (Other Backward Classes)", value="obc"),
                        QuestionOption(label="SC (Scheduled Caste)", value="sc"),
                        QuestionOption(label="ST (Scheduled Tribe)", value="st"),
                        QuestionOption(label="EWS (Economically Weaker Section)", value="ews")
                    ],
                    required=False,
                    category="optional",
                    explanation="All sensitive fields are optional and strictly used for matching official eligibility guidelines."
                ),
                QuestionItem(
                    id="is_differently_abled",
                    title="Are you a person with benchmark disability (PwD)? (Optional)",
                    subtitle="Helps match specialized disability assistance, aids, and dedicated scholarships.",
                    type="radio",
                    options=[
                        QuestionOption(label="No", value="false"),
                        QuestionOption(label="Yes (40% or more benchmark disability)", value="true")
                    ],
                    required=False,
                    category="optional"
                ),
                QuestionItem(
                    id="minority_community",
                    title="Do you belong to a notified Religious Minority community? (Optional)",
                    subtitle="For Ministry of Minority Affairs (MOMA) scholarships (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).",
                    type="radio",
                    options=[
                        QuestionOption(label="No / Prefer not to say", value="none"),
                        QuestionOption(label="Yes", value="yes")
                    ],
                    required=False,
                    category="optional"
                )
            ]

        progress = int((step / total_steps) * 100)
        return DynamicQuestionResponse(
            step=step,
            total_steps=total_steps,
            questions=questions,
            progress_percentage=progress
        )
