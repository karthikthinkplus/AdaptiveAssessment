from sqlalchemy.orm import Session

from app.models.assessment import Assessment
from app.models.learning_session import LearningSession
from app.models.question import Question
from app.models.student import Student
from app.models.student_response import StudentResponse
from app.models.teacher import Teacher
from app.models.topic import Topic
from app.models.user import User
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics_schema import PlatformAnalytics


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.repo = AnalyticsRepository(db)

    def platform(self) -> PlatformAnalytics:
        return PlatformAnalytics(
            users=self.repo.count(User),
            students=self.repo.count(Student),
            teachers=self.repo.count(Teacher),
            topics=self.repo.count(Topic),
            questions=self.repo.count(Question),
            assessments=self.repo.count(Assessment),
            learning_sessions=self.repo.count(LearningSession),
            responses=self.repo.count(StudentResponse),
        )
