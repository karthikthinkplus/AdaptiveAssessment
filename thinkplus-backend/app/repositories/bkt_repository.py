from app.models.bkt_state import BKTHistory, StudentBKTState
from app.repositories.base import Repository


class BKTStateRepository(Repository[StudentBKTState]):
    model = StudentBKTState


class BKTHistoryRepository(Repository[BKTHistory]):
    model = BKTHistory
