from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/student/{student_id}")
def get_student_analytics(
    student_id: UUID,
    _: object = Depends(require_roles(["admin", "content_manager", "teacher", "student"])),
    db: Session = Depends(get_db),
):
    data = AnalyticsService(db).get_student_analytics(student_id)
    return success_response("Student analytics fetched successfully", data)


@router.get("/session/{session_id}")
def get_session_analytics(
    session_id: UUID,
    _: object = Depends(require_roles(["admin", "content_manager", "teacher", "student"])),
    db: Session = Depends(get_db),
):
    data = AnalyticsService(db).get_session_analytics(session_id)
    return success_response("Session analytics fetched successfully", data)
