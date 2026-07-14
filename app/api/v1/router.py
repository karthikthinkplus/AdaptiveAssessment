from fastapi import APIRouter

from app.api.v1.adaptive_routes import router as adaptive_router
from app.api.v1.analytics_routes import router as analytics_router
from app.api.v1.auth_routes import router as auth_router
from app.api.v1.avatar_routes import router as avatar_router
from app.api.v1.doubt_routes import router as doubt_router
from app.api.v1.learning_routes import router as learning_router
from app.api.v1.question_routes import router as question_router
from app.api.v1.student_routes import router as student_router
from app.api.v1.topic_routes import router as topic_router
from app.api.v1.upload_routes import router as upload_router
from app.api.v1.user_routes import router as user_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(student_router)
api_router.include_router(avatar_router)
api_router.include_router(topic_router)
api_router.include_router(question_router)
api_router.include_router(upload_router)
api_router.include_router(learning_router)
api_router.include_router(adaptive_router)
api_router.include_router(analytics_router)
api_router.include_router(doubt_router)

