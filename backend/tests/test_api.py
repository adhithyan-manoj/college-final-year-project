import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

def test_dynamic_questions_step1():
    res = client.post("/api/questions/next", json={"current_step": 1, "answers": {}})
    assert res.status_code == 200
    data = res.json()
    assert data["step"] == 1
    assert data["total_steps"] == 5
    assert len(data["questions"]) >= 2
    assert any(q["id"] == "age" for q in data["questions"])

def test_ai_chat_offline_fallback():
    # Chat must work deterministically even when Gemini key is not configured
    payload = {
        "message": "What scholarships are available for college students?",
        "language": "en"
    }
    res = client.post("/api/ai/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert "citations" in data
    assert data["is_grounded"] is True

def test_ai_chat_malayalam():
    payload = {
        "message": "കേരളത്തിലെ വിദ്യാർത്ഥികൾക്കുള്ള സ്കോളർഷിപ്പുകൾ ഏതെല്ലാമാണ്?",
        "language": "ml"
    }
    res = client.post("/api/ai/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["language"] == "ml"
    assert len(data["reply"]) > 20
