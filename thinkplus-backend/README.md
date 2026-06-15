# ThinkPlus Backend

Production-ready FastAPI backend scaffold for adaptive assessment.

```bash
cp .env.example .env
docker compose up --build
```

Local development:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
```
