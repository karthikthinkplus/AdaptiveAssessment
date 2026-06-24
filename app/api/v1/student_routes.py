from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response, AppException
from app.repositories.student_repository import StudentRepository

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/me")
def get_current_student(
    current_user=Depends(require_roles(["student"])),
    db: Session = Depends(get_db),
):
    student = StudentRepository(db).get_by_user_id(current_user.id)
    if not student:
        raise AppException("Student profile not found", "STUDENT_NOT_FOUND", 404)
    return success_response(
        "Student profile fetched successfully",
        {
            "id": str(student.id),
            "user_id": str(student.user_id),
            "student_code": student.student_code,
            "grade": student.grade,
            "batch_name": student.batch_name,
            "current_status": student.current_status,
        }
    )

