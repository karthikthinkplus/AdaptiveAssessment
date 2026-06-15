from datetime import UTC, datetime, timedelta
from math import exp, sqrt
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models as m
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories import (
    AdaptiveRepository,
    AssessmentRepository,
    AttemptRepository,
    LearningSessionRepository,
    QuestionRepository,
    ResponseRepository,
    StudentRepository,
    SubtopicRepository,
    TeacherRepository,
    TopicRepository,
    UserRepository,
)
from app.schemas import (
    AdaptiveNextQuestionRead,
    AnalyticsSummary,
    AssessmentAttemptCreate,
    AssessmentAttemptRead,
    AssessmentCreate,
    AssessmentRead,
    AuthRead,
    BKTStateRead,
    LearningSessionCreate,
    LearningSessionRead,
    LoginRequest,
    QuestionCreate,
    QuestionRead,
    ResponseCreate,
    StudentAnalytics,
    StudentCreate,
    StudentRead,
    StudentResponseRead,
    SubtopicCreate,
    SubtopicRead,
    TeacherCreate,
    TeacherRead,
    ThetaRead,
    TokenRead,
    TopicCreate,
    TopicRead,
    UserCreate,
    UserRead,
)


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)

    def register(self, payload: UserCreate) -> AuthRead:
        if self.users.get_by_email(str(payload.email)):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

        user = m.User(
            email=str(payload.email).lower(),
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            role=payload.role,
            metadata_=payload.profile,
        )
        self.db.add(user)
        self.db.flush()
        if user.role == m.UserRole.student:
            self.db.add(m.Student(user_id=user.id, enrollment_metadata=payload.profile))
        elif user.role == m.UserRole.teacher:
            self.db.add(m.Teacher(user_id=user.id, profile_metadata=payload.profile))
        self._create_session(user)
        self.db.commit()
        self.db.refresh(user)
        return AuthRead(user=UserRead.model_validate(user), token=self._token(user))

    def login(self, payload: LoginRequest) -> AuthRead:
        user = self.users.get_by_email(str(payload.email))
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
        self._create_session(user)
        self.db.commit()
        return AuthRead(user=UserRead.model_validate(user), token=self._token(user))

    def _create_session(self, user: m.User) -> None:
        settings = get_settings()
        self.db.add(
            m.UserSession(
                user_id=user.id,
                token_jti=str(uuid4()),
                expires_at=datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes),
            )
        )

    def _token(self, user: m.User) -> TokenRead:
        return TokenRead(access_token=create_access_token(str(user.id), {"role": user.role.value}))


