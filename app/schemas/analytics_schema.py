from pydantic import BaseModel


class StudentAnalyticsRead(BaseModel):
    student_id: str
    total_sessions: int
    total_questions_attempted: int
    total_correct: int
    accuracy: float
    mastery_distribution: dict
    latest_theta_by_topic: dict


class SessionAnalyticsRead(BaseModel):
    session_id: str
    topic_id: str
    total_questions_attempted: int
    total_correct: int
    accuracy: float
    event_type_distribution: dict
    navigation_distribution: dict
