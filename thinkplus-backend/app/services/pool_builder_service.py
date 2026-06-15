class PoolBuilderService:
    def build_active_pool(self, questions: list) -> list:
        return [question for question in questions if getattr(question, "is_active", False)]
