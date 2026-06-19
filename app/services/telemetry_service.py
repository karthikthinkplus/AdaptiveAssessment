from app.core.constants import (
    EVENT_TYPE_INVALID,
    EVENT_TYPE_RAPID_GUESS,
    EVENT_TYPE_TECHNICAL_ERROR,
    EVENT_TYPE_TIMEOUT,
    EVENT_TYPE_VALID,
)


class TelemetryService:
    @staticmethod
    def classify_event(
        response_time_seconds: float,
        estimated_time_seconds: int | None,
        has_answer: bool,
    ) -> str:
        if response_time_seconds < 0:
            return EVENT_TYPE_TECHNICAL_ERROR
        if not has_answer:
            return EVENT_TYPE_TIMEOUT
        if estimated_time_seconds and response_time_seconds < max(2.0, estimated_time_seconds * 0.2):
            return EVENT_TYPE_RAPID_GUESS
        if response_time_seconds <= 0:
            return EVENT_TYPE_INVALID
        return EVENT_TYPE_VALID
