from app.algorithms.bkt.bkt_config import BKTConfig


class BKTEngine:
    def update(self, mastery: float, is_correct: bool, config: BKTConfig = BKTConfig()) -> float:
        mastery = min(max(mastery, 1e-6), 1 - 1e-6)
        if is_correct:
            numerator = mastery * (1 - config.slip)
            denominator = numerator + (1 - mastery) * config.guess
        else:
            numerator = mastery * config.slip
            denominator = numerator + (1 - mastery) * (1 - config.guess)
        posterior = numerator / denominator if denominator else mastery
        return min(max(posterior + (1 - posterior) * config.learn, 1e-6), 1 - 1e-6)
