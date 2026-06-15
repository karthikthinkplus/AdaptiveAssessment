# Backend API

Base path: `/api/v1`

Runtime docs:

- Swagger UI: `/docs`
- OpenAPI JSON: `/openapi.json`

Generated static spec:

- `backend/docs/openapi.json`

## Route Groups

- Authentication: `/auth/register`, `/auth/login`, `/auth/me`
- Students: `/students`
- Teachers: `/teachers`
- Topics: `/topics`, `/topics/{topic_id}/prerequisites`
- Subtopics: `/subtopics`, `/topics/{topic_id}/subtopics`, `/subtopics/{subtopic_id}/prerequisites`
- Questions: `/questions`
- Assessments: `/assessments`, `/assessment-attempts`
- Learning sessions: `/learning-sessions`, `/learning-sessions/{session_id}/responses`
- Adaptive engine: `/adaptive/next-question/{session_id}`, BKT and theta lookup endpoints
- Analytics: `/analytics/platform`, `/analytics/students/{student_id}`

## Auth

Use `POST /api/v1/auth/register` or `POST /api/v1/auth/login` to obtain a JWT bearer token, then send:

```http
Authorization: Bearer <token>
```

## Generated Database Artifacts

- PostgreSQL DDL: `backend/schema.sql`
- Alembic migration: `backend/alembic/versions/0001_initial_schema.py`
