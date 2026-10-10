def test_get_categories(client):
    response = client.get("/api/quests/categories")
    assert response.status_code == 200
    data = response.json()
    assert "campus" in data["environments"]
    assert "plants" in data["interests"]
    assert "beginner" in data["experience_levels"]
    assert 10 in data["time_options_minutes"]

def test_generate_quests_offline_fallback(client):
    payload = {
        "environment": "park",
        "available_time": 20,
        "experience_level": "beginner",
        "interests": ["plants", "birds"],
        "accessibility_preferences": "Paved flat paths preferred"
    }
    response = client.post("/api/quests/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert "quests" in data
    assert len(data["quests"]) >= 3
    assert len(data["quests"]) <= 5
    
    # Assert duration limit
    total_duration = sum(q["duration_minutes"] for q in data["quests"])
    assert total_duration <= 20
    assert data["total_duration_minutes"] == total_duration
    
    # Assert fallback attributes
    assert data["fallback_used"] is True
    assert data["source"] == "deterministic_template"

    for q in data["quests"]:
        assert q["title"]
        assert q["description"]
        assert q["duration_minutes"] > 0
        assert q["observation_prompt"]
        assert q["completion_action"]
        assert q["status"] == "pending"

def test_generate_quests_validation_errors(client):
    # Invalid environment
    res1 = client.post("/api/quests/generate", json={
        "environment": "outer_space",
        "available_time": 20,
        "experience_level": "beginner",
        "interests": ["plants"]
    })
    assert res1.status_code == 422

    # Invalid time (not 10, 20, or 30)
    res2 = client.post("/api/quests/generate", json={
        "environment": "garden",
        "available_time": 45,
        "experience_level": "beginner",
        "interests": ["plants"]
    })
    assert res2.status_code == 422

    # Empty interests
    res3 = client.post("/api/quests/generate", json={
        "environment": "garden",
        "available_time": 10,
        "experience_level": "beginner",
        "interests": []
    })
    assert res3.status_code == 422
