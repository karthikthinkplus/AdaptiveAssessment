from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response
from app.schemas.subtopic_schema import SubtopicCreate, SubtopicRead
from app.schemas.topic_schema import TopicCreate, TopicRead, TopicUpdate
from app.services.topic_service import TopicService

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("")
def list_topics(db: Session = Depends(get_db)):
    topics = TopicService(db).list_topics()
    return success_response("Topics fetched successfully", [TopicRead.model_validate(item).model_dump() for item in topics])


@router.post("")
def create_topic(
    payload: TopicCreate,
    current_user=Depends(require_roles(["admin", "content_manager"])),
    db: Session = Depends(get_db),
):
    topic = TopicService(db).create_topic(payload, current_user.id)
    return success_response("Topic created successfully", TopicRead.model_validate(topic).model_dump())


@router.get("/{topic_id}")
def get_topic(topic_id: UUID, db: Session = Depends(get_db)):
    topic = TopicService(db).get_topic(topic_id)
    return success_response("Topic fetched successfully", TopicRead.model_validate(topic).model_dump())


@router.patch("/{topic_id}")
def update_topic(
    topic_id: UUID,
    payload: TopicUpdate,
    _: object = Depends(require_roles(["admin", "content_manager"])),
    db: Session = Depends(get_db),
):
    topic = TopicService(db).update_topic(topic_id, payload)
    return success_response("Topic updated successfully", TopicRead.model_validate(topic).model_dump())


@router.get("/{topic_id}/subtopics")
def list_subtopics(topic_id: UUID, db: Session = Depends(get_db)):
    subtopics = TopicService(db).list_subtopics(topic_id)
    return success_response(
        "Subtopics fetched successfully",
        [SubtopicRead.model_validate(item).model_dump() for item in subtopics],
    )


@router.post("/{topic_id}/subtopics")
def create_subtopic(
    topic_id: UUID,
    payload: SubtopicCreate,
    _: object = Depends(require_roles(["admin", "content_manager"])),
    db: Session = Depends(get_db),
):
    subtopic = TopicService(db).create_subtopic(topic_id, payload)
    return success_response("Subtopic created successfully", SubtopicRead.model_validate(subtopic).model_dump())
