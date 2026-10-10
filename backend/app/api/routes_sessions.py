import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.db.database import get_db
from app.schemas.session import (
    SessionCreateRequest,
    SessionPatchRequest,
    SessionResponse
)
from app.schemas.quest import QuestItem

router = APIRouter(prefix="/sessions", tags=["Sessions"])

def _row_to_session(row, quests: List[QuestItem] = None) -> SessionResponse:
    return SessionResponse(
        id=row["id"],
        environment=row["environment"],
        available_time_minutes=row["available_time_minutes"],
        experience_level=row["experience_level"],
        interests=json.loads(row["interests"]) if row["interests"] else [],
        accessibility_preferences=row["accessibility_preferences"],
        total_duration_minutes=row["total_duration_minutes"],
        completed_count=row["completed_count"],
        status=row["status"],
        fallback_used=bool(row["fallback_used"]),
        model_used=row["model_used"],
        created_at=row["created_at"],
        completed_at=row["completed_at"],
        quests=quests or []
    )

def _row_to_quest(row) -> QuestItem:
    return QuestItem(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        duration_minutes=row["duration_minutes"],
        difficulty=row["difficulty"],
        category=row["category"],
        observation_prompt=row["observation_prompt"],
        completion_action=row["completion_action"],
        status=row["status"],
        observation_note=row["observation_note"],
        order_index=row["order_index"]
    )

@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(request: SessionCreateRequest):
    """Start and persist a new quest exploration session in SQLite."""
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    now_utc = datetime.now(timezone.utc).isoformat()
    total_dur = sum(q.duration_minutes for q in request.quests)
    interests_json = json.dumps(request.interests)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO quest_sessions (
                id, environment, available_time_minutes, experience_level,
                interests, accessibility_preferences, total_duration_minutes,
                completed_count, status, fallback_used, model_used, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                request.environment,
                request.available_time_minutes,
                request.experience_level,
                interests_json,
                request.accessibility_preferences,
                total_dur,
                0,
                "active",
                1 if request.fallback_used else 0,
                request.model_used,
                now_utc
            )
        )

        persisted_quests: List[QuestItem] = []
        for idx, q in enumerate(request.quests):
            q_id = q.id or f"quest_{uuid.uuid4().hex[:8]}"
            cursor.execute(
                """
                INSERT INTO quests (
                    id, session_id, title, description, duration_minutes,
                    difficulty, category, observation_prompt, completion_action,
                    status, observation_note, order_index, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    q_id,
                    session_id,
                    q.title,
                    q.description,
                    q.duration_minutes,
                    q.difficulty,
                    q.category,
                    q.observation_prompt,
                    q.completion_action,
                    q.status,
                    q.observation_note,
                    idx + 1,
                    now_utc
                )
            )
            q_copy = q.model_copy()
            q_copy.id = q_id
            q_copy.order_index = idx + 1
            persisted_quests.append(q_copy)

        cursor.execute("SELECT * FROM quest_sessions WHERE id = ?", (session_id,))
        session_row = cursor.fetchone()

    return _row_to_session(session_row, persisted_quests)

@router.get("", response_model=List[SessionResponse])
async def list_sessions():
    """List all quest exploration sessions."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quest_sessions ORDER BY created_at DESC")
        session_rows = cursor.fetchall()
        
        result: List[SessionResponse] = []
        for s_row in session_rows:
            cursor.execute("SELECT * FROM quests WHERE session_id = ? ORDER BY order_index ASC", (s_row["id"],))
            q_rows = cursor.fetchall()
            quests = [_row_to_quest(qr) for qr in q_rows]
            result.append(_row_to_session(s_row, quests))
        return result

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    """Retrieve details for a specific session by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quest_sessions WHERE id = ?", (session_id,))
        s_row = cursor.fetchone()
        if not s_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session with ID '{session_id}' not found."
            )
        
        cursor.execute("SELECT * FROM quests WHERE session_id = ? ORDER BY order_index ASC", (session_id,))
        q_rows = cursor.fetchall()
        quests = [_row_to_quest(qr) for qr in q_rows]
        return _row_to_session(s_row, quests)

@router.patch("/{session_id}", response_model=SessionResponse)
async def patch_session(session_id: str, patch_data: SessionPatchRequest):
    """Update session status, mark individual quests complete/skipped, and store notes."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quest_sessions WHERE id = ?", (session_id,))
        s_row = cursor.fetchone()
        if not s_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session with ID '{session_id}' not found."
            )

        now_utc = datetime.now(timezone.utc).isoformat()

        # Update quest items if provided
        if patch_data.quest_updates:
            for q_id, update in patch_data.quest_updates.items():
                cursor.execute(
                    """
                    UPDATE quests 
                    SET status = ?, observation_note = coalesce(?, observation_note)
                    WHERE id = ? AND session_id = ?
                    """,
                    (update.status, update.observation_note, q_id, session_id)
                )

        # Recalculate completed count
        cursor.execute("SELECT COUNT(*) as completed FROM quests WHERE session_id = ? AND status = 'completed'", (session_id,))
        completed_count = cursor.fetchone()["completed"]

        # Update session status
        new_status = patch_data.status or s_row["status"]
        completed_at = now_utc if new_status == "completed" else s_row["completed_at"]

        cursor.execute(
            """
            UPDATE quest_sessions 
            SET status = ?, completed_count = ?, completed_at = ?
            WHERE id = ?
            """,
            (new_status, completed_count, completed_at, session_id)
        )

        cursor.execute("SELECT * FROM quest_sessions WHERE id = ?", (session_id,))
        updated_s_row = cursor.fetchone()
        cursor.execute("SELECT * FROM quests WHERE session_id = ? ORDER BY order_index ASC", (session_id,))
        updated_q_rows = cursor.fetchall()
        quests = [_row_to_quest(qr) for qr in updated_q_rows]

        return _row_to_session(updated_s_row, quests)
