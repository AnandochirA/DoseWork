from enum import Enum

class SessionStatus(Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

    @classmethod
    def from_string(cls, value: str) -> "SessionStatus":
        try:
            return cls(value.lower())
        except ValueError:
            raise ValueError(f"Invalid session status: {value!r}") from None

    @property
    def is_in_progress(self) -> bool:
        return self is SessionStatus.IN_PROGRESS

    @property
    def is_completed(self) -> bool:
        return self is SessionStatus.COMPLETED

    def __str__(self) -> str:
        return self.value