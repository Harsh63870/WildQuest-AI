def test_session_lifecycle(client):
    # 1. Generate quests first
    gen_res = client.post("/api/quests/generate", json={
        "environment": "garden",
        "available_time": 10,
        "experience_level": "beginner",
        "interests": ["plants", "textures"]
    })
    quests = gen_res.json()["quests"]
    assert len(quests) >= 3

    # 2. Create session
    create_payload = {
        "environment": "garden",
        "available_time_minutes": 10,
        "experience_level": "beginner",
        "interests": ["plants", "textures"],
        "quests": quests,
        "fallback_used": True,
        "model_used": "deterministic_nature_catalog"
    }
    create_res = client.post("/api/sessions", json=create_payload)
    assert create_res.status_code == 201
    sess_data = create_res.json()
    sess_id = sess_data["id"]
    assert sess_id.startswith("sess_")
    assert sess_data["status"] == "active"
    assert len(sess_data["quests"]) == len(quests)

    # 3. Retrieve session by ID
    get_res = client.get(f"/api/sessions/{sess_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == sess_id

    # 4. List sessions
    list_res = client.get("/api/sessions")
    assert list_res.status_code == 200
    all_sessions = list_res.json()
    assert any(s["id"] == sess_id for s in all_sessions)

    # 5. Patch session - complete first quest with note
    first_q_id = sess_data["quests"][0]["id"]
    patch_payload = {
        "status": "active",
        "quest_updates": {
            first_q_id: {
                "status": "completed",
                "observation_note": "Found deep rough grooves in the pine bark."
            }
        }
    }
    patch_res = client.patch(f"/api/sessions/{sess_id}", json=patch_payload)
    assert patch_res.status_code == 200
    updated_sess = patch_res.json()
    assert updated_sess["completed_count"] == 1
    
    first_q_updated = next(q for q in updated_sess["quests"] if q["id"] == first_q_id)
    assert first_q_updated["status"] == "completed"
    assert first_q_updated["observation_note"] == "Found deep rough grooves in the pine bark."

    # 6. Mark session completed
    complete_sess_res = client.patch(f"/api/sessions/{sess_id}", json={"status": "completed"})
    assert complete_sess_res.status_code == 200
    assert complete_sess_res.json()["status"] == "completed"
    assert complete_sess_res.json()["completed_at"] is not None

def test_session_not_found(client):
    res = client.get("/api/sessions/non_existent_session_id")
    assert res.status_code == 404

    patch_res = client.patch("/api/sessions/non_existent_session_id", json={"status": "completed"})
    assert patch_res.status_code == 404
