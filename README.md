# Adaptive Assessment Platform

A production-grade modular monolith for adaptive learning and assessment.

## Stack

- Backend: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, JWT, bcrypt
- Frontend: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI-style components
- Database: PostgreSQL
- Architecture: modular monolith, repository pattern, service layer, dependency injection

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Services:

- API: http://localhost:8000
- API docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432

## Backend Local Development

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
```

## Tests

```bash
cd backend
pytest
```

## OpenAPI

The runtime OpenAPI document is served at:

- http://localhost:8000/openapi.json

To export a static spec:

```bash
cd backend
python scripts/export_openapi.py
```

This writes `docs/openapi.json`.
