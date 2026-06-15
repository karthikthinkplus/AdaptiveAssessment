from uuid import UUID

from sqlalchemy.orm import Session

from app.models.question import Question, QuestionOption
from app.repositories.question_repository import QuestionRepository
from app.schemas.question_schema import QuestionCreate, QuestionRead


class QuestionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.questions = QuestionRepository(db)

    def create_question(self, payload: QuestionCreate, user_id: UUID | None) -> QuestionRead:
        question = self.questions.add(
            Question(
                subtopic_id=payload.subtopic_id,
                created_by_user_id=user_id,
                question_type=payload.question_type,
                prompt=payload.prompt,
                correct_answer=payload.correct_answer,
                difficulty_b=payload.difficulty_b,
            )
        )
        for option in payload.options:
            self.db.add(QuestionOption(question_id=question.id, **option.model_dump()))
        self.db.commit()
        self.db.refresh(question)
        return QuestionRead.model_validate(question)
