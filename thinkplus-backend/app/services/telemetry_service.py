from app.algorithms.telemetry.response_time_filter import is_response_time_valid


class TelemetryService:
    def is_valid_response_time(self, response_time_ms: int | None) -> bool:
        return is_response_time_valid(response_time_ms)
