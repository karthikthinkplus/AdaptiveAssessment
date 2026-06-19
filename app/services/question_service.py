from uuid import UUID

from sqlalchemy.orm import Session

from app.exceptions import AppException
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.repositories.question_repository import QuestionRepository
from app.repositories.topic_repository import TopicRepository
from app.schemas.question_schema import QuestionCreate, QuestionUpdate


class QuestionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = QuestionRepository(db)
        self.topic_repo = TopicRepository(db)

    def list_questions(self) -> list[Question]:
        return self.repo.list_questions()

    def get_question(self, question_id: UUID) -> Question:
        question = self.repo.get_question(question_id)
        if not question:
            raise AppException("Question not found", "QUESTION_NOT_FOUND", 404)
        return question

    def create_question(self, payload: QuestionCreate, created_by: UUID | None) -> Question:
        if not self.topic_repo.get_topic(payload.topic_id):
            raise AppException("Topic not found", "TOPIC_NOT_FOUND", 404)
        if not self.topic_repo.get_subtopic(payload.subtopic_id):
            raise AppException("Subtopic not found", "SUBTOPIC_NOT_FOUND", 404)
        question = Question(**payload.model_dump(exclude={"options"}), created_by=created_by)
        self.repo.create_question(question)
        for option_payload in payload.options:
            self.repo.create_option(QuestionOption(question_id=question.id, **option_payload.model_dump()))
        self.db.commit()
        return self.get_question(question.id)

    def update_question(self, question_id: UUID, payload: QuestionUpdate) -> Question:
        question = self.get_question(question_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(question, key, value)
        self.db.commit()
        return self.get_question(question.id)
