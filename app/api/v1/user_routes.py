from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response
from app.schemas.auth_schema import UserSummary
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
def list_users(
    _: object = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db),
):
    users = UserService(db).list_users()
    return success_response("Users fetched successfully", [UserSummary.model_validate(item).model_dump() for item in users])
