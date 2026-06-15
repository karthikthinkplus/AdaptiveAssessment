from app.algorithms.bkt.bkt_engine import BKTEngine


class BKTService:
    def __init__(self) -> None:
        self.engine = BKTEngine()

    def update_mastery(self, mastery: float, is_correct: bool) -> float:
        return self.engine.update(mastery, is_correct)
