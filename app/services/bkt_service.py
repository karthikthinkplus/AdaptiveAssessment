from datetime import datetime

from app.models.bkt_state import StudentBKTState


class BKTService:
    @staticmethod
    def initialize_state(student_id, subtopic_id) -> StudentBKTState:
        return StudentBKTState(
            student_id=student_id,
            subtopic_id=subtopic_id,
            p_l0=0.20,
            p_transit=0.15,
            p_guess=0.20,
            p_slip=0.10,
            p_mastery=0.20,
            mastery_status="not_started",
            attempts_count=0,
            correct_count=0,
        )

    @staticmethod
    def update_state(state: StudentBKTState, is_correct: bool, mastery_threshold: float) -> StudentBKTState:
        prior = state.p_mastery
        if is_correct:
            posterior = (prior * (1 - state.p_slip)) / (
                (prior * (1 - state.p_slip)) + ((1 - prior) * state.p_guess)
            )
        else:
            posterior = (prior * state.p_slip) / (
                (prior * state.p_slip) + ((1 - prior) * (1 - state.p_guess))
            )
        updated_mastery = posterior + ((1 - posterior) * state.p_transit)
        state.p_mastery = max(0.0, min(1.0, updated_mastery))
        state.attempts_count += 1
        if is_correct:
            state.correct_count += 1

        accuracy = state.correct_count / max(state.attempts_count, 1)
        if state.p_mastery >= mastery_threshold:
            state.mastery_status = "mastered"
        elif state.attempts_count == 0:
            state.mastery_status = "not_started"
        elif accuracy < 0.4 and state.attempts_count >= 3:
            state.mastery_status = "struggling"
        else:
            state.mastery_status = "learning"
        state.last_updated_at = datetime.utcnow()
        return state
