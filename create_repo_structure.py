import os

PROJECT_NAME = "thinkplus-backend"

structure = {
    "app": [
        "main.py",
        "config.py",
        "dependencies.py",
        "exceptions.py",
        "logging_config.py",
    ],

    "app/database": [
        "session.py",
        "base.py",
        "init_db.py",
    ],

    "app/core": [
        "security.py",
        "jwt.py",
        "password.py",
        "permissions.py",
        "constants.py",
    ],

    "app/models": [
        "user.py",
        "role.py",
        "avatar.py",
        "student.py",
        "teacher.py",
        "topic.py",
        "subtopic.py",
        "knowledge_graph.py",
        "question_passage.py",
        "question.py",
        "question_option.py",
        "learning_session.py",
        "student_response.py",
        "bkt_state.py",
        "irt_trait.py",
        "adaptive_decision_log.py",
    ],

    "app/schemas": [
        "auth_schema.py",
        "user_schema.py",
        "avatar_schema.py",
        "student_schema.py",
        "teacher_schema.py",
        "topic_schema.py",
        "subtopic_schema.py",
        "question_schema.py",
        "learning_schema.py",
        "response_schema.py",
        "bkt_schema.py",
        "irt_schema.py",
        "adaptive_schema.py",
        "analytics_schema.py",
    ],

    "app/repositories": [
        "user_repository.py",
        "role_repository.py",
        "avatar_repository.py",
        "student_repository.py",
        "teacher_repository.py",
        "topic_repository.py",
        "question_repository.py",
        "learning_session_repository.py",
        "response_repository.py",
        "bkt_repository.py",
        "irt_repository.py",
        "adaptive_decision_repository.py",
        "analytics_repository.py",
    ],

    "app/services": [
        "auth_service.py",
        "user_service.py",
        "avatar_service.py",
        "student_service.py",
        "teacher_service.py",
        "topic_service.py",
        "question_service.py",
        "question_upload_service.py",
        "learning_session_service.py",
        "telemetry_service.py",
        "adaptive_engine_service.py",
        "bkt_service.py",
        "irt_service.py",
        "eap_service.py",
        "fisher_service.py",
        "navigation_service.py",
        "pool_builder_service.py",
        "analytics_service.py",
    ],

    "app/api/v1": [
        "router.py",
        "auth_routes.py",
        "user_routes.py",
        "avatar_routes.py",
        "student_routes.py",
        "teacher_routes.py",
        "admin_routes.py",
        "topic_routes.py",
        "question_routes.py",
        "upload_routes.py",
        "learning_routes.py",
        "adaptive_routes.py",
        "analytics_routes.py",
    ],

    "app/algorithms/bkt": [],
    "app/algorithms/irt": [],
    "app/algorithms/fisher": [],
    "app/algorithms/navigation": [],
    "app/algorithms/telemetry": [],

    "app/utils": [],
    "app/tests": [],
}

root_files = [
    ".env",
    ".env.example",
    "alembic.ini",
    "requirements.txt",
    "Dockerfile",
    "docker-compose.yml",
    "README.md",
]

extra_dirs = [
    "alembic",
]

def create_file(filepath):
    if not os.path.exists(filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("")

def main():
    os.makedirs(PROJECT_NAME, exist_ok=True)

    for folder in extra_dirs:
        os.makedirs(os.path.join(PROJECT_NAME, folder), exist_ok=True)

    for folder, files in structure.items():
        folder_path = os.path.join(PROJECT_NAME, folder)
        os.makedirs(folder_path, exist_ok=True)

        init_file = os.path.join(folder_path, "__init__.py")
        create_file(init_file)

        for file in files:
            create_file(os.path.join(folder_path, file))

    for file in root_files:
        create_file(os.path.join(PROJECT_NAME, file))

    print(f"✅ Project '{PROJECT_NAME}' created successfully!")

if __name__ == "__main__":
    main()