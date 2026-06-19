from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.adaptive_decision_log import AdaptiveDecisionLog
from app.models.bkt_state import StudentBKTState
from app.models.irt_trait import StudentIRTTrait
from app.models.learning_session import LearningSession
from app.models.student_response import StudentResponse


class AnalyticsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def student_session_stats(self, student_id: UUID) -> tuple[int, int, int]:
        stmt = select(
            func.count(LearningSession.id),
            func.coalesce(func.sum(LearningSession.total_questions_attempted), 0),
            func.coalesce(func.sum(LearningSession.total_correct), 0),
        ).where(LearningSession.student_id == student_id)
        return self.db.execute(stmt).one()

    def mastery_states(self, student_id: UUID) -> list[StudentBKTState]:
        return list(
            self.db.execute(select(StudentBKTState).where(StudentBKTState.student_id == student_id)).scalars().all()
        )

    def irt_traits(self, student_id: UUID) -> list[StudentIRTTrait]:
        return list(
            self.db.execute(select(StudentIRTTrait).where(StudentIRTTrait.student_id == student_id)).scalars().all()
        )

    def session_response_stats(self, session_id: UUID) -> list[StudentResponse]:
        return list(
            self.db.execute(select(StudentResponse).where(StudentResponse.session_id == session_id)).scalars().all()
        )

    def session_decisions(self, session_id: UUID) -> list[AdaptiveDecisionLog]:
        return list(
            self.db.execute(select(AdaptiveDecisionLog).where(AdaptiveDecisionLog.session_id == session_id)).scalars().all()
        )
