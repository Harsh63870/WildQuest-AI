import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import JSONResponse
from app.db.database import get_db
from app.schemas.journal import (
    JournalGenerateRequest,
    JournalEntryResponse,
    JournalListResponse
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/journal", tags=["Nature Journal"])
ai_service = AIService()

def _row_to_journal(row) -> JournalEntryResponse:
    takeaways = []
    if row["takeaways"]:
        try:
            takeaways = json.loads(row["takeaways"])
        except Exception:
            takeaways = [row["takeaways"]]

    categories = []
    if row["nature_categories"]:
        try:
            categories = json.loads(row["nature_categories"])
        except Exception:
            categories = [row["nature_categories"]]

    return JournalEntryResponse(
        id=row["id"],
        session_id=row["session_id"],
        title=row["title"],
        narrative=row["narrative"],
        takeaways=takeaways,
        future_activity=row["future_activity"],
        user_observations=row["user_observations"],
        user_surprises=row["user_surprises"],
        user_learnings=row["user_learnings"],
        user_feeling=row["user_feeling"],
        nature_categories=categories,
        total_outdoor_minutes=row["total_outdoor_minutes"],
        completed_quests_count=row["completed_quests_count"],
        fallback_used=bool(row["fallback_used"]),
        created_at=row["created_at"]
    )

@router.post("", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(request: JournalGenerateRequest):
    """
    Generate and persist a reflective nature journal entry based strictly
    on user observations, either via local Ollama or template synthesis.
    """
    reflection = await ai_service.generate_journal(request)
    entry_id = f"entry_{uuid.uuid4().hex[:12]}"
    now_utc = datetime.now(timezone.utc).isoformat()

    takeaways_json = json.dumps(reflection.get("takeaways", []))
    categories_json = json.dumps(request.nature_categories)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO journal_entries (
                id, session_id, title, narrative, takeaways, future_activity,
                user_observations, user_surprises, user_learnings, user_feeling,
                nature_categories, total_outdoor_minutes, completed_quests_count,
                fallback_used, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry_id,
                request.session_id,
                reflection["title"],
                reflection["narrative"],
                takeaways_json,
                reflection["future_activity"],
                request.user_observations,
                request.user_surprises,
                request.user_learnings,
                request.user_feeling,
                categories_json,
                request.total_outdoor_minutes,
                request.completed_quests_count,
                1 if reflection.get("fallback_used") else 0,
                now_utc
            )
        )
        cursor.execute("SELECT * FROM journal_entries WHERE id = ?", (entry_id,))
        row = cursor.fetchone()

    return _row_to_journal(row)

@router.get("", response_model=JournalListResponse)
async def list_journal_entries(
    search: Optional[str] = Query(None, description="Search term in title, narrative, or observations")
):
    """List all saved journal entries with optional text search and progress statistics."""
    with get_db() as conn:
        cursor = conn.cursor()
        if search:
            query_pattern = f"%{search.strip()}%"
            cursor.execute(
                """
                SELECT * FROM journal_entries
                WHERE title LIKE ? OR narrative LIKE ? OR user_observations LIKE ?
                ORDER BY created_at DESC
                """,
                (query_pattern, query_pattern, query_pattern)
            )
        else:
            cursor.execute("SELECT * FROM journal_entries ORDER BY created_at DESC")
        
        rows = cursor.fetchall()
        entries = [_row_to_journal(r) for r in rows]

        # Calculate cumulative totals
        cursor.execute("SELECT SUM(total_outdoor_minutes) as tot_mins, SUM(completed_quests_count) as tot_quests FROM journal_entries")
        totals_row = cursor.fetchone()
        tot_mins = totals_row["tot_mins"] or 0
        tot_quests = totals_row["tot_quests"] or 0

        # Unique categories explored
        all_categories = set()
        for e in entries:
            for cat in e.nature_categories:
                if cat:
                    all_categories.add(cat)

        return JournalListResponse(
            entries=entries,
            total_count=len(entries),
            total_minutes=tot_mins,
            total_completed_quests=tot_quests,
            categories_explored=sorted(list(all_categories))
        )

@router.get("/export/json")
async def export_journal_json():
    """Export the complete nature journal as a structured JSON file."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM journal_entries ORDER BY created_at DESC")
        rows = cursor.fetchall()
        entries = [_row_to_journal(r).model_dump() for r in rows]
        
        export_payload = {
            "app": "WildQuest AI",
            "version": "1.0.0",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "total_entries": len(entries),
            "journal": entries
        }
        return JSONResponse(
            content=export_payload,
            headers={
                "Content-Disposition": f"attachment; filename=wildquest_journal_backup.json"
            }
        )

@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(entry_id: str):
    """Retrieve a single journal entry by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM journal_entries WHERE id = ?", (entry_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Journal entry '{entry_id}' not found."
            )
        return _row_to_journal(row)

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal_entry(entry_id: str):
    """Permanently delete a journal entry by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM journal_entries WHERE id = ?", (entry_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Journal entry '{entry_id}' not found."
            )
        cursor.execute("DELETE FROM journal_entries WHERE id = ?", (entry_id,))
    return None
