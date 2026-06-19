from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TeacherRead(BaseModel):
    id: UUID
    user_id: UUID
    teacher_code: str
    department: str | None = None
    designation: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
