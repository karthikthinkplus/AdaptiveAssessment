# PostgreSQL Schema

The complete PostgreSQL schema is encoded in the initial Alembic migration:

`backend/alembic/versions/0001_initial_schema.py`

It creates these tables:

- `users`
- `student_profiles`
- `teacher_profiles`
- `teacher_students`
- `topics`
- `subtopics`
- `knowledge_edges`
- `bkt_parameters`
- `questions`
- `student_subtopic_masteries`
- `ability_estimates`
- `assessments`
- `assessment_responses`
- `question_exposures`
- `assessment_events`

Key constraints:

- Unique user emails.
- One student or teacher profile per user.
- Unique subtopic names inside a topic.
- Directed prerequisite edges with self-edge prevention.
- One BKT parameter row per subtopic.
- One mastery row per student-subtopic pair.
- One ability estimate per student-topic pair.
- Foreign key cascades for student learning records, assessment records, graph records, and question exposures.

Generate SQL from the migration with:

```bash
cd backend
alembic upgrade head --sql > ../docs/postgresql_schema.sql
```
