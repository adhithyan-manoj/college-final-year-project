import json
import csv
import re
from typing import Dict, Any, List, Tuple, Optional
import requests

def clean_str(val: Any) -> Optional[str]:
    if val is None:
        return None
    s = str(val).strip()
    if not s or s.lower() in ('null', 'none', 'unknown', 'n/a', 'na'):
        return None
    return s

def clean_int(val: Any) -> Optional[int]:
    if val is None:
        return None
    s = str(val).strip()
    if not s:
        return None
    m = re.search(r'\d+', s)
    if m:
        try:
            return int(m.group(0))
        except ValueError:
            return None
    return None

def clean_num(val: Any) -> Optional[float]:
    if val is None:
        return None
    s = str(val).strip().replace(',', '')
    if not s:
        return None
    m = re.search(r'\d+(\.\d+)?', s)
    if m:
        try:
            return float(m.group(0))
        except ValueError:
            return None
    return None

def validate_and_transform_record(row: Dict[str, Any]) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    scheme_id = clean_str(row.get('scheme_id'))
    if not scheme_id:
        return None, "Missing scheme_id"
    
    scheme_name = clean_str(row.get('scheme_name'))
    if not scheme_name:
        return None, f"Scheme {scheme_id} missing scheme_name"

    record = {
        "scheme_id": scheme_id,
        "scheme_name": scheme_name,
        "record_type": clean_str(row.get('record_type')),
        "government_level": clean_str(row.get('government_level')),
        "state_or_ut": clean_str(row.get('state_or_ut')),
        "sector": clean_str(row.get('sector')),
        "implementing_authority": clean_str(row.get('implementing_authority')),
        "intended_beneficiaries": clean_str(row.get('intended_beneficiaries')),
        "scheme_purpose": clean_str(row.get('scheme_purpose')),
        "benefit_summary": clean_str(row.get('benefit_summary')),
        "benefit_amount_inr": clean_num(row.get('benefit_amount_inr')),
        "minimum_age": clean_int(row.get('minimum_age')),
        "maximum_age": clean_int(row.get('maximum_age')),
        "maximum_annual_family_income_inr": clean_num(row.get('maximum_annual_family_income_inr')),
        "education_requirement": clean_str(row.get('education_requirement')),
        "social_category_requirement": clean_str(row.get('social_category_requirement')),
        "residency_requirement": clean_str(row.get('residency_requirement')),
        "other_eligibility_conditions": clean_str(row.get('other_eligibility_conditions')),
        "required_documents": clean_str(row.get('required_documents')),
        "application_mode": clean_str(row.get('application_mode')),
        "official_application_url": clean_str(row.get('official_application_url')),
        "opening_date": clean_str(row.get('opening_date')),
        "application_deadline": clean_str(row.get('application_deadline')),
        "academic_or_financial_year": clean_str(row.get('academic_or_financial_year')),
        "application_status": clean_str(row.get('application_status')),
        "source_url": clean_str(row.get('source_url')),
        "source_organisation": clean_str(row.get('source_organisation')),
        "source_accessed_on": clean_str(row.get('source_accessed_on')),
        "listing_evidence": clean_str(row.get('listing_evidence')),
        "eligibility_rule_verification": clean_str(row.get('eligibility_rule_verification')),
        "review_priority": clean_str(row.get('review_priority')),
        "research_notes": clean_str(row.get('research_notes')),
        "workflow_status": "published"
    }
    return record, None

def import_records_to_supabase(
    records: List[Dict[str, Any]],
    supabase_url: str,
    supabase_key: str,
    batch_size: int = 50
) -> Dict[str, Any]:
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
    }
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/schemes"

    total = len(records)
    inserted = 0
    errors = []
    seen_ids = set()
    cleaned_records = []

    for idx, raw in enumerate(records):
        cleaned, err = validate_and_transform_record(raw)
        if err:
            errors.append(f"Row {idx}: {err}")
            continue
        sid = cleaned['scheme_id']
        if sid in seen_ids:
            errors.append(f"Row {idx}: Duplicate scheme_id {sid} skipped")
            continue
        seen_ids.add(sid)
        cleaned_records.append(cleaned)

    # Batch insert into Supabase
    for i in range(0, len(cleaned_records), batch_size):
        chunk = cleaned_records[i:i + batch_size]
        res = requests.post(endpoint, headers=headers, json=chunk)
        if res.status_code in (200, 201):
            inserted += len(chunk)
        else:
            errors.append(f"Batch {i//batch_size + 1} failed: HTTP {res.status_code} - {res.text}")

    # Also generate initial sources & rules
    sources_to_insert = []
    rules_to_insert = []
    for r in cleaned_records:
        sid = r['scheme_id']
        if r.get('source_url'):
            sources_to_insert.append({
                "scheme_id": sid,
                "organisation": r.get('source_organisation'),
                "url": r['source_url'],
                "verification_status": r.get('listing_evidence') or 'unverified'
            })
        if r.get('minimum_age') is not None:
            rules_to_insert.append({
                "scheme_id": sid,
                "criterion_type": "age_min",
                "operator": "gte",
                "criterion_value": str(r['minimum_age']),
                "is_mandatory": True,
                "is_verified": bool(r.get('eligibility_rule_verification') and 'verified' in str(r.get('eligibility_rule_verification')).lower())
            })
        if r.get('maximum_age') is not None:
            rules_to_insert.append({
                "scheme_id": sid,
                "criterion_type": "age_max",
                "operator": "lte",
                "criterion_value": str(r['maximum_age']),
                "is_mandatory": True,
                "is_verified": bool(r.get('eligibility_rule_verification') and 'verified' in str(r.get('eligibility_rule_verification')).lower())
            })
        if r.get('maximum_annual_family_income_inr') is not None:
            rules_to_insert.append({
                "scheme_id": sid,
                "criterion_type": "income_max",
                "operator": "lte",
                "criterion_value": str(r['maximum_annual_family_income_inr']),
                "is_mandatory": True,
                "is_verified": bool(r.get('eligibility_rule_verification') and 'verified' in str(r.get('eligibility_rule_verification')).lower())
            })

    if sources_to_insert:
        s_endpoint = f"{supabase_url.rstrip('/')}/rest/v1/scheme_sources"
        requests.post(s_endpoint, headers=headers, json=sources_to_insert[:50])

    if rules_to_insert:
        r_endpoint = f"{supabase_url.rstrip('/')}/rest/v1/scheme_eligibility_rules"
        requests.post(r_endpoint, headers=headers, json=rules_to_insert)

    return {
        "total_input_records": total,
        "successfully_imported": inserted,
        "unique_schemes": len(seen_ids),
        "errors_count": len(errors),
        "errors": errors[:10]  # First 10 errors
    }

def load_file_and_import(file_path: str, supabase_url: str, supabase_key: str) -> Dict[str, Any]:
    if file_path.endswith('.json'):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            data = json.load(f)
    elif file_path.endswith('.csv'):
        data = []
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
    else:
        raise ValueError("Unsupported file format. Must be .json or .csv")

    return import_records_to_supabase(data, supabase_url, supabase_key)
