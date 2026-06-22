from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.role import Role


class RoleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_name(self, name: str) -> Role | None:
        return self.db.execute(select(Role).where(Role.name == name)).scalar_one_or_none()

    def list_roles(self) -> list[Role]:
        return list(self.db.execute(select(Role).order_by(Role.name)).scalars().all())

    def create(self, role: Role) -> Role:
        self.db.add(role)
        self.db.flush()
        return role
