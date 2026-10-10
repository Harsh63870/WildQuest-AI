from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

VALID_ENVIRONMENTS = ["campus", "garden", "park", "forest trail", "neighborhood"]
VALID_EXPERIENCE = ["beginner", "curious explorer"]
VALID_INTERESTS = ["plants", "birds", "insects", "weather", "textures", "sounds", "mindful observation"]

class QuestItem(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=2, max_length=120)
    description: str = Field(..., min_length=5, max_length=500)
    duration_minutes: int = Field(..., ge=1, le=30)
    difficulty: str = Field(default="easy")
    category: str = Field(..., min_length=2, max_length=60)
    observation_prompt: str = Field(..., min_length=5, max_length=500)
    completion_action: str = Field(..., min_length=3, max_length=300)
    status: Literal["pending", "completed", "skipped"] = "pending"
    observation_note: Optional[str] = None
    order_index: int = 0

class QuestGenerateRequest(BaseModel):
    environment: str = Field(..., description="Nature environment type")
    available_time: int = Field(..., description="Available duration in minutes (10, 20, 30)")
    experience_level: str = Field(default="beginner")
    interests: List[str] = Field(..., min_length=1, description="List of nature interests")
    accessibility_preferences: Optional[str] = Field(default=None, max_length=300)

    @field_validator("environment")
    @classmethod
    def validate_env(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in VALID_ENVIRONMENTS:
            raise ValueError(f"Environment must be one of: {', '.join(VALID_ENVIRONMENTS)}")
        return clean

    @field_validator("available_time")
    @classmethod
    def validate_time(cls, v: int) -> int:
        if v not in [10, 20, 30]:
            raise ValueError("Available time must be 10, 20, or 30 minutes")
        return v

    @field_validator("experience_level")
    @classmethod
    def validate_exp(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in VALID_EXPERIENCE:
            raise ValueError(f"Experience level must be one of: {', '.join(VALID_EXPERIENCE)}")
        return clean

class QuestGenerateResponse(BaseModel):
    quests: List[QuestItem]
    total_duration_minutes: int
    fallback_used: bool
    source: str  # "local_model" or "deterministic_template"
    model_name: str
    message: str
