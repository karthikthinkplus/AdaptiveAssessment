"""Initial schema.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-06-15
"""

from collections.abc import Sequence

from alembic import op
from app.database.base import Base
from app.models import *  # noqa: F403

revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
