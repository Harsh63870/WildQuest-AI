import sqlite3
import os
from contextlib import contextmanager
from typing import Generator
from app.core.config import settings

def get_db_path() -> str:
    return settings.DATABASE_PATH

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Provide a transactional database connection."""
    conn = sqlite3.connect(get_db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db() -> None:
    """Initialize the SQLite database schema if not present."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quest_sessions (
                id TEXT PRIMARY KEY,
                environment TEXT NOT NULL,
                available_time_minutes INTEGER NOT NULL,
                experience_level TEXT NOT NULL,
                interests TEXT NOT NULL,
                accessibility_preferences TEXT,
                total_duration_minutes INTEGER NOT NULL,
                completed_count INTEGER DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'active',
                fallback_used INTEGER DEFAULT 0,
                model_used TEXT,
                created_at TEXT NOT NULL,
                completed_at TEXT
            );
        """)

        # 2. Quests table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quests (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                difficulty TEXT NOT NULL,
                category TEXT NOT NULL,
                observation_prompt TEXT NOT NULL,
                completion_action TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                observation_note TEXT,
                order_index INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES quest_sessions(id) ON DELETE CASCADE
            );
        """)

        # 3. Journal entries table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS journal_entries (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                title TEXT NOT NULL,
                narrative TEXT NOT NULL,
                takeaways TEXT NOT NULL,
                future_activity TEXT NOT NULL,
                user_observations TEXT NOT NULL,
                user_surprises TEXT,
                user_learnings TEXT,
                user_feeling TEXT,
                nature_categories TEXT NOT NULL,
                total_outdoor_minutes INTEGER NOT NULL,
                completed_quests_count INTEGER NOT NULL,
                fallback_used INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES quest_sessions(id) ON DELETE SET NULL
            );
        """)
        
        # Indexes for fast querying
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_quests_session_id ON quests(session_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal_entries(created_at DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON quest_sessions(created_at DESC);")
