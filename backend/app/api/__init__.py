from fastapi import APIRouter
from app.api.routes_health import router as health_router
from app.api.routes_quests import router as quests_router
from app.api.routes_sessions import router as sessions_router
from app.api.routes_journal import router as journal_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(quests_router)
api_router.include_router(sessions_router)
api_router.include_router(journal_router)

__all__ = ["api_router"]
