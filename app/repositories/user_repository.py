from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.role import UserRole
from app.models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: UUID) -> User | None:
        stmt = (
            select(User)
            .options(joinedload(User.user_roles).joinedload(UserRole.role), joinedload(User.avatar))
            .where(User.id == user_id)
        )
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def get_by_email(self, email: str) -> User | None:
        stmt = (
            select(User)
            .options(joinedload(User.user_roles).joinedload(UserRole.role), joinedload(User.avatar))
            .where(User.email == email)
        )
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def list_users(self) -> list[User]:
        stmt = select(User).options(joinedload(User.user_roles).joinedload(UserRole.role)).order_by(User.created_at.desc())
        return list(self.db.execute(stmt).unique().scalars().all())

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user

    def assign_role(self, user_role: UserRole) -> UserRole:
        self.db.add(user_role)
        self.db.flush()
        return user_role
