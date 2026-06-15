from sqlalchemy.orm import Session

from app import models as m


def test_auth_catalog_learning_and_adaptive_flow(client, db_session: Session) -> None:
    admin_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@example.com",
            "password": "strong-password",
            "full_name": "Admin",
            "role": "admin",
        },
    )
    assert admin_response.status_code == 201
    token = admin_response.json()["token"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    topic_response = client.post(
        "/api/v1/topics",
        json={"name": "Fractions", "description": "Fraction foundations"},
        headers=headers,
    )
    assert topic_response.status_code == 201
    topic_id = topic_response.json()["id"]

    subtopic_response = client.post(
        "/api/v1/subtopics",
        json={"topic_id": topic_id, "name": "Equivalent fractions", "sequence_order": 1},
        headers=headers,
    )
    assert subtopic_response.status_code == 201
    subtopic_id = subtopic_response.json()["id"]

    question_response = client.post(
        "/api/v1/questions",
        json={
            "subtopic_id": subtopic_id,
            "question_type": "multiple_choice",
            "prompt": "Which is equivalent to 6/8?",
            "difficulty_b": 0.0,
            "options": [
                {"option_key": "A", "option_text": "3/4", "is_correct": True},
                {"option_key": "B", "option_text": "1/2", "is_correct": False},
            ],
        },
        headers=headers,
    )
    assert question_response.status_code == 201
    question = question_response.json()
    correct_option_id = next(option["id"] for option in question["options"] if option["is_correct"])

    student_user = m.User(
        email="student@example.com",
        password_hash="hash",
        full_name="Student",
        role=m.UserRole.student,
    )
    db_session.add(student_user)
    db_session.flush()
    student = m.Student(user_id=student_user.id, grade_level="7")
    db_session.add(student)
    db_session.commit()

    session_response = client.post(
        "/api/v1/learning-sessions",
        json={"student_id": str(student.id), "topic_id": topic_id},
        headers=headers,
    )
    assert session_response.status_code == 201
    session_id = session_response.json()["id"]

    next_response = client.post(f"/api/v1/adaptive/next-question/{session_id}", headers=headers)
    assert next_response.status_code == 200
    assert next_response.json()["question"]["id"] == question["id"]

    response = client.post(
        f"/api/v1/learning-sessions/{session_id}/responses",
        json={"question_id": question["id"], "selected_option_id": correct_option_id},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["is_correct"] is True

    bkt_response = client.get(f"/api/v1/students/{student.id}/subtopics/{subtopic_id}/bkt", headers=headers)
    assert bkt_response.status_code == 200
    assert bkt_response.json()["mastery_probability"] > 0.2

    analytics_response = client.get("/api/v1/analytics/platform", headers=headers)
    assert analytics_response.status_code == 200
    assert analytics_response.json()["questions"] == 1
