from app.algorithms.bkt.bkt_engine import BKTEngine


def test_bkt_correct_increases_mastery() -> None:
    assert BKTEngine().update(0.2, True) > 0.2
