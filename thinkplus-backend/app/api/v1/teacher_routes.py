from fastapi import APIRouter

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.get("")
def list_teachers() -> list:
    return []
