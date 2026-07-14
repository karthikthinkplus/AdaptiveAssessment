from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import ROLE_STUDENT, ROLE_TEACHER
from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response
from app.schemas.auth_schema import CurrentUserContext
from app.schemas.doubt_schema import DoubtCreateRequest, DoubtResolveRequest, DoubtSummary
from app.services.doubt_service import DoubtService

router = APIRouter(prefix="/doubts", tags=["doubts"])


@router.post("")
def create_doubt(
    payload: DoubtCreateRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUserContext = Depends(require_roles([ROLE_STUDENT])),
):
    doubt = DoubtService(db).create_doubt(payload, current_user.id)
    return success_response("Doubt added to bucket", DoubtSummary.model_validate(doubt).model_dump())


@router.get("/mine")
def my_doubts(
    db: Session = Depends(get_db),
    current_user: CurrentUserContext = Depends(require_roles([ROLE_STUDENT])),
):
    doubts = DoubtService(db).list_student_doubts(current_user.id)
    return success_response("Student doubts fetched", [DoubtSummary.model_validate(doubt).model_dump() for doubt in doubts])


@router.get("/teacher")
def teacher_doubts(
    db: Session = Depends(get_db),
    _: CurrentUserContext = Depends(require_roles([ROLE_TEACHER])),
):
    doubts = DoubtService(db).list_teacher_doubts()
    return success_response("Teacher doubts fetched", [DoubtSummary.model_validate(doubt).model_dump() for doubt in doubts])


@router.post("/{doubt_id}/resolve")
def resolve_doubt(
    doubt_id: UUID,
    payload: DoubtResolveRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUserContext = Depends(require_roles([ROLE_TEACHER])),
):
    doubt = DoubtService(db).resolve_doubt(doubt_id, payload, current_user.id)
    return success_response("Doubt resolved", DoubtSummary.model_validate(doubt).model_dump())
