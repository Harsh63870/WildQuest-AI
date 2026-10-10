def test_journal_lifecycle(client):
    # 1. Create a journal entry
    payload = {
        "user_observations": "Observed dark emerald moss growing on damp granite along the north garden wall.",
        "user_surprises": "A tiny spider had woven a micro-web between two moss clumps.",
        "user_learnings": "Moss feels remarkably cool and holds water like a sponge.",
        "user_feeling": "Grounded and calm.",
        "nature_categories": ["botany", "textures"],
        "total_outdoor_minutes": 15,
        "completed_quests_count": 3
    }
    create_res = client.post("/api/journal", json=payload)
    assert create_res.status_code == 201
    entry = create_res.json()
    entry_id = entry["id"]

    assert entry["title"]
    assert entry["narrative"]
    assert len(entry["takeaways"]) == 3
    assert entry["future_activity"]
    assert entry["total_outdoor_minutes"] == 15
    assert entry["completed_quests_count"] == 3
    assert "botany" in entry["nature_categories"]

    # 2. Get entry by ID
    get_res = client.get(f"/api/journal/{entry_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == entry_id

    # 3. List entries and check stats
    list_res = client.get("/api/journal")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total_count"] >= 1
    assert list_data["total_minutes"] >= 15
    assert list_data["total_completed_quests"] >= 3
    assert "botany" in list_data["categories_explored"]

    # 4. Search entries
    search_res = client.get("/api/journal?search=granite")
    assert search_res.status_code == 200
    assert len(search_res.json()["entries"]) >= 1

    search_empty = client.get("/api/journal?search=completely_nonexistent_keyword_xyz")
    assert search_empty.status_code == 200
    assert len(search_empty.json()["entries"]) == 0

    # 5. Export JSON
    export_res = client.get("/api/journal/export/json")
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert export_data["app"] == "WildQuest AI"
    assert "journal" in export_data
    assert any(e["id"] == entry_id for e in export_data["journal"])

    # 6. Delete entry
    del_res = client.delete(f"/api/journal/{entry_id}")
    assert del_res.status_code == 204

    # 7. Verify deleted entry returns 404
    get_deleted = client.get(f"/api/journal/{entry_id}")
    assert get_deleted.status_code == 404

def test_journal_not_found(client):
    res = client.get("/api/journal/entry_not_found_123")
    assert res.status_code == 404

    del_res = client.delete("/api/journal/entry_not_found_123")
    assert del_res.status_code == 404
