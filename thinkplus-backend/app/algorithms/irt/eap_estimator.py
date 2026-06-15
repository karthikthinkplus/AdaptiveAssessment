from math import exp, log, sqrt

from app.algorithms.irt.quadrature import theta_grid
from app.algorithms.irt.rasch_model import RaschModel


class EAPEstimator:
    def __init__(self) -> None:
        self.model = RaschModel()

    def estimate(self, observations: list[tuple[float, bool]]) -> tuple[float, float, dict]:
        grid = theta_grid()
        log_weights = []
        for theta in grid:
            log_weight = -0.5 * theta * theta
            for difficulty, correct in observations:
                p = min(max(self.model.probability(theta, difficulty), 1e-9), 1 - 1e-9)
                log_weight += log(p if correct else 1 - p)
            log_weights.append(log_weight)
        max_log = max(log_weights)
        weights = [exp(w - max_log) for w in log_weights]
        total = sum(weights)
        normalized = [w / total for w in weights]
        theta = sum(t * w for t, w in zip(grid, normalized, strict=True))
        variance = sum(((t - theta) ** 2) * w for t, w in zip(grid, normalized, strict=True))
        return theta, sqrt(max(variance, 1e-9)), {f"{t:.1f}": round(w, 8) for t, w in zip(grid, normalized, strict=True)}
