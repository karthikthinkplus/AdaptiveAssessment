from app.algorithms.irt.rasch_model import RaschModel


class IRTService:
    def __init__(self) -> None:
        self.model = RaschModel()

    def probability(self, theta: float, difficulty_b: float) -> float:
        return self.model.probability(theta, difficulty_b)
