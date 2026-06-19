from sqlalchemy.orm import Session

from app.repositories.adaptive_decision_repository import AdaptiveDecisionRepository
from app.repositories.bkt_repository import BKTRepository
from app.repositories.irt_repository import IRTRepository


class AdaptiveEngineService:
    def __init__(self, db: Session) -> None:
        self.bkt_repo = BKTRepository(db)
        self.irt_repo = IRTRepository(db)
        self.decision_repo = AdaptiveDecisionRepository(db)

    def get_student_bkt(self, student_id):
        return self.bkt_repo.list_by_student(student_id)

    def get_student_irt(self, student_id):
        return self.irt_repo.list_by_student(student_id)

    def get_session_decisions(self, session_id):
        return self.decision_repo.list_by_session(session_id)
