from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.adaptive_decision_log import AdaptiveDecisionLog


class AdaptiveDecisionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, log: AdaptiveDecisionLog) -> AdaptiveDecisionLog:
        self.db.add(log)
        self.db.flush()
        self.db.refresh(log)
        return log

    def list_by_session(self, session_id: UUID) -> list[AdaptiveDecisionLog]:
        stmt = select(AdaptiveDecisionLog).where(AdaptiveDecisionLog.session_id == session_id)
        return list(self.db.execute(stmt).scalars().all())
