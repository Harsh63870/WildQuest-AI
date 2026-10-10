from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database tables automatically at startup
    init_db()
    yield
    # Cleanup if needed

app = FastAPI(
    title="WildQuest AI API",
    description="Privacy-first nature exploration companion powered by local open-weight AI.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes under /api
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": "WildQuest AI",
        "description": "Less scrolling. More discovering.",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
