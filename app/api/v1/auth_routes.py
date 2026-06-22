from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_authenticated_user
from app.database.session import get_db
from app.exceptions import success_response
from app.schemas.auth_schema import LoginRequest, StudentSignupRequest, TeacherSignupRequest, UserSummary
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup/student")
def signup_student(payload: StudentSignupRequest, db: Session = Depends(get_db)):
    user = AuthService(db).signup_student(payload)
    return success_response("Student signup completed successfully", UserSummary.model_validate(user).model_dump())


@router.post("/signup/teacher")
def signup_teacher(payload: TeacherSignupRequest, db: Session = Depends(get_db)):
    user = AuthService(db).signup_teacher(payload)
    return success_response("Teacher signup completed successfully", UserSummary.model_validate(user).model_dump())


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    data = AuthService(db).login(payload)
    return success_response("Login successful", data.model_dump())


@router.get("/me")
def me(current_user=Depends(require_authenticated_user), db: Session = Depends(get_db)):
    user = AuthService(db).user_repo.get_by_id(current_user.id)
    return success_response(
        "Current user fetched successfully",
        {"user": UserSummary.model_validate(user).model_dump(), "roles": current_user.roles},
    )
