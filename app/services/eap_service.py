import math


class EAPService:
    @staticmethod
    def logistic(theta: float, difficulty_b: float, discrimination_a: float = 1.0) -> float:
        return 1.0 / (1.0 + math.exp(-discrimination_a * (theta - difficulty_b)))

    @classmethod
    def estimate_theta(
        cls,
        responses: list[dict[str, float | bool]],
        prior_mean: float = 0.0,
        prior_variance: float = 1.0,
    ) -> tuple[float, float, float]:
        if not responses:
            return prior_mean, prior_variance, math.sqrt(prior_variance)

        grid = [x / 2 for x in range(-8, 9)]
        posterior_weights: list[tuple[float, float]] = []

        for theta in grid:
            likelihood = 1.0
            for response in responses:
                p = cls.logistic(
                    theta=theta,
                    difficulty_b=float(response["difficulty_b"]),
                    discrimination_a=float(response.get("discrimination_a", 1.0)),
                )
                likelihood *= p if bool(response["is_correct"]) else (1 - p)

            prior = math.exp(-((theta - prior_mean) ** 2) / (2 * prior_variance))
            posterior_weights.append((theta, likelihood * prior))

        normalizer = sum(weight for _, weight in posterior_weights) or 1.0
        mean = sum(theta * weight for theta, weight in posterior_weights) / normalizer
        variance = sum((((theta - mean) ** 2) * weight) for theta, weight in posterior_weights) / normalizer
        return mean, variance, math.sqrt(max(variance, 1e-6))
