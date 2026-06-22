from uuid import UUID

from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.jwt import decode_access_token
from app.core.security import bearer_scheme
from app.database.session import get_db
from app.exceptions import AppException
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schema import CurrentUserContext


def get_current_user_context(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> CurrentUserContext:
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(payload["sub"])
    except Exception as exc:  # noqa: BLE001
        raise AppException(
            message="Invalid authentication credentials",
            error_code="INVALID_TOKEN",
            status_code=status.HTTP_401_UNAUTHORIZED,
        ) from exc

    user = UserRepository(db).get_by_id(user_id)
    if not user or not user.is_active:
        raise AppException(
            message="Authenticated user not found",
            error_code="USER_NOT_FOUND",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    roles = [role.name for role in user.roles if role.is_active]
    return CurrentUserContext.model_validate(
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "roles": roles,
        }
    )
