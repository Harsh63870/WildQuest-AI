# WildQuest AI — Architecture & System Design

## Overview

WildQuest AI is an offline-capable, privacy-first web application designed to reconnect screen-bound individuals with the natural world through personalized mini-explorations.

```mermaid
graph TD
    subgraph Browser ["Frontend (React 19 + TypeScript + Vite + Tailwind CSS)"]
        UI[Outdoor Journal UI]
        QG[Quest Generator View]
        QS[Active Quest Session]
        NJ[Nature Journal & History]
        PG[Progress & Real Achievements]
        API_CLIENT[API Client Service (Axios / Fetch)]
    end

    subgraph BackendHost ["Local Backend (FastAPI + Python 3.12+)"]
        ROUTER[FastAPI REST API Routes]
        AISVC[AI Service Abstraction]
        TGEN[Deterministic Template Engine]
        OLLAMA_CLIENT[HTTPX Ollama Client]
        DB_REPO[SQLite Data Access Layer]
        SQLITE[(wildquest.db Local Database)]
    end

    subgraph LocalOllama ["Local Ollama Daemon (Port 11434)"]
        OLLAMA_SRV[Ollama Server]
        MODEL[Local Weights: qwen2.5:3b]
    end

    UI --> API_CLIENT
    QG --> API_CLIENT
    QS --> API_CLIENT
    NJ --> API_CLIENT
    PG --> API_CLIENT

    API_CLIENT -->|HTTP REST on 127.0.0.1:8000| ROUTER
    ROUTER --> DB_REPO
    DB_REPO --> SQLITE

    ROUTER --> AISVC
    AISVC -->|Live inference attempt| OLLAMA_CLIENT
    OLLAMA_CLIENT -->|HTTP on 127.0.0.1:11434| OLLAMA_SRV
    OLLAMA_SRV --> MODEL

    AISVC -.->|Fallback on timeout / offline| TGEN
```

## Architectural Highlights

### 1. Dual-Path Generation Pipeline (AI + Deterministic Fallback)
The AI Service checks Ollama status via HTTP with a configurable timeout.
- If Ollama is responsive and the model is loaded: prompts are rendered with strict JSON schema instructions and validated against Pydantic models.
- If Ollama is offline, unreachable, or responds with invalid JSON: the engine transparently engages the deterministic template generator.
- The UI displays an explicit badge: `Generated with Local Model (qwen2.5:3b)` or `Generated with Deterministic Nature Templates (Offline Mode)`.

### 2. Grounded Reflection Synthesis
A common pitfall with AI journaling is hallucinating experiences the user never had. WildQuest AI’s prompt strictly constraints the generation:
- Only user-provided observations are used.
- The model is instructed to synthesize and connect reflections, never inventing false sightings.

### 3. Session State Machine
- **Draft / Generated**: Quests generated for user's parameters.
- **Active Session**: User completes or skips quests, typing live sensory notes.
- **Completed Session**: Summary metrics calculated (duration, completed quests, category breakdown).
- **Journal Entry Created**: Persisted to SQLite and linked to session.

### 4. Zero Cloud Footprint
- No third-party API credentials.
- No analytics trackers.
- SQLite is initialized automatically on startup if missing.
