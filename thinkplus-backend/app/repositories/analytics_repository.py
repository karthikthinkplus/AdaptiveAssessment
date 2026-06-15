from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.base import Base


class AnalyticsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def count(self, model: type[Base]) -> int:
        return int(self.db.scalar(select(func.count(model.id)).where(model.deleted_at.is_(None))) or 0)
