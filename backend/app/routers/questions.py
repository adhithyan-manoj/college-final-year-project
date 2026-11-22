from fastapi import APIRouter
from app.models.profile import DynamicQuestionRequest, DynamicQuestionResponse
from app.services.questionnaire_engine import QuestionnaireEngine

router = APIRouter(prefix="/api/questions", tags=["Dynamic Questionnaire"])

@router.post("/next", response_model=DynamicQuestionResponse)
def get_next_questions(req: DynamicQuestionRequest):
    return QuestionnaireEngine.get_questions_for_step(req.current_step, req.answers)
