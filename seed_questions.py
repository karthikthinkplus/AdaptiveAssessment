import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from app.database.session import SessionLocal
from app.models.topic import Topic
from app.models.subtopic import Subtopic
from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.user import User
from app.models.student import Student
from app.models.role import Role, UserRole
from app.core.password import hash_password

def seed():
    db = SessionLocal()
    try:
        # Check if topic already exists
        topic = db.query(Topic).filter(Topic.name == "Grade 8 Mathematics").first()
        if not topic:
            topic = Topic(
                id=uuid.uuid4(),
                name="Grade 8 Mathematics",
                difficulty_level="medium",
                display_order=1,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(topic)
            db.commit()
            db.refresh(topic)
            print(f"Created Topic: {topic.name}")

        # Check if subtopic already exists
        subtopic = db.query(Subtopic).filter(Subtopic.name == "Polynomial Evaluation" and Subtopic.topic_id == topic.id).first()
        if not subtopic:
            subtopic = Subtopic(
                id=uuid.uuid4(),
                topic_id=topic.id,
                name="Polynomial Evaluation",
                description="Evaluating polynomial expressions for given values.",
                difficulty_level="medium",
                display_order=1,
                mastery_threshold=0.85,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(subtopic)
            db.commit()
            db.refresh(subtopic)
            print(f"Created Subtopic: {subtopic.name}")

        # Create a test student user
        student_role = db.query(Role).filter(Role.name == "student").first()
        if not student_role:
            student_role = Role(id=uuid.uuid4(), name="student")
            db.add(student_role)
            db.commit()

        student_user = db.query(User).filter(User.email == "student@thinkplus.com").first()
        if not student_user:
            student_user = User(
                id=uuid.uuid4(),
                email="student@thinkplus.com",
                password_hash=hash_password("Password123!"),
                full_name="Arjun Kumar",
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(student_user)
            db.commit()
            db.refresh(student_user)
            
            # Assign student role
            ur = UserRole(user_id=student_user.id, role_id=student_role.id)
            db.add(ur)
            db.commit()

            # Create Student record
            student = Student(
                id=uuid.uuid4(),
                user_id=student_user.id,
                student_code="STU001",
                grade="Grade 8",
                current_status="active",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(student)
            db.commit()
            print("Created Student User: student@thinkplus.com / Password123!")

        # Check if questions exist
        q_count = db.query(Question).filter(Question.subtopic_id == subtopic.id).count()
        if q_count == 0:
            sample_questions = [
                {
                    "text": "Evaluate the polynomial P(x) = x^2 - 4x + 7 when x = 3.",
                    "code": "MATH8-POLY-01",
                    "diff": "easy",
                    "options": [
                        {"label": "A", "text": "2", "is_correct": False},
                        {"label": "B", "text": "4", "is_correct": True},
                        {"label": "C", "text": "6", "is_correct": False},
                        {"label": "D", "text": "8", "is_correct": False}
                    ]
                },
                {
                    "text": "What is the degree of the polynomial Q(x) = 5x^4 - 2x^3 + 7x - 1?",
                    "code": "MATH8-POLY-02",
                    "diff": "easy",
                    "options": [
                        {"label": "A", "text": "3", "is_correct": False},
                        {"label": "B", "text": "4", "is_correct": True},
                        {"label": "C", "text": "5", "is_correct": False},
                        {"label": "D", "text": "7", "is_correct": False}
                    ]
                },
                {
                    "text": "Simplify: (3x^2 + 5x - 2) + (x^2 - 2x + 6).",
                    "code": "MATH8-POLY-03",
                    "diff": "medium",
                    "options": [
                        {"label": "A", "text": "4x^2 + 3x + 4", "is_correct": True},
                        {"label": "B", "text": "4x^2 + 7x + 4", "is_correct": False},
                        {"label": "C", "text": "3x^2 + 3x + 8", "is_correct": False},
                        {"label": "D", "text": "4x^2 - 3x - 4", "is_correct": False}
                    ]
                },
                {
                    "text": "If P(x) = 2x^3 - x^2 + 5, what is P(-1)?",
                    "code": "MATH8-POLY-04",
                    "diff": "medium",
                    "options": [
                        {"label": "A", "text": "2", "is_correct": True},
                        {"label": "B", "text": "4", "is_correct": False},
                        {"label": "C", "text": "6", "is_correct": False},
                        {"label": "D", "text": "8", "is_correct": False}
                    ]
                },
                {
                    "text": "Factor the polynomial: x^2 - 9.",
                    "code": "MATH8-POLY-05",
                    "diff": "easy",
                    "options": [
                        {"label": "A", "text": "(x - 3)(x - 3)", "is_correct": False},
                        {"label": "B", "text": "(x + 3)(x - 3)", "is_correct": True},
                        {"label": "C", "text": "(x + 9)(x - 1)", "is_correct": False},
                        {"label": "D", "text": "(x + 3)(x + 3)", "is_correct": False}
                    ]
                }
            ]

            for q_data in sample_questions:
                q = Question(
                    id=uuid.uuid4(),
                    topic_id=topic.id,
                    subtopic_id=subtopic.id,
                    question_code=q_data["code"],
                    question_text=q_data["text"],
                    question_type="mcq",
                    difficulty_level=q_data["diff"],
                    difficulty_b=0.0,
                    discrimination_a=1.0,
                    guessing_c=0.0,
                    status="approved",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(q)
                db.commit()
                db.refresh(q)

                for opt_idx, opt_data in enumerate(q_data["options"]):
                    opt = QuestionOption(
                        id=uuid.uuid4(),
                        question_id=q.id,
                        option_label=opt_data["label"],
                        option_text=opt_data["text"],
                        is_correct=opt_data["is_correct"],
                        display_order=opt_idx,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(opt)
                db.commit()
                print(f"Created Question: {q.question_code}")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
