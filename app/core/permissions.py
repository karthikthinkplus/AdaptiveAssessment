from collections.abc import Callable

from fastapi import Depends, status

from app.dependencies import get_current_user_context
from app.exceptions import AppException
from app.schemas.auth_schema import CurrentUserContext


def require_authenticated_user(
    current_user: CurrentUserContext = Depends(get_current_user_context),
) -> CurrentUserContext:
    return current_user


def require_roles(allowed_roles: list[str]) -> Callable:
    def _dependency(
        current_user: CurrentUserContext = Depends(get_current_user_context),
    ) -> CurrentUserContext:
        if any(role in allowed_roles for role in current_user.roles):
            return current_user
        raise AppException(
            message="You do not have permission to access this resource",
            error_code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN,
            details={"required_roles": allowed_roles},
        )

    return _dependency
