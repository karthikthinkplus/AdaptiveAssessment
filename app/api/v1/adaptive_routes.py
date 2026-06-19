from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response
from app.schemas.adaptive_schema import AdaptiveDecisionLogRead
from app.schemas.bkt_schema import BKTStateRead
from app.schemas.irt_schema import IRTTraitRead
from app.services.adaptive_engine_service import AdaptiveEngineService

router = APIRouter(prefix="/adaptive", tags=["adaptive"])


@router.get("/students/{student_id}/bkt")
def get_student_bkt(
    student_id: UUID,
    _: object = Depends(require_roles(["admin", "content_manager", "teacher", "student"])),
    db: Session = Depends(get_db),
):
    items = AdaptiveEngineService(db).get_student_bkt(student_id)
    return success_response("BKT states fetched successfully", [BKTStateRead.model_validate(item).model_dump() for item in items])


@router.get("/students/{student_id}/irt")
def get_student_irt(
    student_id: UUID,
    _: object = Depends(require_roles(["admin", "content_manager", "teacher", "student"])),
    db: Session = Depends(get_db),
):
    items = AdaptiveEngineService(db).get_student_irt(student_id)
    return success_response("IRT traits fetched successfully", [IRTTraitRead.model_validate(item).model_dump() for item in items])


@router.get("/sessions/{session_id}/decisions")
def get_session_decisions(
    session_id: UUID,
    _: object = Depends(require_roles(["admin", "content_manager", "teacher", "student"])),
    db: Session = Depends(get_db),
):
    items = AdaptiveEngineService(db).get_session_decisions(session_id)
    return success_response(
        "Adaptive decisions fetched successfully",
        [AdaptiveDecisionLogRead.model_validate(item).model_dump() for item in items],
    )
