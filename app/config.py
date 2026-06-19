from functools import lru_cache

from pydantic import EmailStr, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_HOST: str
    DATABASE_PORT: int
    DATABASE_NAME: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_URL: str

    JWT_SECRET_KEY: str = Field(default="change-this-secret")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    FRONTEND_URL: str = Field(default="http://localhost:3000")

    ADMIN_EMAIL: EmailStr = Field(default="admin@thinkplus.com")
    ADMIN_PASSWORD: str = Field(default="Admin@12345")
    ADMIN_FULL_NAME: str = Field(default="ThinkPlus Admin")

    CONTENT_MANAGER_EMAIL: EmailStr = Field(default="content@thinkplus.com")
    CONTENT_MANAGER_PASSWORD: str = Field(default="Content@12345")
    CONTENT_MANAGER_FULL_NAME: str = Field(default="ThinkPlus Content Manager")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
