from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.analytics_repository import AnalyticsRepository


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = AnalyticsRepository(db)

    def get_student_analytics(self, student_id: UUID) -> dict:
        total_sessions, total_attempted, total_correct = self.repo.student_session_stats(student_id)
        states = self.repo.mastery_states(student_id)
        traits = self.repo.irt_traits(student_id)
        mastery_distribution: dict[str, int] = {}
        for state in states:
            mastery_distribution[state.mastery_status] = mastery_distribution.get(state.mastery_status, 0) + 1

        latest_theta_by_topic = {str(trait.topic_id): trait.theta for trait in traits}
        accuracy = round((total_correct / total_attempted) * 100, 2) if total_attempted else 0.0
        return {
            "student_id": str(student_id),
            "total_sessions": total_sessions,
            "total_questions_attempted": total_attempted,
            "total_correct": total_correct,
            "accuracy": accuracy,
            "mastery_distribution": mastery_distribution,
            "latest_theta_by_topic": latest_theta_by_topic,
        }

    def get_session_analytics(self, session_id: UUID) -> dict:
        responses = self.repo.session_response_stats(session_id)
        decisions = self.repo.session_decisions(session_id)
        total_attempted = len(responses)
        total_correct = sum(1 for response in responses if response.is_correct)
        event_distribution: dict[str, int] = {}
        for response in responses:
            event_distribution[response.event_type] = event_distribution.get(response.event_type, 0) + 1
        navigation_distribution: dict[str, int] = {}
        for decision in decisions:
            navigation_distribution[decision.navigation_action] = (
                navigation_distribution.get(decision.navigation_action, 0) + 1
            )
        topic_id = str(responses[0].topic_id) if responses else ""
        accuracy = round((total_correct / total_attempted) * 100, 2) if total_attempted else 0.0
        return {
            "session_id": str(session_id),
            "topic_id": topic_id,
            "total_questions_attempted": total_attempted,
            "total_correct": total_correct,
            "accuracy": accuracy,
            "event_type_distribution": event_distribution,
            "navigation_distribution": navigation_distribution,
        }
