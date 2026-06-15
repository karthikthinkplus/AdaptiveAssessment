from uuid import uuid4

from app.algorithms.navigation.navigation_engine import NavigationEngine


def test_navigation_decides_stay() -> None:
    action, _, _ = NavigationEngine().decide(uuid4(), 0.6)
    assert action == "stay"
