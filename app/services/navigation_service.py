from app.core.constants import (
    NAV_ACTION_ADVANCE,
    NAV_ACTION_BACKTRACK,
    NAV_ACTION_REVIEW,
    NAV_ACTION_STAY,
)


class NavigationService:
    @staticmethod
    def decide_action(
        mastery: float,
        mastery_threshold: float,
        has_next_subtopic: bool,
        has_prerequisite: bool,
    ) -> str:
        if mastery >= mastery_threshold and has_next_subtopic:
            return NAV_ACTION_ADVANCE
        if mastery < 0.4 and has_prerequisite:
            return NAV_ACTION_BACKTRACK
        if mastery_threshold > mastery >= 0.8:
            return NAV_ACTION_REVIEW
        return NAV_ACTION_STAY
