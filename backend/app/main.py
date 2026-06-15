from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routes import router as api_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.project_name, version="0.2.0", openapi_url="/openapi.json")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.cors_origins],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["System"])
    def health() -> dict[str, str]:
        return {"status": "ok", "environment": settings.environment}

    prefix = settings.api_v1_prefix
    app.include_router(api_router, prefix=prefix)
    return app


app = create_app()
