# Security Policy

## Privacy & Local-First Security Architecture

WildQuest AI is designed from the ground up as a **zero-telemetry, privacy-preserving, local-first application**:
- **Local Model Execution**: AI inference runs on your own hardware via Ollama. No outdoor notes, journal reflections, or exploration prompts are ever sent to remote cloud APIs.
- **Local Persistence**: All quest sessions and journal entries are stored inside a local SQLite database on your machine (`wildquest.db`).
- **Zero Tracking**: The application does not include analytics, tracking pixels, error-reporting telemetry, or third-party cookies.
- **No Location Harvesting**: The application never requests GPS, geolocation permissions, or device camera access.

## Reporting a Vulnerability

If you discover any security concern or unexpected network exposure in WildQuest AI, please report it responsibly:

1. Please **do not** open a public issue on GitHub.
2. Draft an email describing the vulnerability, proof of concept, and impact to the project maintainers.
3. You will receive an initial response within 48 hours acknowledging receipt and coordinating a patch.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
