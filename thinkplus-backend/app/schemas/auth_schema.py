from pydantic import BaseModel, EmailStr, Field

from app.models.role import UserRole
from app.schemas.user_schema import UserRead


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)
    full_name: str
    role: UserRole = UserRole.student


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    user: UserRead
    token: TokenResponse
