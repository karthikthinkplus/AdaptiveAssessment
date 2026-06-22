from app.models.question import Question


class FisherService:
    @staticmethod
    def fisher_information(theta: float, question: Question) -> float:
        p = 1.0 / (1.0 + pow(2.718281828, -(question.discrimination_a * (theta - question.difficulty_b))))
        q = 1 - p
        return (question.discrimination_a**2) * p * q

    @classmethod
    def choose_best_question(cls, theta: float, questions: list[Question]) -> tuple[Question | None, str]:
        if not questions:
            return None, "No candidate questions found"
        ranked = sorted(questions, key=lambda item: cls.fisher_information(theta, item), reverse=True)
        return ranked[0], "Selected by Fisher information ranking"
