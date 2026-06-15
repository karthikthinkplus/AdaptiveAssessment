from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.assessment_schema import AssessmentAttemptCreate, AssessmentAttemptRead, AssessmentCreate, AssessmentRead
from app.services.assessment_service import AssessmentService

router = APIRouter(tags=["Assessments"])


@router.post("/assessments", response_model=AssessmentRead, status_code=201)
def create_assessment(
    payload: AssessmentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AssessmentService(db).create_assessment(payload, user.id)


@router.post("/assessment-attempts", response_model=AssessmentAttemptRead, status_code=201)
def start_attempt(payload: AssessmentAttemptCreate, db: Session = Depends(get_db)):
    return AssessmentService(db).start_attempt(payload)
