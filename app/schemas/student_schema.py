from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class StudentRead(BaseModel):
    id: UUID
    user_id: UUID
    student_code: str
    grade: str | None = None
    batch_name: str | None = None
    current_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
