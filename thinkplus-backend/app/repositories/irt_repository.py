from app.models.irt_trait import StudentTopicTheta, ThetaHistory
from app.repositories.base import Repository


class IRTTraitRepository(Repository[StudentTopicTheta]):
    model = StudentTopicTheta


class ThetaHistoryRepository(Repository[ThetaHistory]):
    model = ThetaHistory
