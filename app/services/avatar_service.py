from uuid import UUID

from sqlalchemy.orm import Session

from app.exceptions import AppException
from app.models.avatar import Avatar
from app.repositories.avatar_repository import AvatarRepository
from app.schemas.avatar_schema import AvatarCreate, AvatarUpdate


class AvatarService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = AvatarRepository(db)

    def list_avatars(self) -> list[Avatar]:
        return self.repo.list_avatars()

    def create_avatar(self, payload: AvatarCreate) -> Avatar:
        avatar = Avatar(**payload.model_dump())
        self.repo.create(avatar)
        self.db.commit()
        return avatar

    def update_avatar(self, avatar_id: UUID, payload: AvatarUpdate) -> Avatar:
        avatar = self.repo.get_by_id(avatar_id)
        if not avatar:
            raise AppException("Avatar not found", "AVATAR_NOT_FOUND", 404)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(avatar, key, value)
        self.db.commit()
        self.db.refresh(avatar)
        return avatar
