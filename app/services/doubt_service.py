import re
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.exceptions import AppException
from app.models.doubt import Doubt
from app.schemas.doubt_schema import DoubtCreateRequest, DoubtResolveRequest


def normalize_doubt_key(text: str) -> str:
    words = re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()
    stop_words = {"a", "an", "the", "is", "are", "was", "were", "to", "of", "in", "on", "for", "and", "or"}
    useful_words = [word for word in words if word not in stop_words]
    return " ".join(useful_words[:40])[:255] or " ".join(words[:40])[:255]


class DoubtService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_doubt(self, payload: DoubtCreateRequest, student_id: UUID) -> Doubt:
        doubt_key = normalize_doubt_key(payload.question_text)
        existing = self.db.execute(
            select(Doubt)
            .where(Doubt.doubt_key == doubt_key)
            .order_by(Doubt.resolved_at.desc().nullslast(), Doubt.created_at.asc())
        ).scalars().first()

        if existing:
            existing.duplicate_count += 1
            existing.updated_at = datetime.utcnow()
            if existing.status == "resolved":
                self.db.commit()
                self.db.refresh(existing)
                return existing

        doubt = Doubt(
            student_id=student_id,
            doubt_key=doubt_key,
            question_text=payload.question_text,
            image_data=payload.image_data,
            status="unresolved",
        )
        self.db.add(doubt)
        self.db.commit()
        self.db.refresh(doubt)
        return doubt

    def list_student_doubts(self, student_id: UUID) -> list[Doubt]:
        stmt = select(Doubt).where(Doubt.student_id == student_id).order_by(Doubt.created_at.desc())
        return list(self.db.execute(stmt).scalars().all())

    def list_teacher_doubts(self) -> list[Doubt]:
        stmt = select(Doubt).order_by(Doubt.status.asc(), Doubt.updated_at.desc())
        all_doubts = list(self.db.execute(stmt).scalars().all())
        grouped: dict[str, Doubt] = {}
        for doubt in all_doubts:
            current = grouped.get(doubt.doubt_key)
            if not current:
                grouped[doubt.doubt_key] = doubt
                continue
            current.duplicate_count += doubt.duplicate_count
            if current.status != "unresolved" and doubt.status == "unresolved":
                grouped[doubt.doubt_key] = doubt
        return list(grouped.values())

    def resolve_doubt(self, doubt_id: UUID, payload: DoubtResolveRequest, teacher_id: UUID) -> Doubt:
        doubt = self.db.get(Doubt, doubt_id)
        if not doubt:
            raise AppException("Doubt not found", "DOUBT_NOT_FOUND", 404)

        now = datetime.utcnow()
        matching_doubts = list(self.db.execute(select(Doubt).where(Doubt.doubt_key == doubt.doubt_key)).scalars().all())
        total_duplicates = sum(item.duplicate_count for item in matching_doubts)

        for item in matching_doubts:
            item.status = "resolved"
            item.duplicate_count = total_duplicates
            item.explanation_text = payload.explanation_text
            item.explanation_link = payload.explanation_link
            item.explanation_image_data = payload.explanation_image_data
            item.resolved_by = teacher_id
            item.resolved_at = now
            item.updated_at = now

        self.db.commit()
        self.db.refresh(doubt)
        return doubt
