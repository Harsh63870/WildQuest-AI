.PHONY: install test-backend build-frontend run-backend run-frontend dev

install:
	cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt -r requirements-dev.txt
	cd frontend && npm install

test-backend:
	cd backend && pytest

build-frontend:
	cd frontend && npm run build

run-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev
