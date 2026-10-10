import os
import pytest
import tempfile
from fastapi.testclient import TestClient
from app.core.config import settings
from app.db.database import init_db
from app.main import app

@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch):
    """Use an isolated temporary SQLite database for each test session."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as temp_db:
        test_db_path = temp_db.name

    monkeypatch.setattr(settings, "DATABASE_PATH", test_db_path)
    init_db()

    yield test_db_path

    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except Exception:
            pass

@pytest.fixture
def client():
    """FastAPI test client."""
    with TestClient(app) as test_client:
        yield test_client
