from typing import List, Optional
from pydantic import BaseModel, Field

class JournalGenerateRequest(BaseModel):
    session_id: Optional[str] = None
    user_observations: str = Field(..., min_length=3, max_length=2000, description="Raw observations from the walk")
    user_surprises: Optional[str] = Field(default=None, max_length=1000, description="What surprised the user")
    user_learnings: Optional[str] = Field(default=None, max_length=1000, description="What the user learned")
    user_feeling: Optional[str] = Field(default=None, max_length=500, description="Emotional or physical feeling")
    nature_categories: List[str] = Field(default_factory=list)
    total_outdoor_minutes: int = Field(default=0, ge=0)
    completed_quests_count: int = Field(default=0, ge=0)

class JournalEntryResponse(BaseModel):
    id: str
    session_id: Optional[str] = None
    title: str
    narrative: str
    takeaways: List[str]
    future_activity: str
    user_observations: str
    user_surprises: Optional[str] = None
    user_learnings: Optional[str] = None
    user_feeling: Optional[str] = None
    nature_categories: List[str]
    total_outdoor_minutes: int
    completed_quests_count: int
    fallback_used: bool
    created_at: str

class JournalListResponse(BaseModel):
    entries: List[JournalEntryResponse]
    total_count: int
    total_minutes: int
    total_completed_quests: int
    categories_explored: List[str]
