from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import settings
from app.database.base import Base
from app.database.session import engine
from app.exceptions import register_exception_handlers, success_response
from app.logging_config import configure_logging
import app.models  # noqa: F401


configure_logging()
Base.metadata.create_all(bind=engine)
app = FastAPI(title="ThinkPlus Adaptive Learning and Assessment Backend")
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return success_response("ThinkPlus backend is running", {"service": "thinkplus-backend"})


@app.get("/health")
def health():
    return success_response("Health check successful", {"status": "ok"})
