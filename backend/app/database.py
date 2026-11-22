from typing import List, Dict, Any, Optional
import requests
from app.config import settings

class SupabaseClient:
    def __init__(self):
        self.url = settings.SUPABASE_URL.rstrip('/')
        self.key = settings.SUPABASE_KEY
        self.headers = {
            'apikey': self.key,
            'Authorization': f'Bearer {self.key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }

    def get_schemes(self, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        endpoint = f"{self.url}/rest/v1/schemes"
        res = requests.get(endpoint, headers=self.headers, params=params or {})
        if res.status_code == 200:
            return res.json()
        return []

    def get_scheme_by_id(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        endpoint = f"{self.url}/rest/v1/schemes"
        res = requests.get(endpoint, headers=self.headers, params={"scheme_id": f"eq.{scheme_id}"})
        if res.status_code == 200:
            items = res.json()
            return items[0] if items else None
        return None

    def update_scheme(self, scheme_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        endpoint = f"{self.url}/rest/v1/schemes"
        headers = {**self.headers, 'Prefer': 'return=representation'}
        res = requests.patch(endpoint, headers=headers, params={"scheme_id": f"eq.{scheme_id}"}, json=updates)
        if res.status_code in (200, 204):
            items = res.json() if res.text else []
            return items[0] if items else updates
        return None

    def insert_scheme(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        endpoint = f"{self.url}/rest/v1/schemes"
        res = requests.post(endpoint, headers=self.headers, json=data)
        if res.status_code in (200, 201):
            items = res.json()
            return items[0] if items else data
        return None

    def get_rules_for_scheme(self, scheme_id: str) -> List[Dict[str, Any]]:
        endpoint = f"{self.url}/rest/v1/scheme_eligibility_rules"
        res = requests.get(endpoint, headers=self.headers, params={"scheme_id": f"eq.{scheme_id}"})
        if res.status_code == 200:
            return res.json()
        return []

    def log_verification_history(self, log_entry: Dict[str, Any]) -> bool:
        endpoint = f"{self.url}/rest/v1/scheme_verification_history"
        res = requests.post(endpoint, headers=self.headers, json=log_entry)
        return res.status_code in (200, 201)

    def save_scheme_for_user(self, user_id: str, scheme_id: str) -> bool:
        endpoint = f"{self.url}/rest/v1/saved_schemes"
        headers = {**self.headers, 'Prefer': 'resolution=merge-duplicates'}
        res = requests.post(endpoint, headers=headers, json={"user_id": user_id, "scheme_id": scheme_id})
        return res.status_code in (200, 201)

    def get_saved_schemes(self, user_id: str) -> List[Dict[str, Any]]:
        endpoint = f"{self.url}/rest/v1/saved_schemes"
        res = requests.get(endpoint, headers=self.headers, params={"user_id": f"eq.{user_id}", "select": "*,schemes(*)"})
        if res.status_code == 200:
            return res.json()
        return []

    def remove_saved_scheme(self, user_id: str, scheme_id: str) -> bool:
        endpoint = f"{self.url}/rest/v1/saved_schemes"
        res = requests.delete(endpoint, headers=self.headers, params={"user_id": f"eq.{user_id}", "scheme_id": f"eq.{scheme_id}"})
        return res.status_code in (200, 204)

    def update_checklist_status(self, user_id: str, scheme_id: str, status: str, notes: Optional[str] = None) -> bool:
        endpoint = f"{self.url}/rest/v1/application_checklists"
        headers = {**self.headers, 'Prefer': 'resolution=merge-duplicates'}
        res = requests.post(endpoint, headers=headers, json={
            "user_id": user_id,
            "scheme_id": scheme_id,
            "status": status,
            "notes": notes
        })
        return res.status_code in (200, 201)

    def get_checklist(self, user_id: str) -> List[Dict[str, Any]]:
        endpoint = f"{self.url}/rest/v1/application_checklists"
        res = requests.get(endpoint, headers=self.headers, params={"user_id": f"eq.{user_id}", "select": "*,schemes(*)"})
        if res.status_code == 200:
            return res.json()
        return []

    def create_report(self, report_data: Dict[str, Any]) -> bool:
        endpoint = f"{self.url}/rest/v1/scheme_reports"
        res = requests.post(endpoint, headers=self.headers, json=report_data)
        return res.status_code in (200, 201)

    def get_reports(self) -> List[Dict[str, Any]]:
        endpoint = f"{self.url}/rest/v1/scheme_reports"
        res = requests.get(endpoint, headers=self.headers, params={"order": "created_at.desc"})
        if res.status_code == 200:
            return res.json()
        return []

db = SupabaseClient()
