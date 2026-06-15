def is_response_time_valid(response_time_ms: int | None, minimum_ms: int = 250, maximum_ms: int = 600_000) -> bool:
    if response_time_ms is None:
        return True
    return minimum_ms <= response_time_ms <= maximum_ms
