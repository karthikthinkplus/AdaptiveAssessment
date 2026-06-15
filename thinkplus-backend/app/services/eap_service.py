from app.algorithms.irt.eap_estimator import EAPEstimator


class EAPService:
    def __init__(self) -> None:
        self.estimator = EAPEstimator()

    def estimate(self, observations: list[tuple[float, bool]]) -> tuple[float, float, dict]:
        return self.estimator.estimate(observations)
