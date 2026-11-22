from fastapi import APIRouter
from app.models.chat import AIChatRequest, AIChatResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_assistant(req: AIChatRequest):
    return AIService.answer_query(req)
