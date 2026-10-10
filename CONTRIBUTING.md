# Contributing to WildQuest AI

Thank you for your interest in contributing to **WildQuest AI**! We welcome bug fixes, documentation improvements, accessibility enhancements, and new local-first features.

## Hacktoberfest 2026 Guidelines

WildQuest AI participates in Hacktoberfest 2026! We embrace high quality, thoughtful open-source contributions. 

- Please review open issues or open a proposal before starting major architectural changes.
- Avoid low-effort pull requests (e.g., trivial punctuation fixes, automated grammar PRs).
- Ensure all automated unit tests pass and code conforms to project standards.

## Code of Conduct

Be welcoming, respectful, and considerate. Harassment or exclusionary behavior of any kind will not be tolerated.

## Development Setup

### Prerequisites
- Python 3.12+ (Python 3.14 compatible)
- Node.js 20+ (Node.js 24 supported)
- [Ollama](https://ollama.ai) (optional, app falls back cleanly to deterministic nature templates)

### Backend Setup
1. Create and activate a Python virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux/macOS:
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```
3. Run test suite:
   ```bash
   pytest
   ```
4. Start backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Run type check and build verification:
   ```bash
   npm run build
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

## Pull Request Checklist
- [ ] Code follows existing project style and architecture.
- [ ] Backend tests written and passing (`pytest`).
- [ ] Frontend compiles without TypeScript errors (`npm run build`).
- [ ] Privacy-first rules honored: **no remote analytics, no cloud model fallbacks, no user telemetry**.
- [ ] Meaningful PR description explaining changes and rationale.
