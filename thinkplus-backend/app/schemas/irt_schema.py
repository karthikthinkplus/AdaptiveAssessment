from uuid import UUID

from pydantic import BaseModel


class ThetaRead(BaseModel):
    student_id: UUID
    topic_id: UUID
    theta: float
    standard_error: float
