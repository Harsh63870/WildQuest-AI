# WildQuest AI — Privacy Policy & Architecture Guarantee

*Last updated: Hacktoberfest 2026*

## Core Philosophy: Your Nature Journey Belongs to You

Modern apps often monetize attention, require invasive account signups, and track physical location. **WildQuest AI rejects this paradigm completely.**

Our core commitment is simple: **Zero Cloud Data Leakage.**

---

## 1. Local AI Execution
- **Ollama Engine**: Quests and journal entries are synthesized by an open-weight model (default `qwen2.5:3b`) running directly on your computer's CPU/GPU.
- **Offline Deterministic Fallback**: If Ollama is not installed or running, WildQuest AI uses a deterministic internal generator with structured nature exploration templates. It never secretly forwards requests to OpenAI, Anthropic, Google, or any remote AI cloud.
- **Explicit Labeling**: Every generated quest clearly discloses whether it was created by your local model or the deterministic fallback system.

## 2. Local Database (SQLite)
- Your quest sessions, observations, timestamps, and nature reflections are saved in a local SQLite file (`wildquest.db`).
- You can inspect this file with any standard SQLite viewer (e.g., DB Browser for SQLite, sqlite3 CLI).
- You can delete any journal entry at any time with complete data destruction.
- You can export your full journal at any time as JSON or download individual entries as Markdown.

## 3. No Location or Device Tracking
- **No GPS**: You select a general environment type (e.g., "campus", "park", "forest trail") without sharing coordinates.
- **No Camera / Microphone Permissions**: Observation prompts encourage mindful visual and auditory notes written manually by you.
- **No Push Notifications or Guilt Streaks**: WildQuest AI respects your autonomy. There are no nagging streaks, notification spam, or manipulative gamification.

## 4. Network Activity Transparency
When WildQuest AI is running:
- **Only Local Traffic**: The browser frontend speaks strictly to `http://127.0.0.1:8000/api` (the local FastAPI server), which speaks strictly to `http://127.0.0.1:11434` (local Ollama).
- **External Network Access**: The only time network access is used is when you initially download Ollama and model weights (`ollama pull qwen2.5:3b`) via your own terminal.
