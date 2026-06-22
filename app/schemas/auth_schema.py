from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserSummary(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    institution_name: str | None = None
    phone_number: str | None = None
    avatar_id: UUID | None = None
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary
    roles: list[str]


class CurrentUserContext(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    roles: list[str]


class StudentSignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    institution_name: str | None = Field(default=None, max_length=255)
    email: EmailStr
    phone_number: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    grade: str | None = Field(default=None, max_length=100)
    avatar_id: UUID | None = None


class TeacherSignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    institution_name: str | None = Field(default=None, max_length=255)
    email: EmailStr
    phone_number: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    avatar_id: UUID | None = None
    department: str | None = Field(default=None, max_length=100)
    designation: str | None = Field(default=None, max_length=100)
