from uuid import UUID


class BacktrackingEngine:
    def choose_review_subtopic(self, prerequisites: list[UUID], mastery: dict[UUID, float]) -> UUID | None:
        if not prerequisites:
            return None
        return min(prerequisites, key=lambda item: mastery.get(item, 0.0))