class CatalogService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.topics = TopicRepository(db)
        self.subtopics = SubtopicRepository(db)
        self.questions = QuestionRepository(db)

    def create_topic(self, payload: TopicCreate) -> TopicRead:
        topic = self.topics.add(m.Topic(name=payload.name, description=payload.description, metadata_=payload.metadata))
        self.db.commit()
        self.db.refresh(topic)
        return TopicRead.model_validate(topic)

    def list_topics(self) -> list[TopicRead]:
        return [TopicRead.model_validate(topic) for topic in self.topics.list(limit=500)]

    def create_subtopic(self, payload: SubtopicCreate) -> SubtopicRead:
        if not self.topics.get(payload.topic_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
        subtopic = self.subtopics.add(
            m.Subtopic(
                topic_id=payload.topic_id,
                name=payload.name,
                description=payload.description,
                sequence_order=payload.sequence_order,
                metadata_=payload.metadata,
            )
        )
        self.db.commit()
        self.db.refresh(subtopic)
        return SubtopicRead.model_validate(subtopic)

    def list_subtopics(self, topic_id: UUID) -> list[SubtopicRead]:
        return [SubtopicRead.model_validate(subtopic) for subtopic in self.subtopics.list_for_topic(topic_id)]

    def add_topic_prerequisite(self, topic_id: UUID, prerequisite_id: UUID, weight: float, metadata: dict) -> dict:
        self.db.add(
            m.TopicPrerequisite(
                topic_id=topic_id,
                prerequisite_topic_id=prerequisite_id,
                weight=weight,
                metadata_=metadata,
            )
        )
        self.db.commit()
        return {"detail": "topic prerequisite created"}

    def add_subtopic_prerequisite(
        self,
        subtopic_id: UUID,
        prerequisite_id: UUID,
        weight: float,
        metadata: dict,
    ) -> dict:
        self.db.add(
            m.SubtopicPrerequisite(
                subtopic_id=subtopic_id,
                prerequisite_subtopic_id=prerequisite_id,
                weight=weight,
                metadata_=metadata,
            )
        )
        self.db.commit()
        return {"detail": "subtopic prerequisite created"}

    def create_question(self, payload: QuestionCreate, user_id: UUID | None) -> QuestionRead:
        if not self.subtopics.get(payload.subtopic_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtopic not found")
        question = self.questions.add(
            m.Question(
                subtopic_id=payload.subtopic_id,
                created_by_user_id=user_id,
                question_type=payload.question_type,
                prompt=payload.prompt,
                correct_answer=payload.correct_answer,
                difficulty_b=payload.difficulty_b,
                is_active=payload.is_active,
                metadata_=payload.metadata,
            )
        )
        self.db.flush()
        for option in payload.options:
            self.db.add(
                m.QuestionOption(
                    question_id=question.id,
                    option_key=option.option_key,
                    option_text=option.option_text,
                    is_correct=option.is_correct,
                    sequence_order=option.sequence_order,
                    metadata_=option.metadata,
                )
            )
        self.db.add(
            m.QuestionVersion(
                question_id=question.id,
                version_number=1,
                snapshot=payload.model_dump(mode="json"),
                created_by_user_id=user_id,
            )
        )
        self.db.commit()
        question = self.questions.get_with_options(question.id)
        return QuestionRead.model_validate(question)

    def list_questions(self, subtopic_id: UUID) -> list[QuestionRead]:
        return [QuestionRead.model_validate(q) for q in self.questions.list_for_subtopic(subtopic_id)]


class PeopleService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.students = StudentRepository(db)
        self.teachers = TeacherRepository(db)
        self.users = UserRepository(db)

    def create_student(self, payload: StudentCreate) -> StudentRead:
        if not self.users.get(payload.user_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        student = self.students.add(m.Student(**payload.model_dump()))
        self.db.commit()
        self.db.refresh(student)
        return StudentRead.model_validate(student)

    def list_students(self) -> list[StudentRead]:
        return [StudentRead.model_validate(s) for s in self.students.list(limit=500)]

    def create_teacher(self, payload: TeacherCreate) -> TeacherRead:
        if not self.users.get(payload.user_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        teacher = self.teachers.add(m.Teacher(**payload.model_dump()))
        self.db.commit()
        self.db.refresh(teacher)
        return TeacherRead.model_validate(teacher)

    def list_teachers(self) -> list[TeacherRead]:
        return [TeacherRead.model_validate(t) for t in self.teachers.list(limit=500)]


class AssessmentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.assessments = AssessmentRepository(db)
        self.attempts = AttemptRepository(db)

    def create_assessment(self, payload: AssessmentCreate, created_by_user_id: UUID | None) -> AssessmentRead:
        assessment = self.assessments.add(
            m.Assessment(
                title=payload.title,
                topic_id=payload.topic_id,
                created_by_user_id=created_by_user_id,
                status=payload.status,
                config=payload.config,
            )
        )
        self.db.flush()
        for index, question_id in enumerate(payload.question_ids, start=1):
            self.db.add(
                m.AssessmentQuestion(
                    assessment_id=assessment.id,
                    question_id=question_id,
                    sequence_order=index,
                )
            )
        self.db.commit()
        self.db.refresh(assessment)
        return AssessmentRead.model_validate(assessment)

    def list_assessments(self) -> list[AssessmentRead]:
        return [AssessmentRead.model_validate(a) for a in self.assessments.list(limit=500)]

    def start_attempt(self, payload: AssessmentAttemptCreate) -> AssessmentAttemptRead:
        attempt = self.attempts.add(
            m.AssessmentAttempt(
                assessment_id=payload.assessment_id,
                student_id=payload.student_id,
                status=m.AttemptStatus.in_progress,
                metadata_=payload.metadata,
            )
        )
        self.db.commit()
        self.db.refresh(attempt)
        return AssessmentAttemptRead.model_validate(attempt)


class LearningService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.sessions = LearningSessionRepository(db)
        self.responses = ResponseRepository(db)
        self.questions = QuestionRepository(db)
        self.subtopics = SubtopicRepository(db)
        self.adaptive = AdaptiveRepository(db)

    def start_session(self, payload: LearningSessionCreate) -> LearningSessionRead:
        current_subtopic_id = payload.current_subtopic_id
        if current_subtopic_id is None:
            subtopics = self.subtopics.list_for_topic(payload.topic_id)
            current_subtopic_id = subtopics[0].id if subtopics else None
        session = self.sessions.add(
            m.LearningSession(
                student_id=payload.student_id,
                topic_id=payload.topic_id,
                current_subtopic_id=current_subtopic_id,
                status=m.SessionStatus.active,
                metadata_=payload.metadata,
            )
        )
        self.db.commit()
        self.db.refresh(session)
        return LearningSessionRead.model_validate(session)

    def submit_response(self, session_id: UUID, payload: ResponseCreate) -> StudentResponseRead:
        session = self.sessions.get(session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning session not found")
        question = self.questions.get_with_options(payload.question_id)
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
        is_correct = self._score(question, payload)
        response = self.responses.add(
            m.StudentResponse(
                student_id=session.student_id,
                learning_session_id=session.id,
                assessment_attempt_id=payload.assessment_attempt_id,
                question_id=payload.question_id,
                selected_option_id=payload.selected_option_id,
                answer_text=payload.answer_text,
                is_correct=is_correct,
                response_time_ms=payload.response_time_ms,
                metadata_=payload.metadata,
            )
        )
        self._update_bkt(session.student_id, question.subtopic_id, response.id, is_correct)
        self._update_theta(session.student_id, session.topic_id, response.id, question.difficulty_b, is_correct)
        self.db.commit()
        self.db.refresh(response)
        return StudentResponseRead.model_validate(response)

    def get_bkt_state(self, student_id: UUID, subtopic_id: UUID) -> BKTStateRead:
        state = self.adaptive.bkt_state(student_id, subtopic_id)
        if state is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BKT state not found")
        return BKTStateRead.model_validate(state)

    def get_theta(self, student_id: UUID, topic_id: UUID) -> ThetaRead:
        theta = self.adaptive.theta(student_id, topic_id)
        if theta is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Theta not found")
        return ThetaRead.model_validate(theta)

    def _score(self, question: m.Question, payload: ResponseCreate) -> bool:
        if payload.selected_option_id:
            return any(option.id == payload.selected_option_id and option.is_correct for option in question.options)
        if question.correct_answer is None:
            return False
        return (payload.answer_text or "").strip().casefold() == question.correct_answer.strip().casefold()

    def _update_bkt(self, student_id: UUID, subtopic_id: UUID, response_id: UUID, is_correct: bool) -> None:
        params = {"prior": 0.2, "learn": 0.12, "guess": 0.2, "slip": 0.1}
        state = self.adaptive.bkt_state(student_id, subtopic_id)
        prior = state.mastery_probability if state else params["prior"]
        posterior = self._bkt(prior, is_correct, params)
        if state is None:
            state = m.StudentBKTState(student_id=student_id, subtopic_id=subtopic_id, parameters=params)
            self.db.add(state)
            self.db.flush()
        state.mastery_probability = posterior
        state.attempts += 1
        state.correct_count += int(is_correct)
        state.parameters = params
        self.db.add(
            m.BKTHistory(
                student_id=student_id,
                subtopic_id=subtopic_id,
                response_id=response_id,
                prior_probability=prior,
                posterior_probability=posterior,
                parameters=params,
            )
        )

    def _update_theta(
        self,
        student_id: UUID,
        topic_id: UUID,
        response_id: UUID,
        difficulty_b: float,
        is_correct: bool,
    ) -> None:
        current = self.adaptive.theta(student_id, topic_id)
        theta_before = current.theta if current else 0.0
        p = 1 / (1 + exp(-(theta_before - difficulty_b)))
        information = max(p * (1 - p), 0.05)
        theta_after = theta_before + (1 if is_correct else -1) * 0.25 * information
        standard_error = 1 / sqrt(information)
        posterior = {"method": "online_rasch_update", "difficulty_b": difficulty_b, "correct": is_correct}
        if current is None:
            current = m.StudentTopicTheta(student_id=student_id, topic_id=topic_id)
            self.db.add(current)
            self.db.flush()
        current.theta = theta_after
        current.standard_error = standard_error
        current.posterior = posterior
        self.db.add(
            m.ThetaHistory(
                student_id=student_id,
                topic_id=topic_id,
                response_id=response_id,
                theta_before=theta_before,
                theta_after=theta_after,
                standard_error=standard_error,
                posterior=posterior,
            )
        )

    def _bkt(self, mastery: float, is_correct: bool, params: dict) -> float:
        if is_correct:
            numerator = mastery * (1 - params["slip"])
            denominator = numerator + (1 - mastery) * params["guess"]
        else:
            numerator = mastery * params["slip"]
            denominator = numerator + (1 - mastery) * (1 - params["guess"])
        posterior = numerator / denominator if denominator else mastery
        return min(max(posterior + (1 - posterior) * params["learn"], 0.000001), 0.999999)


class AdaptiveService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.sessions = LearningSessionRepository(db)
        self.questions = QuestionRepository(db)
        self.subtopics = SubtopicRepository(db)
        self.adaptive = AdaptiveRepository(db)

    def next_question(self, session_id: UUID) -> AdaptiveNextQuestionRead:
        session = self.sessions.get(session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning session not found")
        if session.current_subtopic_id is None:
            return self._decision(session, None, m.DecisionType.complete, "No active subtopic")
        answered = self.adaptive.answered_question_ids(session.id)
        candidates = [
            q
            for q in self.questions.list_for_subtopic(session.current_subtopic_id, active_only=True)
            if q.id not in answered
        ]
        theta = self.adaptive.theta(session.student_id, session.topic_id)
        ability = theta.theta if theta else 0.0
        selected = max(candidates, key=lambda q: self._fisher(ability, q.difficulty_b), default=None)
        return self._decision(session, selected, m.DecisionType.next_question, "Fisher information selection")

    def _decision(
        self,
        session: m.LearningSession,
        question: m.Question | None,
        decision_type: m.DecisionType,
        reason: str,
    ) -> AdaptiveNextQuestionRead:
        decision = m.AdaptiveDecision(
            learning_session_id=session.id,
            student_id=session.student_id,
            decision_type=decision_type,
            selected_question_id=question.id if question else None,
            from_subtopic_id=session.current_subtopic_id,
            to_subtopic_id=session.current_subtopic_id,
            reason=reason,
            decision_payload={"selector": "rasch_fisher_1pl"},
        )
        self.db.add(decision)
        self.db.commit()
        self.db.refresh(decision)
        return AdaptiveNextQuestionRead(
            decision=decision,
            question=QuestionRead.model_validate(question) if question else None,
        )

    def _fisher(self, theta: float, difficulty_b: float) -> float:
        p = 1 / (1 + exp(-(theta - difficulty_b)))
        return p * (1 - p)


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.adaptive = AdaptiveRepository(db)

    def platform(self) -> AnalyticsSummary:
        return AnalyticsSummary(
            users=self.adaptive.aggregate_count(m.User),
            students=self.adaptive.aggregate_count(m.Student),
            teachers=self.adaptive.aggregate_count(m.Teacher),
            topics=self.adaptive.aggregate_count(m.Topic),
            questions=self.adaptive.aggregate_count(m.Question),
            assessments=self.adaptive.aggregate_count(m.Assessment),
            learning_sessions=self.adaptive.aggregate_count(m.LearningSession),
            responses=self.adaptive.aggregate_count(m.StudentResponse),
        )

    def student(self, student_id: UUID) -> StudentAnalytics:
        responses = int(
            self.db.scalar(
                select(func.count(m.StudentResponse.id)).where(
                    m.StudentResponse.student_id == student_id,
                    m.StudentResponse.deleted_at.is_(None),
                )
            )
            or 0
        )
        correct = int(
            self.db.scalar(
                select(func.count(m.StudentResponse.id)).where(
                    m.StudentResponse.student_id == student_id,
                    m.StudentResponse.is_correct.is_(True),
                    m.StudentResponse.deleted_at.is_(None),
                )
            )
            or 0
        )
        mastery = float(
            self.db.scalar(
                select(func.coalesce(func.avg(m.StudentBKTState.mastery_probability), 0)).where(
                    m.StudentBKTState.student_id == student_id,
                    m.StudentBKTState.deleted_at.is_(None),
                )
            )
            or 0
        )
        theta = float(
            self.db.scalar(
                select(func.coalesce(func.avg(m.StudentTopicTheta.theta), 0)).where(
                    m.StudentTopicTheta.student_id == student_id,
                    m.StudentTopicTheta.deleted_at.is_(None),
                )
            )
            or 0
        )
        return StudentAnalytics(
            student_id=student_id,
            responses=responses,
            correct_responses=correct,
            average_mastery=mastery,
            average_theta=theta,
        )
