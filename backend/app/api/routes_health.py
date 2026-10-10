from fastapi import APIRouter
from app.services.ai_service import AIService

router = APIRouter(tags=["Health & Status"])
ai_service = AIService()

@router.get("/health")
async def get_health():
    """Application health endpoint."""
    return {
        "status": "healthy",
        "service": "WildQuest AI",
        "version": "1.0.0",
        "privacy": "local-first",
        "telemetry": "disabled"
    }

@router.get("/ai/status")
async def get_ai_status():
    """Live Ollama and AI model status."""
    return await ai_service.get_status()
