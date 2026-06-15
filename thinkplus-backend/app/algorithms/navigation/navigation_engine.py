from uuid import UUID


class NavigationEngine:
    def decide(self, current_subtopic_id: UUID, mastery: float) -> tuple[str, UUID | None, str]:
        if mastery >= 0.8:
            return "progress", current_subtopic_id, "Mastery threshold reached"
        if mastery < 0.45:
            return "backtrack", current_subtopic_id, "Review threshold reached"
        return "stay", current_subtopic_id, "Continue current subtopic"
