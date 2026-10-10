import pytest
from unittest.mock import AsyncMock, patch
from app.services.ai_service import AIService
from app.services.ollama_client import OllamaClient
from app.schemas.quest import QuestGenerateRequest
from app.schemas.journal import JournalGenerateRequest

@pytest.mark.asyncio
async def test_ai_status_when_offline():
    mock_client = AsyncMock(spec=OllamaClient)
    mock_client.model = "qwen2.5:3b"
    mock_client.check_connectivity.return_value = {
        "connected": False,
        "model_available": False,
        "configured_model": "qwen2.5:3b",
        "installed_models": [],
        "error": "Connection refused"
    }

    service = AIService(ollama_client=mock_client)
    status = await service.get_status()
    assert status["fallback_mode"] is True
    assert status["connected"] is False
    assert "offline" in status["message"].lower()

@pytest.mark.asyncio
async def test_ai_status_when_online():
    mock_client = AsyncMock(spec=OllamaClient)
    mock_client.model = "qwen2.5:3b"
    mock_client.check_connectivity.return_value = {
        "connected": True,
        "model_available": True,
        "configured_model": "qwen2.5:3b",
        "installed_models": ["qwen2.5:3b"],
        "error": None
    }

    service = AIService(ollama_client=mock_client)
    status = await service.get_status()
    assert status["fallback_mode"] is False
    assert status["connected"] is True
    assert status["model_available"] is True

@pytest.mark.asyncio
async def test_ai_quest_generation_success():
    mock_client = AsyncMock(spec=OllamaClient)
    mock_client.model = "qwen2.5:3b"
    mock_client.check_connectivity.return_value = {
        "connected": True,
        "model_available": True,
        "configured_model": "qwen2.5:3b",
        "installed_models": ["qwen2.5:3b"],
        "error": None
    }
    mock_client.generate_json.return_value = {
        "quests": [
            {
                "title": "High Canopy Nest Search",
                "description": "Look for squirrel or magpie dreys in tall deciduous crowns.",
                "duration_minutes": 5,
                "difficulty": "easy",
                "category": "birds",
                "observation_prompt": "Notice branch forks where twigs accumulate.",
                "completion_action": "Record if any nests were spotted."
            },
            {
                "title": "Pine Needle Carpet",
                "description": "Step lightly onto needle beds under conifers.",
                "duration_minutes": 5,
                "difficulty": "easy",
                "category": "textures",
                "observation_prompt": "Feel the cushion and inhale the resin scent.",
                "completion_action": "Note the tactile spring underfoot."
            },
            {
                "title": "Wind Whispering",
                "description": "Listen to the tone change when wind passes through leaves.",
                "duration_minutes": 5,
                "difficulty": "easy",
                "category": "sounds",
                "observation_prompt": "Notice pitch differences between oak and pine needles.",
                "completion_action": "Describe the sound timbre."
            }
        ]
    }

    service = AIService(ollama_client=mock_client)
    req = QuestGenerateRequest(
        environment="park",
        available_time=20,
        experience_level="curious explorer",
        interests=["birds", "textures", "sounds"]
    )
    res = await service.generate_quests(req)
    assert res.fallback_used is False
    assert res.source == "local_model"
    assert len(res.quests) == 3
    assert res.total_duration_minutes == 15

@pytest.mark.asyncio
async def test_ai_quest_generation_timeout_triggers_fallback():
    mock_client = AsyncMock(spec=OllamaClient)
    mock_client.model = "qwen2.5:3b"
    mock_client.check_connectivity.return_value = {
        "connected": True,
        "model_available": True,
        "configured_model": "qwen2.5:3b",
        "installed_models": ["qwen2.5:3b"],
        "error": None
    }
    # Simulate timeout or None response
    mock_client.generate_json.return_value = None

    service = AIService(ollama_client=mock_client)
    req = QuestGenerateRequest(
        environment="forest trail",
        available_time=20,
        experience_level="beginner",
        interests=["plants", "textures"]
    )
    res = await service.generate_quests(req)
    assert res.fallback_used is True
    assert res.source == "deterministic_template"
    assert len(res.quests) >= 3

@pytest.mark.asyncio
async def test_ai_journal_generation_fallback():
    mock_client = AsyncMock(spec=OllamaClient)
    mock_client.model = "qwen2.5:3b"
    mock_client.check_connectivity.return_value = {
        "connected": False,
        "model_available": False,
        "configured_model": "qwen2.5:3b",
        "installed_models": [],
        "error": "offline"
    }

    service = AIService(ollama_client=mock_client)
    req = JournalGenerateRequest(
        user_observations="Watched dry autumn leaves swirl across the stone pathway.",
        user_surprises="A dragonfly darted past despite the cool autumn air.",
        user_learnings="Wind channels form between tall hedges.",
        user_feeling="Refreshed and alert."
    )
    res = await service.generate_journal(req)
    assert res["fallback_used"] is True
    assert res["title"]
    assert "Watched dry autumn leaves" in res["narrative"]
    assert len(res["takeaways"]) == 3
    assert res["future_activity"]
