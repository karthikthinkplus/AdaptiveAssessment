from typing import Protocol
from uuid import UUID

from app.algorithms.irt.rasch_model import RaschModel


class SelectableQuestion(Protocol):
    id: UUID
    difficulty_b: float


class FisherSelector:
    def __init__(self) -> None:
        self.model = RaschModel()

    def select(self, theta: float, questions: list[SelectableQuestion]) -> SelectableQuestion | None:
        return max(questions, key=lambda q: self.model.information(theta, q.difficulty_b), default=None)
