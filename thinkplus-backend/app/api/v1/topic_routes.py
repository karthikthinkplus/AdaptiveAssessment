from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.topic_schema import SubtopicCreate, SubtopicRead, TopicCreate, TopicRead
from app.services.topic_service import TopicService

router = APIRouter(tags=["Topics"])


@router.post("/topics", response_model=TopicRead, status_code=201)
def create_topic(payload: TopicCreate, db: Session = Depends(get_db)):
    return TopicService(db).create_topic(payload)


@router.get("/topics", response_model=list[TopicRead])
def list_topics(db: Session = Depends(get_db)):
    return TopicService(db).list_topics()


@router.post("/subtopics", response_model=SubtopicRead, status_code=201)
def create_subtopic(payload: SubtopicCreate, db: Session = Depends(get_db)):
    return TopicService(db).create_subtopic(payload)
