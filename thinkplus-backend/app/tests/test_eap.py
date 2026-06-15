from app.algorithms.irt.eap_estimator import EAPEstimator


def test_eap_returns_estimate() -> None:
    theta, se, posterior = EAPEstimator().estimate([(0.0, True)])
    assert se > 0
    assert posterior
    assert theta > -4
