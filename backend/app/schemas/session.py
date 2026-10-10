from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field
from app.schemas.quest import QuestItem

class QuestStatusUpdate(BaseModel):
    status: Literal["pending", "completed", "skipped"]
    observation_note: Optional[str] = Field(default=None, max_length=1000)

class SessionCreateRequest(BaseModel):
    environment: str
    available_time_minutes: int
    experience_level: str
    interests: List[str]
    accessibility_preferences: Optional[str] = None
    quests: List[QuestItem]
    fallback_used: bool = False
    model_used: Optional[str] = None

class SessionPatchRequest(BaseModel):
    status: Optional[Literal["active", "completed", "abandoned"]] = None
    quest_updates: Optional[Dict[str, QuestStatusUpdate]] = None

class SessionResponse(BaseModel):
    id: str
    environment: str
    available_time_minutes: int
    experience_level: str
    interests: List[str]
    accessibility_preferences: Optional[str]
    total_duration_minutes: int
    completed_count: int
    status: str
    fallback_used: bool
    model_used: Optional[str]
    created_at: str
    completed_at: Optional[str]
    quests: List[QuestItem] = []
