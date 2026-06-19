# ThinkPlus Adaptive Learning and Assessment Backend

FastAPI backend for ThinkPlus adaptive learning with JWT auth, RBAC, Excel question-bank import, learning sessions, telemetry, BKT mastery tracking, IRT/EAP ability tracking, navigation, Fisher-based question selection, and analytics.

## Setup

Install dependencies in the existing environment:

```bash
../venv/bin/pip install -r requirements.txt
```

Ensure PostgreSQL is running and `.env` is configured.

## Environment Variables

See [.env.example](./.env.example) for required variables.

Important variables:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CONTENT_MANAGER_EMAIL`
- `CONTENT_MANAGER_PASSWORD`
- `FRONTEND_URL`

## Seed Database

Seed roles, default admin, default content manager, and default avatars:

```bash
../venv/bin/python -m app.database.init_db
```

Seeded roles:

- `student`
- `teacher`
- `content_manager`
- `admin`

## Run Backend

```bash
../venv/bin/uvicorn app.main:app --reload
```

Health checks:

- `GET /`
- `GET /health`

## Login Credentials Setup

Admin and content manager credentials come from `.env`:

- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `CONTENT_MANAGER_EMAIL` / `CONTENT_MANAGER_PASSWORD`

Public signup endpoints exist only for:

- `POST /api/v1/auth/signup/student`
- `POST /api/v1/auth/signup/teacher`

Common auth endpoints:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

## Upload Question Bank

Use:

- `POST /api/v1/uploads/question-bank`
- `GET /api/v1/uploads/question-bank/template`

Upload permissions:

- `admin`
- `content_manager`

Supported source file:

- `.xlsx`

Observed workbook columns:

- `Q No`
- `Topic`
- `Sub-topic`
- `Paragraph`
- `Question`
- `Option A`
- `Option B`
- `Option C`
- `Option D`
- `Key`
- `Level of Difficulty`
- `Time taken to read the question`
- `Class/Grade`

The import ignores the grade column and writes into:

- `topics`
- `subtopics`
- `question_passages`
- `questions`
- `question_options`

## Learning Session Flow

Start session:

```http
POST /api/v1/learning/sessions/start
```

Body:

```json
{
  "topic_id": "TOPIC_UUID"
}
```

Submit answer:

```http
POST /api/v1/learning/sessions/{session_id}/submit
```

Body:

```json
{
  "question_id": "QUESTION_UUID",
  "selected_option_id": "OPTION_UUID",
  "submitted_answer": null,
  "response_time_seconds": 8
}
```

Additional session endpoints:

- `GET /api/v1/learning/sessions/{session_id}`
- `POST /api/v1/learning/sessions/{session_id}/pause`
- `POST /api/v1/learning/sessions/{session_id}/end`

## Important API Endpoints

- `GET /api/v1/avatars`
- `POST /api/v1/avatars`
- `PATCH /api/v1/avatars/{avatar_id}`
- `GET /api/v1/topics`
- `POST /api/v1/topics`
- `GET /api/v1/topics/{topic_id}`
- `PATCH /api/v1/topics/{topic_id}`
- `GET /api/v1/topics/{topic_id}/subtopics`
- `POST /api/v1/topics/{topic_id}/subtopics`
- `GET /api/v1/questions`
- `GET /api/v1/questions/{question_id}`
- `POST /api/v1/questions`
- `PATCH /api/v1/questions/{question_id}`
- `GET /api/v1/adaptive/students/{student_id}/bkt`
- `GET /api/v1/adaptive/students/{student_id}/irt`
- `GET /api/v1/adaptive/sessions/{session_id}/decisions`
- `GET /api/v1/analytics/student/{student_id}`
- `GET /api/v1/analytics/session/{session_id}`

## Assumptions

- Existing PostgreSQL tables already match `create_tables.py`.
- Assessment-specific tables are not part of the final schema and are not introduced here.
- The Excel upload treats trailing incomplete rows as row-level failures instead of aborting the file.
- Difficulty defaults to `medium` when missing.
- Uploaded questions default to `approved` when status is missing.

## Pending Improvements

- Add formal Alembic migration scripts.
- Add richer admin, student, and teacher route surfaces.
- Add deeper validation for topic-subtopic consistency and graph cycles.
- Improve telemetry heuristics and Fisher/IRT calibration.
- Add automated test coverage beyond smoke checks.
- Add production-ready structured logging and request middleware.
