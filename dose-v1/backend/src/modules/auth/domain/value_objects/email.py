"""
Email Value Object - Immutable and validated
"""

from dataclasses import dataclass
import re


@dataclass(frozen=True)
class Email:
    """Email value object with built-in validation."""
    value: str

    def __post_init__(self):
        """Validate email format."""
        if not self._is_valid_email(self.value):
            raise ValueError(f"Invalid email format: {self.value}")

    @staticmethod 
    def _is_valid_email(email: str) -> bool:
        """Check if email matches valid pattern"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def __str__(self) -> str:
        return self.value