from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.database.base import Base, EntityMixin, jsonb_type


class AuditLog(EntityMixin, Base):
    __tablename__ = "audit_logs"

    actor_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    entity_type: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    entity_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), index=True)
    before: Mapped[dict | None] = mapped_column(jsonb_type)
    after: Mapped[dict | None] = mapped_column(jsonb_type)
    request_metadata: Mapped[dict] = mapped_column(jsonb_type, default=dict, nullable=False)
