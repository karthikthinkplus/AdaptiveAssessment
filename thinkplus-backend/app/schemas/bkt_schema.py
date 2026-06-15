from uuid import UUID

from pydantic import BaseModel


class BKTStateRead(BaseModel):
    student_id: UUID
    subtopic_id: UUID
    mastery_probability: float
    attempts: int
    correct_count: int
