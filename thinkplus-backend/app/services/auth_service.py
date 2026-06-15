from datetime import UTC, datetime, timedelta
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.jwt import create_access_token
from app.core.password import hash_password, verify_password
from app.models.role import UserRole
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import User, UserSession
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schema import AuthResponse, LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user_schema import UserRead


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)

    def register(self, payload: RegisterRequest) -> AuthResponse:
        if self.users.get_by_email(str(payload.email)):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
        user = User(
            email=str(payload.email).lower(),
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            role=payload.role,
        )
        self.db.add(user)
        self.db.flush()
        if user.role == UserRole.student:
            self.db.add(Student(user_id=user.id))
        elif user.role == UserRole.teacher:
            self.db.add(Teacher(user_id=user.id))
        self._session(user)
        self.db.commit()
        self.db.refresh(user)
        return AuthResponse(user=UserRead.model_validate(user), token=self._token(user))

    def login(self, payload: LoginRequest) -> AuthResponse:
        user = self.users.get_by_email(str(payload.email))
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        self._session(user)
        self.db.commit()
        return AuthResponse(user=UserRead.model_validate(user), token=self._token(user))

    def _token(self, user: User) -> TokenResponse:
        return TokenResponse(access_token=create_access_token(str(user.id), {"role": user.role.value}))

    def _session(self, user: User) -> None:
        self.db.add(
            UserSession(
                user_id=user.id,
                token_jti=str(uuid4()),
                expires_at=datetime.now(UTC) + timedelta(minutes=get_settings().access_token_expire_minutes),
            )
        )
