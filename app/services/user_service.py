from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository


class UserService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def list_users(self):
        return self.repo.list_users()
