from datetime import datetime

from app.models.irt_trait import StudentIRTTrait
from app.services.eap_service import EAPService


class IRTService:
    @staticmethod
    def initialize_trait(student_id, topic_id) -> StudentIRTTrait:
        return StudentIRTTrait(
            student_id=student_id,
            topic_id=topic_id,
            theta=0.0,
            theta_variance=1.0,
            standard_error=1.0,
            estimation_method="EAP",
            valid_response_count=0,
        )

    @staticmethod
    def update_trait(trait: StudentIRTTrait, response_history: list[dict]) -> StudentIRTTrait:
        theta, variance, se = EAPService.estimate_theta(response_history)
        trait.theta = theta
        trait.theta_variance = variance
        trait.standard_error = se
        trait.valid_response_count = len(response_history)
        trait.last_updated_at = datetime.utcnow()
        return trait
