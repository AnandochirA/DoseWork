"""
SessionStatus Value Object - Immutable and validated
"""

from enum import Enum


class SessionStatus(Enum):
    """Valid session statuses."""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    
    @classmethod
    def from_string(cls, value: str) -> "SessionStatus":
        """Create SessionStatus from string value."""
        for status in cls:
            if status.value == value:
                return status
        raise ValueError(f"Invalid session status: {value}")
    
    def __str__(self) -> str:
        return self.value