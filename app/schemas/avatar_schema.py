from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AvatarBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    avatar_type: str = Field(min_length=1, max_length=20)
    image_url: str = Field(min_length=1, max_length=500)
    is_active: bool = True
    display_order: int = 0


class AvatarCreate(AvatarBase):
    pass


class AvatarUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    avatar_type: str | None = Field(default=None, min_length=1, max_length=20)
    image_url: str | None = Field(default=None, min_length=1, max_length=500)
    is_active: bool | None = None
    display_order: int | None = None


class AvatarRead(AvatarBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
