from app.models.assessment import Assessment, AssessmentAttempt
from app.repositories.base import Repository


class AssessmentRepository(Repository[Assessment]):
    model = Assessment


class AssessmentAttemptRepository(Repository[AssessmentAttempt]):
    model = AssessmentAttempt
