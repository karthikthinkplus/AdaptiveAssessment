from uuid import UUID

from sqlalchemy.orm import Session

from app.models.assessment import Assessment, AssessmentAttempt
from app.models.role import AttemptStatus
from app.repositories.assessment_repository import AssessmentAttemptRepository, AssessmentRepository
from app.schemas.assessment_schema import AssessmentAttemptCreate, AssessmentAttemptRead, AssessmentCreate, AssessmentRead


class AssessmentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.assessments = AssessmentRepository(db)
        self.attempts = AssessmentAttemptRepository(db)

    def create_assessment(self, payload: AssessmentCreate, user_id: UUID | None) -> AssessmentRead:
        assessment = self.assessments.add(Assessment(**payload.model_dump(), created_by_user_id=user_id))
        self.db.commit()
        self.db.refresh(assessment)
        return AssessmentRead.model_validate(assessment)

    def start_attempt(self, payload: AssessmentAttemptCreate) -> AssessmentAttemptRead:
        attempt = self.attempts.add(AssessmentAttempt(**payload.model_dump(), status=AttemptStatus.in_progress))
        self.db.commit()
        self.db.refresh(attempt)
        return AssessmentAttemptRead.model_validate(attempt)
