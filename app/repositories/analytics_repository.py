from uuid import UUID
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.adaptive_decision_log import AdaptiveDecisionLog
from app.models.bkt_state import StudentBKTState
from app.models.irt_trait import StudentIRTTrait
from app.models.learning_session import LearningSession
from app.models.student_response import StudentResponse
from app.models.student import Student
from app.models.topic import Topic


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

    def active_practicing_students_count(self) -> int:
        stmt = select(func.count(func.distinct(LearningSession.student_id))).where(
            LearningSession.status == "active"
        )
        return self.db.execute(stmt).scalar() or 0

    def inactive_students_count(self) -> int:
        threshold = datetime.utcnow() - timedelta(days=3)
        
        max_start_sub = select(
            LearningSession.student_id,
            func.max(LearningSession.started_at).label("last_session_time")
        ).group_by(LearningSession.student_id).subquery()
        
        stmt = select(func.count(Student.id)).outerjoin(
            max_start_sub, Student.id == max_start_sub.c.student_id
        ).where(
            (max_start_sub.c.last_session_time == None) | (max_start_sub.c.last_session_time < threshold)
        )
        return self.db.execute(stmt).scalar() or 0

    def topic_correct_rates(self) -> list[dict]:
        stmt = select(
            Topic.id,
            Topic.name,
            func.count(StudentResponse.id).label("total_attempts"),
            func.sum(func.case([(StudentResponse.is_correct == True, 1)], else_=0)).label("correct_attempts")
        ).join(
            StudentResponse, Topic.id == StudentResponse.topic_id
        ).group_by(
            Topic.id, Topic.name
        )
        results = self.db.execute(stmt).all()
        topic_rates = []
        for row in results:
            rate = round((row.correct_attempts / row.total_attempts) * 100, 2) if row.total_attempts > 0 else 0.0
            topic_rates.append({
                "topic_id": str(row.id),
                "topic_name": row.name,
                "total_attempts": row.total_attempts,
                "correct_rate": rate
            })
        return topic_rates
