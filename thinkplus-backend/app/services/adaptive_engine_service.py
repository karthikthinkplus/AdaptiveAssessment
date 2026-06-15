from app.services.fisher_service import FisherService


class AdaptiveEngineService:
    def __init__(self) -> None:
        self.fisher = FisherService()

    def select_next_question(self, theta: float, questions: list):
        return self.fisher.select(theta, questions)
