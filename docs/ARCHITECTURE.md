# Architecture

## Style

The platform is a modular monolith. Each business module owns its models, schemas, repositories, services, and routes. Cross-cutting infrastructure lives in `backend/app/core` and shared database primitives live in `backend/app/shared`.

## Backend Modules

- Authentication and authorization: JWT issuance, bcrypt password hashing, RBAC dependencies.
- Student learning: student profiles, subtopic mastery, topic ability estimates.
- Assessment: assessment sessions, responses, exposures, event log.
- Question bank: Rasch difficulty, choices, status, authoring metadata.
- Topic and knowledge graph: topics, subtopics, prerequisite edges, BKT parameters.
- Adaptive engine: BKT, Rasch IRT, EAP, Fisher selection, graph navigation.
- Analytics: student topic and platform metrics.
- Teacher portal: assigned students and classroom workflows.
- Admin portal: health and system operations.

## Request Flow

1. A student starts an assessment for a topic.
2. The assessment service selects the first subtopic from the topic sequence.
3. Fisher information selects the best unused active question for current theta.
4. The student submits a response.
5. The service scores the response, updates BKT mastery for the subtopic, then re-estimates topic theta with EAP under the Rasch model.
6. Knowledge graph navigation decides whether to stay, progress, backtrack, or complete.
7. The next question is selected from the active subtopic pool and exposure is logged.

## Persistence

All writes are transactionally coordinated in the service layer. Repositories encapsulate query and persistence details, while routes only handle HTTP input, dependency injection, and response models.

## Security

Passwords are hashed with bcrypt through Passlib. JWT access tokens carry the user ID as `sub` and role as a claim. FastAPI dependencies enforce RBAC at route boundaries.
