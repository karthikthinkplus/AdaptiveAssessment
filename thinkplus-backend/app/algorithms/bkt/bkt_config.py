from dataclasses import dataclass


@dataclass(frozen=True)
class BKTConfig:
    prior: float = 0.2
    learn: float = 0.12
    guess: float = 0.2
    slip: float = 0.1
