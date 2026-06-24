ROLE_STUDENT = "student"
ROLE_TEACHER = "teacher"
ROLE_CONTENT_MANAGER = "content_manager"
ROLE_ADMIN = "admin"

ALL_ROLES = [
    ROLE_STUDENT,
    ROLE_TEACHER,
    ROLE_CONTENT_MANAGER,
    ROLE_ADMIN,
]

SESSION_STATUS_ACTIVE = "active"
SESSION_STATUS_PAUSED = "paused"
SESSION_STATUS_COMPLETED = "completed"

QUESTION_STATUS_DRAFT = "draft"
QUESTION_STATUS_APPROVED = "approved"

EVENT_TYPE_VALID = "valid"
EVENT_TYPE_RAPID_GUESS = "rapid_guess"
EVENT_TYPE_TIMEOUT = "timeout"
EVENT_TYPE_INVALID = "invalid"
EVENT_TYPE_TECHNICAL_ERROR = "technical_error"

VALID_EVENT_TYPES = {
    EVENT_TYPE_VALID,
    EVENT_TYPE_RAPID_GUESS,
    EVENT_TYPE_TIMEOUT,
    EVENT_TYPE_INVALID,
    EVENT_TYPE_TECHNICAL_ERROR,
}

NAV_ACTION_SESSION_START = "session_start"
NAV_ACTION_STAY = "stay"
NAV_ACTION_ADVANCE = "advance"
NAV_ACTION_BACKTRACK = "backtrack"
NAV_ACTION_REVIEW = "review"

# IRT-based session stopping rules
IRT_THETA_UPPER_THRESHOLD = 1.50   # student has mastered the topic ceiling
IRT_THETA_LOWER_THRESHOLD = -1.50  # student is below the floor of this topic
SESSION_MAX_QUESTIONS = 30         # hard cap on questions per session
