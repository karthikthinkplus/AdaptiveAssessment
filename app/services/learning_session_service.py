from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.constants import (
    EVENT_TYPE_VALID,
    IRT_THETA_LOWER_THRESHOLD,
    IRT_THETA_UPPER_THRESHOLD,
    NAV_ACTION_SESSION_START,
    SESSION_MAX_QUESTIONS,
    SESSION_STATUS_ACTIVE,
    SESSION_STATUS_COMPLETED,
    SESSION_STATUS_PAUSED,
)
from app.exceptions import AppException
from app.models.adaptive_decision_log import AdaptiveDecisionLog
from app.models.learning_session import LearningSession
from app.models.student_response import StudentResponse
from app.repositories.adaptive_decision_repository import AdaptiveDecisionRepository
from app.repositories.bkt_repository import BKTRepository
from app.repositories.irt_repository import IRTRepository
from app.repositories.learning_session_repository import LearningSessionRepository
from app.repositories.question_repository import QuestionRepository
from app.repositories.response_repository import ResponseRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.topic_repository import TopicRepository
from app.schemas.question_schema import StudentQuestionRead
from app.services.bkt_service import BKTService
from app.services.fisher_service import FisherService
from app.services.irt_service import IRTService
from app.services.navigation_service import NavigationService
from app.services.pool_builder_service import PoolBuilderService
from app.services.telemetry_service import TelemetryService


class LearningSessionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.student_repo = StudentRepository(db)
        self.topic_repo = TopicRepository(db)
        self.question_repo = QuestionRepository(db)
        self.session_repo = LearningSessionRepository(db)
        self.response_repo = ResponseRepository(db)
        self.bkt_repo = BKTRepository(db)
        self.irt_repo = IRTRepository(db)
        self.decision_repo = AdaptiveDecisionRepository(db)

    @staticmethod
    def _serialize_student_question(question) -> StudentQuestionRead | None:
        if not question:
            return None
        return StudentQuestionRead(
            id=question.id,
            question_code=question.question_code,
            question_text=question.question_text,
            question_type=question.question_type,
            difficulty_level=question.difficulty_level,
            estimated_time_seconds=question.estimated_time_seconds,
            options=[
                {
                    "id": option.id,
                    "option_label": option.option_label,
                    "option_text": option.option_text,
                    "display_order": option.display_order,
                }
                for option in sorted(question.options, key=lambda item: item.display_order)
            ],
        )

    def _get_student(self, user_id: UUID):
        student = self.student_repo.get_by_user_id(user_id)
        if not student:
            raise AppException("Student profile not found", "STUDENT_NOT_FOUND", 404)
        return student

    def _select_question(self, topic_id: UUID, subtopic_id: UUID | None, session_id: UUID, theta: float):
        previous_responses = self.response_repo.list_by_session(session_id)
        excluded_ids = [response.question_id for response in previous_responses]
        difficulty_gate = PoolBuilderService.difficulty_gate_from_theta(theta)
        
        # Try current subtopic with strict difficulty gate
        current_pool = self.question_repo.list_candidate_questions(topic_id, subtopic_id, excluded_ids, difficulty_gate)
        
        # Relax difficulty gate for current subtopic if pool is too small (avoids premature subtopic jumping)
        if len(current_pool) < 2 and subtopic_id is not None:
            relaxed_gate = ["very easy", "easy", "medium", "hard", "very hard"]
            current_pool = self.question_repo.list_candidate_questions(topic_id, subtopic_id, excluded_ids, relaxed_gate)
            
        # Try fallback topic-wide pool
        topic_pool = self.question_repo.list_candidate_questions(topic_id, None, excluded_ids, difficulty_gate)
        if len(topic_pool) < 2:
            relaxed_gate = ["very easy", "easy", "medium", "hard", "very hard"]
            topic_pool = self.question_repo.list_candidate_questions(topic_id, None, excluded_ids, relaxed_gate)
            
        candidate_pool = PoolBuilderService.fallback_topic_pool(current_pool, topic_pool)
        question, reason = FisherService.choose_best_question(theta, candidate_pool)
        return question, reason, difficulty_gate, len(candidate_pool)


    def start_session(self, student_user_id: UUID, topic_id: UUID) -> dict:
        student = self._get_student(student_user_id)
        topic = self.topic_repo.get_topic(topic_id)
        if not topic:
            raise AppException("Topic not found", "TOPIC_NOT_FOUND", 404)
        subtopics = self.topic_repo.list_subtopics(topic_id)
        if not subtopics:
            raise AppException("No subtopics configured for topic", "SUBTOPICS_NOT_FOUND", 400)
        starting_subtopic = subtopics[0]
        session = LearningSession(
            student_id=student.id,
            topic_id=topic.id,
            current_subtopic_id=starting_subtopic.id,
            status=SESSION_STATUS_ACTIVE,
        )
        self.session_repo.create(session)
        trait = self.irt_repo.get_trait(student.id, topic.id) or IRTService.initialize_trait(student.id, topic.id)
        self.irt_repo.save(trait)
        question, reason, difficulty_gate, pool_size = self._select_question(
            topic.id, starting_subtopic.id, session.id, trait.theta
        )
        decision = AdaptiveDecisionLog(
            student_id=student.id,
            session_id=session.id,
            topic_id=topic.id,
            from_subtopic_id=None,
            to_subtopic_id=starting_subtopic.id,
            navigation_action=NAV_ACTION_SESSION_START,
            difficulty_gate=",".join(difficulty_gate),
            candidate_pool_size=pool_size,
            selected_question_id=question.id if question else None,
            selection_reason=reason,
        )
        self.decision_repo.create(decision)
        self.db.commit()
        return {"session": session, "first_question": self._serialize_student_question(question)}

    def get_session(self, session_id: UUID) -> LearningSession:
        session = self.session_repo.get_by_id(session_id)
        if not session:
            raise AppException("Learning session not found", "SESSION_NOT_FOUND", 404)
        return session

    def get_current_question(self, session_id: UUID, student_user_id: UUID) -> dict:
        student = self._get_student(student_user_id)
        session = self.get_session(session_id)
        if session.student_id != student.id:
            raise AppException("Session does not belong to the current student", "FORBIDDEN", 403)
        
        if session.status == "completed":
            return {"session": session, "question": None}

        # Find the latest adaptive decision log for this session to see what question was selected
        from sqlalchemy import select
        from app.models.adaptive_decision_log import AdaptiveDecisionLog
        
        stmt = (
            select(AdaptiveDecisionLog)
            .where(AdaptiveDecisionLog.session_id == session_id)
            .order_by(AdaptiveDecisionLog.created_at.desc())
        )
        decision = self.db.execute(stmt).scalars().first()
        
        question = None
        if decision and decision.selected_question_id:
            question = self.question_repo.get_question(decision.selected_question_id)
            
        # If no question was selected yet, select one (fallback)
        if not question:
            trait = self.irt_repo.get_trait(student.id, session.topic_id) or IRTService.initialize_trait(student.id, session.topic_id)
            question, reason, difficulty_gate, pool_size = self._select_question(
                session.topic_id, session.current_subtopic_id, session.id, trait.theta
            )
            # Log this decision
            decision = AdaptiveDecisionLog(
                student_id=student.id,
                session_id=session.id,
                topic_id=session.topic_id,
                from_subtopic_id=None,
                to_subtopic_id=session.current_subtopic_id,
                navigation_action="stay",
                difficulty_gate=",".join(difficulty_gate),
                candidate_pool_size=pool_size,
                selected_question_id=question.id if question else None,
                selection_reason=reason,
            )
            self.decision_repo.create(decision)
            self.db.commit()

        return {
            "session": session,
            "question": self._serialize_student_question(question) if question else None
        }


    def pause_session(self, session_id: UUID, student_user_id: UUID) -> LearningSession:
        student = self._get_student(student_user_id)
        session = self.get_session(session_id)
        if session.student_id != student.id:
            raise AppException("Session does not belong to the current student", "FORBIDDEN", 403)
        session.status = SESSION_STATUS_PAUSED
        self.db.commit()
        self.db.refresh(session)
        return session

    def end_session(self, session_id: UUID, student_user_id: UUID) -> LearningSession:
        student = self._get_student(student_user_id)
        session = self.get_session(session_id)
        if session.student_id != student.id:
            raise AppException("Session does not belong to the current student", "FORBIDDEN", 403)
        session.status = SESSION_STATUS_COMPLETED
        session.ended_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(session)
        return session

    def submit_answer(
        self,
        session_id: UUID,
        student_user_id: UUID,
        question_id: UUID,
        selected_option_id: UUID | None,
        submitted_answer: str | None,
        response_time_seconds: float,
    ) -> dict:
        student = self._get_student(student_user_id)
        session = self.get_session(session_id)
        if session.student_id != student.id:
            raise AppException("Session does not belong to the current student", "FORBIDDEN", 403)

        question = self.question_repo.get_question(question_id)
        if not question:
            raise AppException("Question not found", "QUESTION_NOT_FOUND", 404)

        selected_option = None
        is_correct = False
        if selected_option_id:
            selected_option = next((opt for opt in question.options if opt.id == selected_option_id), None)
            if not selected_option:
                raise AppException("Selected option not found", "OPTION_NOT_FOUND", 404)
            is_correct = selected_option.is_correct
        elif submitted_answer and question.correct_answer:
            is_correct = submitted_answer.strip().lower() == question.correct_answer.strip().lower()

        event_type = TelemetryService.classify_event(
            response_time_seconds=response_time_seconds,
            estimated_time_seconds=question.estimated_time_seconds,
            has_answer=bool(selected_option_id or submitted_answer),
        )
        response = StudentResponse(
            student_id=student.id,
            session_id=session.id,
            question_id=question.id,
            topic_id=question.topic_id,
            subtopic_id=question.subtopic_id,
            selected_option_id=selected_option_id,
            submitted_answer=submitted_answer,
            is_correct=is_correct,
            response_time_seconds=response_time_seconds,
            event_type=event_type,
            attempt_number=1,
        )
        self.response_repo.create(response)
        session.total_questions_attempted += 1
        session.total_time_seconds += int(response_time_seconds)
        if is_correct:
            session.total_correct += 1

        subtopic = self.topic_repo.get_subtopic(question.subtopic_id)
        if not subtopic:
            raise AppException("Subtopic not found", "SUBTOPIC_NOT_FOUND", 404)

        bkt_state = self.bkt_repo.get_state(student.id, subtopic.id) or BKTService.initialize_state(student.id, subtopic.id)
        trait = self.irt_repo.get_trait(student.id, question.topic_id) or IRTService.initialize_trait(student.id, question.topic_id)
        previous_mastery = bkt_state.p_mastery
        previous_theta = trait.theta

        if event_type == EVENT_TYPE_VALID:
            BKTService.update_state(bkt_state, is_correct, subtopic.mastery_threshold)
            valid_responses = self.response_repo.list_valid_by_student_topic(student.id, question.topic_id)
            history = [
                {
                    "difficulty_b": resp_question.difficulty_b,
                    "discrimination_a": resp_question.discrimination_a,
                    "is_correct": response_item.is_correct,
                }
                for response_item in valid_responses
                if (resp_question := self.question_repo.get_question(response_item.question_id))
            ]
            IRTService.update_trait(trait, history)
            bkt_state.last_response_id = response.id
            trait.last_response_id = response.id

        self.bkt_repo.save(bkt_state)
        self.irt_repo.save(trait)

        # Calculate correct and incorrect response counts for the current subtopic in this session
        session_responses = self.response_repo.list_by_session(session.id)
        subtopic_responses = [r for r in session_responses if r.subtopic_id == subtopic.id]
        correct_count = sum(1 for r in subtopic_responses if r.is_correct)
        incorrect_count = sum(1 for r in subtopic_responses if not r.is_correct)

        next_edges = self.topic_repo.list_next_edges(subtopic.id)
        prerequisites = self.topic_repo.list_prerequisites(subtopic.id)
        navigation_action = NavigationService.decide_action(
            mastery=bkt_state.p_mastery,
            mastery_threshold=subtopic.mastery_threshold,
            has_next_subtopic=bool(next_edges),
            has_prerequisite=bool(prerequisites),
            correct_count=correct_count,
            incorrect_count=incorrect_count,
        )

        target_subtopic_id = subtopic.id
        if navigation_action == "advance" and next_edges:
            target_subtopic_id = next_edges[0].target_subtopic_id
        elif navigation_action == "backtrack" and prerequisites:
            target_subtopic_id = prerequisites[0].source_subtopic_id
        session.current_subtopic_id = target_subtopic_id

        # ── IRT / count-based stopping rules ──────────────────────────────────
        # The test ends when ANY of the following conditions are true:
        #   1. theta >= +1.50  → student has reached the mastery ceiling
        #   2. theta <= -1.50  → student is below the ability floor
        #   3. questions answered >= 30  → hard question cap reached
        stopping_reason: str | None = None
        if trait.theta >= IRT_THETA_UPPER_THRESHOLD:
            stopping_reason = (
                f"Ability ceiling reached: theta={trait.theta:.3f} >= {IRT_THETA_UPPER_THRESHOLD}"
            )
        elif trait.theta <= IRT_THETA_LOWER_THRESHOLD:
            stopping_reason = (
                f"Ability floor reached: theta={trait.theta:.3f} <= {IRT_THETA_LOWER_THRESHOLD}"
            )
        elif session.total_questions_attempted >= SESSION_MAX_QUESTIONS:
            stopping_reason = (
                f"Question cap reached: {session.total_questions_attempted} >= {SESSION_MAX_QUESTIONS}"
            )

        if stopping_reason:
            next_question, reason, difficulty_gate, pool_size = None, stopping_reason, [], 0
            # Auto-complete the session — the test is done
            session.status = SESSION_STATUS_COMPLETED
            session.ended_at = datetime.now(timezone.utc)
        else:
            next_question, reason, difficulty_gate, pool_size = self._select_question(
                session.topic_id, target_subtopic_id, session.id, trait.theta
            )

        decision = AdaptiveDecisionLog(
            student_id=student.id,
            session_id=session.id,
            response_id=response.id,
            topic_id=session.topic_id,
            from_subtopic_id=subtopic.id,
            to_subtopic_id=target_subtopic_id,
            previous_mastery=previous_mastery,
            updated_mastery=bkt_state.p_mastery,
            previous_theta=previous_theta,
            updated_theta=trait.theta,
            navigation_action=navigation_action,
            difficulty_gate=",".join(difficulty_gate),
            candidate_pool_size=pool_size,
            selected_question_id=next_question.id if next_question else None,
            selection_reason=reason,
        )
        self.decision_repo.create(decision)
        self.db.commit()
        self.db.refresh(session)
        return {
            "is_correct": is_correct,
            "event_type": event_type,
            "navigation_action": navigation_action,
            "session": session,
            "next_question": self._serialize_student_question(next_question),
            "bkt_state": {
                "subtopic_id": str(bkt_state.subtopic_id),
                "p_mastery": bkt_state.p_mastery,
                "mastery_status": bkt_state.mastery_status,
            },
            "irt_state": {
                "topic_id": str(trait.topic_id),
                "theta": trait.theta,
                "standard_error": trait.standard_error,
                "valid_response_count": trait.valid_response_count,
            },
        }
