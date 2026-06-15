from app.algorithms.fisher.fisher_selector import FisherSelector, SelectableQuestion


class FisherService:
    def __init__(self) -> None:
        self.selector = FisherSelector()

    def select(self, theta: float, questions: list[SelectableQuestion]) -> SelectableQuestion | None:
        return self.selector.select(theta, questions)
