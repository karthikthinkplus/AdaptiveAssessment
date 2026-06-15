from collections.abc import Sequence
from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class Repository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, entity_id: UUID) -> ModelT | None:
        return self.db.scalar(select(self.model).where(self.model.id == entity_id, self.model.deleted_at.is_(None)))

    def list(self, limit: int = 100, offset: int = 0) -> Sequence[ModelT]:
        return self.db.scalars(
            select(self.model).where(self.model.deleted_at.is_(None)).offset(offset).limit(limit)
        ).all()

    def add(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        self.db.flush()
        return entity
