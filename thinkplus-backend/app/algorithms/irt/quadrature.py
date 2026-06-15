def theta_grid(start: float = -4.0, stop: float = 4.0, step: float = 0.2) -> list[float]:
    count = int((stop - start) / step) + 1
    return [round(start + i * step, 10) for i in range(count)]
