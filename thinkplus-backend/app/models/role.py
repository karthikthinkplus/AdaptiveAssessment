from enum import StrEnum


class UserRole(StrEnum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class AssessmentStatus(StrEnum):
    draft = "draft"
    active = "active"
    completed = "completed"
    archived = "archived"


class AttemptStatus(StrEnum):
    in_progress = "in_progress"
    completed = "completed"
    abandoned = "abandoned"


class QuestionType(StrEnum):
    multiple_choice = "multiple_choice"
    numeric = "numeric"
    text = "text"


class SessionStatus(StrEnum):
    active = "active"
    completed = "completed"
    abandoned = "abandoned"


class DecisionType(StrEnum):
    start = "start"
    next_question = "next_question"
    progress = "progress"
    backtrack = "backtrack"
    complete = "complete"
