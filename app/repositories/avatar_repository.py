from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.avatar import Avatar


class AvatarRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_avatars(self) -> list[Avatar]:
        stmt = select(Avatar).order_by(Avatar.display_order.asc(), Avatar.created_at.asc())
        return list(self.db.execute(stmt).scalars().all())

    def get_by_id(self, avatar_id: UUID) -> Avatar | None:
        return self.db.get(Avatar, avatar_id)

    def create(self, avatar: Avatar) -> Avatar:
        self.db.add(avatar)
        self.db.flush()
        self.db.refresh(avatar)
        return avatar
