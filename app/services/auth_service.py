from datetime import datetime

from sqlalchemy.orm import Session

from app.core.constants import ROLE_STUDENT, ROLE_TEACHER
from app.core.jwt import create_access_token
from app.core.password import hash_password, verify_password
from app.exceptions import AppException
from app.models.role import UserRole
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import User
from app.repositories.role_repository import RoleRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.teacher_repository import TeacherRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schema import (
    LoginData,
    LoginRequest,
    StudentSignupRequest,
    TeacherSignupRequest,
    UserSummary,
)


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)
        self.student_repo = StudentRepository(db)
        self.teacher_repo = TeacherRepository(db)

    def _ensure_email_available(self, email: str) -> None:
        if self.user_repo.get_by_email(email):
            raise AppException("Email already exists", "EMAIL_ALREADY_EXISTS", 409)

    def _assign_role(self, user: User, role_name: str) -> None:
        role = self.role_repo.get_by_name(role_name)
        if not role:
            raise AppException("Required role not found", "ROLE_NOT_FOUND", 500)
        self.user_repo.assign_role(UserRole(user_id=user.id, role_id=role.id))

    def signup_student(self, payload: StudentSignupRequest) -> User:
        self._ensure_email_available(payload.email)
        user = User(
            email=payload.email,
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            institution_name=payload.institution_name,
            phone_number=payload.phone_number,
            avatar_id=payload.avatar_id,
        )
        self.user_repo.create(user)
        self._assign_role(user, ROLE_STUDENT)
        student = Student(
            user_id=user.id,
            student_code=f"STU-{str(user.id)[:8].upper()}",
            grade=payload.grade,
        )
        self.student_repo.create(student)
        self.db.commit()
        return self.user_repo.get_by_id(user.id)

    def signup_teacher(self, payload: TeacherSignupRequest) -> User:
        self._ensure_email_available(payload.email)
        user = User(
            email=payload.email,
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            institution_name=payload.institution_name,
            phone_number=payload.phone_number,
            avatar_id=payload.avatar_id,
        )
        self.user_repo.create(user)
        self._assign_role(user, ROLE_TEACHER)
        teacher = Teacher(
            user_id=user.id,
            teacher_code=f"TCH-{str(user.id)[:8].upper()}",
            department=payload.department,
            designation=payload.designation,
        )
        self.teacher_repo.create(teacher)
        self.db.commit()
        return self.user_repo.get_by_id(user.id)

    def login(self, payload: LoginRequest) -> LoginData:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise AppException("Invalid email or password", "INVALID_CREDENTIALS", 401)
        roles = [role.name for role in user.roles if role.is_active]
        user.last_login_at = datetime.utcnow()
        self.db.commit()
        token = create_access_token(user.id, roles)
        return LoginData(
            access_token=token,
            token_type="bearer",
            user=UserSummary.model_validate(user),
            roles=roles,
        )
