import json
import re

def clean_val(v):
    if v is None:
        return 'NULL'
    s = str(v).strip()
    if not s or s.lower() == 'null' or s.lower() == 'unknown':
        return 'NULL'
    # Escape single quotes
    s_escaped = s.replace("'", "''")
    return f"'{s_escaped}'"

def clean_num(v):
    if v is None:
        return 'NULL'
    s = str(v).strip()
    if not s:
        return 'NULL'
    # Match digits
    m = re.search(r'\d+(\.\d+)?', s.replace(',', ''))
    if m:
        return m.group(0)
    return 'NULL'

def clean_int(v):
    if v is None:
        return 'NULL'
    s = str(v).strip()
    if not s:
        return 'NULL'
    m = re.search(r'\d+', s)
    if m:
        return m.group(0)
    return 'NULL'

with open('india_official_government_schemes_200plus (2).json', 'r', encoding='utf-8', errors='ignore') as f:
    data = json.load(f)

sql_statements = []
sql_statements.append("-- Seed 251 government schemes\n")

for row in data:
    scheme_id = clean_val(row.get('scheme_id'))
    scheme_name = clean_val(row.get('scheme_name'))
    record_type = clean_val(row.get('record_type'))
    government_level = clean_val(row.get('government_level'))
    state_or_ut = clean_val(row.get('state_or_ut'))
    sector = clean_val(row.get('sector'))
    implementing_authority = clean_val(row.get('implementing_authority'))
    intended_beneficiaries = clean_val(row.get('intended_beneficiaries'))
    scheme_purpose = clean_val(row.get('scheme_purpose'))
    benefit_summary = clean_val(row.get('benefit_summary'))
    benefit_amount_inr = clean_num(row.get('benefit_amount_inr'))
    minimum_age = clean_int(row.get('minimum_age'))
    maximum_age = clean_int(row.get('maximum_age'))
    maximum_annual_family_income_inr = clean_num(row.get('maximum_annual_family_income_inr'))
    education_requirement = clean_val(row.get('education_requirement'))
    social_category_requirement = clean_val(row.get('social_category_requirement'))
    residency_requirement = clean_val(row.get('residency_requirement'))
    other_eligibility_conditions = clean_val(row.get('other_eligibility_conditions'))
    required_documents = clean_val(row.get('required_documents'))
    application_mode = clean_val(row.get('application_mode'))
    official_application_url = clean_val(row.get('official_application_url'))
    opening_date = clean_val(row.get('opening_date'))
    application_deadline = clean_val(row.get('application_deadline'))
    academic_or_financial_year = clean_val(row.get('academic_or_financial_year'))
    application_status = clean_val(row.get('application_status'))
    source_url = clean_val(row.get('source_url'))
    source_organisation = clean_val(row.get('source_organisation'))
    source_accessed_on = clean_val(row.get('source_accessed_on'))
    listing_evidence = clean_val(row.get('listing_evidence'))
    eligibility_rule_verification = clean_val(row.get('eligibility_rule_verification'))
    review_priority = clean_val(row.get('review_priority'))
    research_notes = clean_val(row.get('research_notes'))
    
    stmt = f"""INSERT INTO public.schemes (
        scheme_id, scheme_name, record_type, government_level, state_or_ut, sector,
        implementing_authority, intended_beneficiaries, scheme_purpose, benefit_summary,
        benefit_amount_inr, minimum_age, maximum_age, maximum_annual_family_income_inr,
        education_requirement, social_category_requirement, residency_requirement,
        other_eligibility_conditions, required_documents, application_mode,
        official_application_url, opening_date, application_deadline,
        academic_or_financial_year, application_status, source_url, source_organisation,
        source_accessed_on, listing_evidence, eligibility_rule_verification,
        review_priority, research_notes, workflow_status
    ) VALUES (
        {scheme_id}, {scheme_name}, {record_type}, {government_level}, {state_or_ut}, {sector},
        {implementing_authority}, {intended_beneficiaries}, {scheme_purpose}, {benefit_summary},
        {benefit_amount_inr}, {minimum_age}, {maximum_age}, {maximum_annual_family_income_inr},
        {education_requirement}, {social_category_requirement}, {residency_requirement},
        {other_eligibility_conditions}, {required_documents}, {application_mode},
        {official_application_url}, {opening_date}, {application_deadline},
        {academic_or_financial_year}, {application_status}, {source_url}, {source_organisation},
        {source_accessed_on}, {listing_evidence}, {eligibility_rule_verification},
        {review_priority}, {research_notes}, 'published'
    ) ON CONFLICT (scheme_id) DO UPDATE SET
        scheme_name = EXCLUDED.scheme_name,
        sector = EXCLUDED.sector,
        state_or_ut = EXCLUDED.state_or_ut,
        government_level = EXCLUDED.government_level,
        benefit_summary = EXCLUDED.benefit_summary,
        updated_at = NOW();"""
    sql_statements.append(stmt)

with open('supabase/seed.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated seed.sql with {len(data)} statements")
