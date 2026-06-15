from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/health")
def admin_health() -> dict[str, str]:
    return {"status": "ok"}
