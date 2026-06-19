from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response
from app.schemas.avatar_schema import AvatarCreate, AvatarRead, AvatarUpdate
from app.services.avatar_service import AvatarService

router = APIRouter(prefix="/avatars", tags=["avatars"])


@router.get("")
def list_avatars(db: Session = Depends(get_db)):
    avatars = AvatarService(db).list_avatars()
    return success_response(
        "Avatars fetched successfully",
        [AvatarRead.model_validate(item).model_dump() for item in avatars],
    )


@router.post("")
def create_avatar(
    payload: AvatarCreate,
    _: object = Depends(require_roles(["admin", "content_manager"])),
    db: Session = Depends(get_db),
):
    avatar = AvatarService(db).create_avatar(payload)
    return success_response("Avatar created successfully", AvatarRead.model_validate(avatar).model_dump())


@router.patch("/{avatar_id}")
def update_avatar(
    avatar_id: UUID,
    payload: AvatarUpdate,
    _: object = Depends(require_roles(["admin", "content_manager"])),
    db: Session = Depends(get_db),
):
    avatar = AvatarService(db).update_avatar(avatar_id, payload)
    return success_response("Avatar updated successfully", AvatarRead.model_validate(avatar).model_dump())
