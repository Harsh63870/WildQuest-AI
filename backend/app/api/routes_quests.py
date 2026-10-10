from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from app.schemas.quest import (
    QuestGenerateRequest,
    QuestGenerateResponse,
    VALID_ENVIRONMENTS,
    VALID_INTERESTS,
    VALID_EXPERIENCE
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/quests", tags=["Quests"])
ai_service = AIService()

@router.get("/categories")
async def get_categories() -> Dict[str, Any]:
    """Retrieve available environments, interests, and experience levels."""
    return {
        "environments": VALID_ENVIRONMENTS,
        "interests": VALID_INTERESTS,
        "experience_levels": VALID_EXPERIENCE,
        "time_options_minutes": [10, 20, 30]
    }

@router.post("/generate", response_model=QuestGenerateResponse)
async def generate_quests(request: QuestGenerateRequest):
    """
    Generate customized outdoor exploration quests using Ollama
    with automatic fallback to deterministic nature templates.
    """
    try:
        response = await ai_service.generate_quests(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quests: {str(e)}"
        )
