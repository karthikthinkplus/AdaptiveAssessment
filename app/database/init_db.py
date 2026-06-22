from app.config import settings
from app.core.constants import (
    ALL_ROLES,
    ROLE_ADMIN,
    ROLE_CONTENT_MANAGER,
)
from app.core.password import hash_password
from app.database.session import SessionLocal
from app.models.avatar import Avatar
from app.models.role import Role, UserRole
from app.models.user import User
from app.repositories.avatar_repository import AvatarRepository
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository


DEFAULT_AVATARS = [
    {
        "name": "Scholar Blue",
        "avatar_type": "2d",
        "image_url": "https://api.dicebear.com/9.x/adventurer/svg?seed=ScholarBlue",
        "display_order": 1,
        "is_active": True,
    },
    {
        "name": "Scholar Green",
        "avatar_type": "2d",
        "image_url": "https://api.dicebear.com/9.x/adventurer/svg?seed=ScholarGreen",
        "display_order": 2,
        "is_active": True,
    },
    {
        "name": "ThinkPlus Nova",
        "avatar_type": "2d",
        "image_url": "https://api.dicebear.com/9.x/bottts/svg?seed=ThinkPlusNova",
        "display_order": 3,
        "is_active": True,
    },
    {
        "name": "ThinkPlus Orbit",
        "avatar_type": "2d",
        "image_url": "https://api.dicebear.com/9.x/fun-emoji/svg?seed=ThinkPlusOrbit",
        "display_order": 4,
        "is_active": True,
    },
]


def seed_database() -> None:
    db = SessionLocal()
    try:
        role_repo = RoleRepository(db)
        user_repo = UserRepository(db)
        avatar_repo = AvatarRepository(db)

        role_map = {}
        for role_name in ALL_ROLES:
            role = role_repo.get_by_name(role_name)
            if not role:
                role = role_repo.create(Role(name=role_name))
            role_map[role_name] = role

        def ensure_user(email: str, password: str, full_name: str, role_name: str) -> None:
            user = user_repo.get_by_email(email)
            if not user:
                user = User(
                    email=email,
                    password_hash=hash_password(password),
                    full_name=full_name,
                )
                user_repo.create(user)
            role_ids = {role.id for role in user.roles}
            if role_map[role_name].id not in role_ids:
                user_repo.assign_role(UserRole(user_id=user.id, role_id=role_map[role_name].id))

        ensure_user(settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD, settings.ADMIN_FULL_NAME, ROLE_ADMIN)
        ensure_user(
            settings.CONTENT_MANAGER_EMAIL,
            settings.CONTENT_MANAGER_PASSWORD,
            settings.CONTENT_MANAGER_FULL_NAME,
            ROLE_CONTENT_MANAGER,
        )

        existing_avatars = {avatar.name: avatar for avatar in avatar_repo.list_avatars()}
        for avatar_data in DEFAULT_AVATARS:
            existing_avatar = existing_avatars.get(avatar_data["name"])
            if existing_avatar:
                existing_avatar.avatar_type = avatar_data["avatar_type"]
                existing_avatar.image_url = avatar_data["image_url"]
                existing_avatar.display_order = avatar_data["display_order"]
                existing_avatar.is_active = avatar_data["is_active"]
            else:
                avatar_repo.create(Avatar(**avatar_data))

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
