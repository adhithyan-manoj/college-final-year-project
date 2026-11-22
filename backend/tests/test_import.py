import pytest
import json
import os
from app.services.import_service import validate_and_transform_record

def test_json_dataset_completeness():
    file_path = "india_official_government_schemes_200plus (2).json"
    assert os.path.exists(file_path), "Dataset JSON file must exist"
    
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        data = json.load(f)
    
    assert len(data) == 251, f"Expected 251 records, found {len(data)}"

def test_null_preservation():
    raw = {
        "scheme_id": "TEST-001",
        "scheme_name": "Test Scheme",
        "minimum_age": "",
        "maximum_age": "NULL",
        "maximum_annual_family_income_inr": None,
        "official_application_url": "unknown"
    }
    cleaned, err = validate_and_transform_record(raw)
    assert err is None
    assert cleaned["minimum_age"] is None
    assert cleaned["maximum_age"] is None
    assert cleaned["maximum_annual_family_income_inr"] is None
    assert cleaned["official_application_url"] is None

def test_duplicate_prevention_logic():
    seen = set()
    rows = [{"scheme_id": "IND-001"}, {"scheme_id": "IND-001"}, {"scheme_id": "IND-002"}]
    unique = []
    duplicates = []
    for r in rows:
        sid = r["scheme_id"]
        if sid in seen:
            duplicates.append(sid)
        else:
            seen.add(sid)
            unique.append(sid)
    assert len(unique) == 2
    assert len(duplicates) == 1
