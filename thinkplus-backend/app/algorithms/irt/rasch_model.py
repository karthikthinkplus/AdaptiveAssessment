from math import exp


class RaschModel:
    def probability(self, theta: float, difficulty_b: float) -> float:
        return 1 / (1 + exp(-(theta - difficulty_b)))

    def information(self, theta: float, difficulty_b: float) -> float:
        p = self.probability(theta, difficulty_b)
        return p * (1 - p)
