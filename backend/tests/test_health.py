def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "WildQuest AI"
    assert data["privacy"] == "local-first"
    assert data["telemetry"] == "disabled"

def test_ai_status_endpoint(client):
    response = client.get("/api/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "connected" in data
    assert "model_available" in data
    assert "fallback_mode" in data
    assert "configured_model" in data
