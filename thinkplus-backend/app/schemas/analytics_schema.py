from uuid import UUID

from pydantic import BaseModel


class PlatformAnalytics(BaseModel):
    users: int
    students: int
    teachers: int
    topics: int
    questions: int
    assessments: int
    learning_sessions: int
    responses: int


class StudentAnalytics(BaseModel):
    student_id: UUID
    responses: int
    correct_responses: int
    average_mastery: float
    average_theta: float
