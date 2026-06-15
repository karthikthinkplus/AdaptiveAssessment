from fastapi import APIRouter

from app.api.v1 import (
    adaptive_routes,
    admin_routes,
    analytics_routes,
    assessment_routes,
    auth_routes,
    learning_routes,
    question_routes,
    student_routes,
    teacher_routes,
    topic_routes,
    user_routes,
)

api_router = APIRouter()
api_router.include_router(auth_routes.router)
api_router.include_router(user_routes.router)
api_router.include_router(student_routes.router)
api_router.include_router(teacher_routes.router)
api_router.include_router(admin_routes.router)
api_router.include_router(topic_routes.router)
api_router.include_router(question_routes.router)
api_router.include_router(assessment_routes.router)
api_router.include_router(learning_routes.router)
api_router.include_router(adaptive_routes.router)
api_router.include_router(analytics_routes.router)
