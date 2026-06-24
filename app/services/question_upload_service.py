from __future__ import annotations

import re
from io import BytesIO

import pandas as pd
from sqlalchemy.orm import Session

from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.question_passage import QuestionPassage
from app.models.subtopic import Subtopic
from app.models.topic import Topic
from app.repositories.question_repository import QuestionRepository
from app.repositories.topic_repository import TopicRepository
from app.schemas.question_schema import UploadSummary


class QuestionUploadService:
    COLUMN_ALIASES = {
        "q_no": "question_code",
        "question_code": "question_code",
        "topic": "topic",
        "complement_question": "topic",
        "topic_name": "topic",
        "sub_topic": "subtopic",
        "subtopic": "subtopic",
        "subtopic_name": "subtopic",
        "paragraph_group_id": "passage_code",
        "passage_code": "passage_code",
        "group_id": "passage_code",
        "paragraph": "passage_text",
        "passage": "passage_text",
        "passage_text": "passage_text",
        "question": "question_text",
        "question_text": "question_text",
        "question_type": "question_type",
        "option_a": "option_a",
        "option_b": "option_b",
        "option_c": "option_c",
        "option_d": "option_d",
        "option_e": "option_e",
        "key": "correct_option",
        "correct_option": "correct_option",
        "correct_answer": "correct_answer",
        "level_of_difficulty": "difficulty_level",
        "difficulty_level": "difficulty_level",
        "difficulty_b": "difficulty_b",
        "time_taken_to_read_the_question": "estimated_time_seconds",
        "estimated_time_seconds": "estimated_time_seconds",
        "status": "status",
        "class_grade": "grade",
        "grade": "grade",
    }

    def __init__(self, db: Session) -> None:
        self.db = db
        self.topic_repo = TopicRepository(db)
        self.question_repo = QuestionRepository(db)

    @staticmethod
    def _normalize_column(name: str) -> str:
        return re.sub(r"[^a-z0-9]+", "_", name.strip().lower()).strip("_")

    @staticmethod
    def _parse_time_seconds(value) -> int | None:
        if pd.isna(value) or value in ("", None):
            return None
        if isinstance(value, (int, float)):
            return int(value)
        match = re.search(r"(\d+)", str(value))
        return int(match.group(1)) if match else None

    @staticmethod
    def _clean_text(value) -> str | None:
        if pd.isna(value) or value is None:
            return None
        text = str(value).strip()
        return text or None

    def _map_columns(self, dataframe: pd.DataFrame) -> pd.DataFrame:
        mapping = {}
        for column in dataframe.columns:
            normalized = self._normalize_column(column)
            canonical = self.COLUMN_ALIASES.get(normalized, normalized)
            mapping[column] = canonical
        return dataframe.rename(columns=mapping)

    def _get_or_create_topic(self, name: str, created_counter: dict) -> Topic:
        topic = self.topic_repo.get_topic_by_name(name)
        if topic:
            return topic
        topic = Topic(name=name, difficulty_level=None, display_order=0, is_active=True)
        self.topic_repo.create_topic(topic)
        created_counter["topics"] += 1
        return topic

    def _get_or_create_subtopic(self, topic_id, name: str, created_counter: dict) -> Subtopic:
        subtopic = self.topic_repo.get_subtopic_by_name(topic_id, name)
        if subtopic:
            return subtopic
        subtopic = Subtopic(topic_id=topic_id, name=name, is_active=True, mastery_threshold=0.95)
        self.topic_repo.create_subtopic(subtopic)
        created_counter["subtopics"] += 1
        return subtopic

    def _get_or_create_passage(
        self,
        passage_code: str,
        passage_text: str,
        passage_cache: dict[str, QuestionPassage],
        created_counter: dict,
    ) -> QuestionPassage:
        if passage_code in passage_cache:
            return passage_cache[passage_code]
        passage = self.question_repo.get_passage_by_code(passage_code)
        if not passage:
            passage = QuestionPassage(passage_code=passage_code, passage_text=passage_text)
            self.question_repo.create_passage(passage)
            created_counter["passages"] += 1
        passage_cache[passage_code] = passage
        return passage

    def upload_question_bank(self, content: bytes, created_by) -> UploadSummary:
        dataframe = pd.read_excel(BytesIO(content))
        dataframe = self._map_columns(dataframe)
        dataframe = dataframe.where(pd.notnull(dataframe), None)

        counters = {
            "topics": 0,
            "subtopics": 0,
            "passages": 0,
            "questions": 0,
            "options": 0,
        }
        errors: list[dict] = []
        passage_cache: dict[str, QuestionPassage] = {}
        last_passage_text_by_code: dict[str, str] = {}
        successful_rows = 0

        for row_number, row in dataframe.iterrows():
            excel_row_number = row_number + 2
            topic_name = self._clean_text(row.get("topic"))
            subtopic_name = self._clean_text(row.get("subtopic"))
            question_text = self._clean_text(row.get("question_text"))
            question_code = self._clean_text(row.get("question_code"))

            if not topic_name and not subtopic_name and not question_text:
                continue
            if not topic_name or not subtopic_name or not question_text:
                errors.append({"row": excel_row_number, "reason": "Missing required topic/subtopic/question"})
                continue

            try:
                topic = self._get_or_create_topic(topic_name, counters)
                subtopic = self._get_or_create_subtopic(topic.id, subtopic_name, counters)

                passage_code = self._clean_text(row.get("passage_code"))
                passage_text = self._clean_text(row.get("passage_text"))
                passage = None

                if passage_code:
                    if passage_text:
                        last_passage_text_by_code[passage_code] = passage_text
                    passage_text = passage_text or last_passage_text_by_code.get(passage_code)
                    if passage_text:
                        passage = self._get_or_create_passage(passage_code, passage_text, passage_cache, counters)
                elif passage_text:
                    derived_code = f"PASSAGE-{question_code or excel_row_number}"
                    passage = self._get_or_create_passage(derived_code, passage_text, passage_cache, counters)

                question_type = self._clean_text(row.get("question_type")) or "mcq"
                correct_option = (self._clean_text(row.get("correct_option")) or "").upper()
                question = Question(
                    topic_id=topic.id,
                    subtopic_id=subtopic.id,
                    passage_id=passage.id if passage else None,
                    question_code=question_code,
                    question_text=question_text,
                    question_type=question_type,
                    difficulty_level=self._clean_text(row.get("difficulty_level")) or "medium",
                    difficulty_b=float(row.get("difficulty_b") or 0.0),
                    discrimination_a=1.0,
                    guessing_c=0.0,
                    correct_answer=self._clean_text(row.get("correct_answer")),
                    estimated_time_seconds=self._parse_time_seconds(row.get("estimated_time_seconds")),
                    status=self._clean_text(row.get("status")) or "approved",
                    created_by=created_by,
                )
                self.question_repo.create_question(question)
                counters["questions"] += 1

                for display_order, label in enumerate(["A", "B", "C", "D", "E"], start=1):
                    option_text = self._clean_text(row.get(f"option_{label.lower()}"))
                    if not option_text:
                        continue
                    option = QuestionOption(
                        question_id=question.id,
                        option_label=label,
                        option_text=option_text,
                        is_correct=correct_option == label,
                        display_order=display_order,
                    )
                    self.question_repo.create_option(option)
                    counters["options"] += 1

                successful_rows += 1
            except Exception as exc:  # noqa: BLE001
                self.db.rollback()
                errors.append({"row": excel_row_number, "reason": str(exc)})
                continue

        self.db.commit()
        return UploadSummary(
            total_rows=len(dataframe.index),
            successful_rows=successful_rows,
            failed_rows=len(errors),
            created_topics=counters["topics"],
            created_subtopics=counters["subtopics"],
            created_passages=counters["passages"],
            created_questions=counters["questions"],
            created_options=counters["options"],
            errors=errors,
        )

    @staticmethod
    def template_columns() -> list[str]:
        return [
            "question_code",
            "topic",
            "subtopic",
            "passage_code",
            "passage_text",
            "question_text",
            "question_type",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "option_e",
            "correct_option",
            "correct_answer",
            "difficulty_level",
            "difficulty_b",
            "estimated_time_seconds",
            "status",
            "grade",
        ]
