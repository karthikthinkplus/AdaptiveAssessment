from app.models.question import Question


class PoolBuilderService:
    @staticmethod
    def difficulty_gate_from_theta(theta: float) -> list[str]:
        if theta < -0.5:
            return ["very easy", "easy", "medium"]
        if theta > 0.5:
            return ["medium", "hard"]
        return ["easy", "medium", "hard"]

    @staticmethod
    def fallback_topic_pool(current_pool: list[Question], topic_pool: list[Question]) -> list[Question]:
        return current_pool if len(current_pool) >= 2 else topic_pool
