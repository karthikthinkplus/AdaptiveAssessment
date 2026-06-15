from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.analytics_schema import PlatformAnalytics
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/platform", response_model=PlatformAnalytics)
def platform(db: Session = Depends(get_db)):
    return AnalyticsService(db).platform()
