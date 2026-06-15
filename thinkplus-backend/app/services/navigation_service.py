from uuid import UUID

from app.algorithms.navigation.navigation_engine import NavigationEngine


class NavigationService:
    def __init__(self) -> None:
        self.engine = NavigationEngine()

    def decide(self, current_subtopic_id: UUID, mastery: float) -> tuple[str, UUID | None, str]:
        return self.engine.decide(current_subtopic_id, mastery)
