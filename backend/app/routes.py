from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models import User, UserRole
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
    PrerequisiteCreate,
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
    TopicCreate,
    TopicRead,
    UserCreate,
    UserRead,
)
from app.services import (
    AdaptiveService,
    AnalyticsService,
    AssessmentService,
    AuthService,
    CatalogService,
    LearningService,
    PeopleService,
)

router = APIRouter()


@router.post("/auth/register", response_model=AuthRead, tags=["Authentication"], status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return AuthService(db).register(payload)


@router.post("/auth/login", response_model=AuthRead, tags=["Authentication"])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(payload)


@router.get("/auth/me", response_model=UserRead, tags=["Authentication"])
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/students", response_model=StudentRead, tags=["Students"], status_code=201)
def create_student(
    payload: StudentCreate,
    _: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    return PeopleService(db).create_student(payload)


@router.get("/students", response_model=list[StudentRead], tags=["Students"])
def list_students(
    _: User = Depends(require_roles(UserRole.teacher, UserRole.admin)),
    db: Session = Depends(get_db),
):
    return PeopleService(db).list_students()


@router.post("/teachers", response_model=TeacherRead, tags=["Teachers"], status_code=201)
def create_teacher(
    payload: TeacherCreate,
    _: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    return PeopleService(db).create_teacher(payload)


@router.get("/teachers", response_model=list[TeacherRead], tags=["Teachers"])
def list_teachers(
    _: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    return PeopleService(db).list_teachers()


@router.post("/topics", response_model=TopicRead, tags=["Topics"], status_code=201)
def create_topic(
    payload: TopicCreate,
    _: User = Depends(require_roles(UserRole.teacher, UserRole.admin)),
    db: Session = Depends(get_db),
):
    return CatalogService(db).create_topic(payload)


@router.get("/topics", response_model=list[TopicRead], tags=["Topics"])
def list_topics(db: Session = Depends(get_db)):
    return CatalogService(db).list_topics()


@router.post("/topics/{topic_id}/prerequisites", tags=["Topics"], status_code=201)
def add_topic_prerequisite(
    topic_id: UUID,
    payload: PrerequisiteCreate,
    _: User = Depends(require_roles(UserRole.teacher, UserRole.admin)),
    db: Session = Depends(get_db),
):
    return CatalogService(db).add_topic_prerequisite(
        topic_id,
        payload.prerequisite_id,
        payload.weight,
        payload.metadata,
    )


@router.post("/subtopics", response_model=SubtopicRead, tags=["Subtopics"], status_code=201)
def create_subtopic(
    payload: SubtopicCreate,
    _: User = Depends(require_roles(UserRole.teacher, UserRole.admin)),
    db: Session = Depends(get_db),
):
    return CatalogService(db).create_subtopic(payload)


@router.get("/topics/{topic_id}/subtopics", response_model=list[SubtopicRead], tags=["Subtopics"])
def list_subtopics(topic_id: UUID, db: Session = Depends(get_db)):
    return CatalogService(db).list_subtopics(topic_id)


@router.post("/subtopics/{subtopic_id}/prerequisites", tags=["Subtopics"], status_code=201)
def add_subtopic_prerequisite(
    subtopic_id: UUID,
    payload: PrerequisiteCreate,
    _: User = Depends(require_roles(UserRole.teacher, UserRole.admin)),
    db: Session = Depends(get_db),
):
    return CatalogService(db).add_subtopic_prerequisite(
        subtopic_id,
        payload.prerequisite_id,
        payload.weight,
        payload.metadata,
    )


@router.post("/questions", response_model=QuestionRead, tags=["Questions"], status_code=201)
def create_question(
    payload: QuestionCreate,
    current_user: User = Depends(require_roles(UserRole.teacher, UserRole.admin)),
    db: Session = Depends(get_db),
):
    return CatalogService(db).create_question(payload, current_user.id)


@router.get("/questions", response_model=list[QuestionRead], tags=["Questions"])
def list_questions(
    subtopic_id: UUID,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CatalogService(db).list_questions(subtopic_id)


@router.post("/assessments", response_model=AssessmentRead, tags=["Assessments"], status_code=201)
def create_assessment(
    payload: AssessmentCreate,
    current_user: User = Depends(require_roles(UserRole.teacher, UserRole.admin)),
    db: Session = Depends(get_db),
):
    return AssessmentService(db).create_assessment(payload, current_user.id)


@router.get("/assessments", response_model=list[AssessmentRead], tags=["Assessments"])
def list_assessments(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AssessmentService(db).list_assessments()


@router.post("/assessment-attempts", response_model=AssessmentAttemptRead, tags=["Assessments"], status_code=201)
def start_assessment_attempt(
    payload: AssessmentAttemptCreate,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AssessmentService(db).start_attempt(payload)


@router.post("/learning-sessions", response_model=LearningSessionRead, tags=["Learning Sessions"], status_code=201)
def start_learning_session(
    payload: LearningSessionCreate,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return LearningService(db).start_session(payload)


@router.post(
    "/learning-sessions/{session_id}/responses",
    response_model=StudentResponseRead,
    tags=["Learning Sessions"],
)
def submit_learning_response(
    session_id: UUID,
    payload: ResponseCreate,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return LearningService(db).submit_response(session_id, payload)


@router.get("/students/{student_id}/subtopics/{subtopic_id}/bkt", response_model=BKTStateRead, tags=["Adaptive Engine"])
def get_bkt_state(
    student_id: UUID,
    subtopic_id: UUID,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return LearningService(db).get_bkt_state(student_id, subtopic_id)


@router.get("/students/{student_id}/topics/{topic_id}/theta", response_model=ThetaRead, tags=["Adaptive Engine"])
def get_theta(
    student_id: UUID,
    topic_id: UUID,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return LearningService(db).get_theta(student_id, topic_id)


@router.post("/adaptive/next-question/{session_id}", response_model=AdaptiveNextQuestionRead, tags=["Adaptive Engine"])
def next_question(
    session_id: UUID,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AdaptiveService(db).next_question(session_id)


@router.get("/analytics/platform", response_model=AnalyticsSummary, tags=["Analytics"])
def platform_analytics(
    _: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).platform()


@router.get("/analytics/students/{student_id}", response_model=StudentAnalytics, tags=["Analytics"])
def student_analytics(
    student_id: UUID,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).student(student_id)
