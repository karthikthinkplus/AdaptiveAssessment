from types import SimpleNamespace
from uuid import uuid4

from app.algorithms.fisher.fisher_selector import FisherSelector


def test_fisher_selects_candidate() -> None:
    selected = FisherSelector().select(0.0, [SimpleNamespace(id=uuid4(), difficulty_b=0.0)])
    assert selected is not None
