"""
Auth Data Transfer Objects
"""

from dataclasses import dataclass
from typing import Optional
from uuid import UUID

@dataclass
class RegisterUserDTO:
    """DTO for user registration."""
    email: str
    password: str
    full_name: Optional[str] = None

@dataclass
class LoginDTO:
    """DTO for user login."""
    email: str
    password: str

@dataclass
class TokenDTO:
    """DTO for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

@dataclass
class UserDTO:
    """DTO for user response."""
    id: UUID
    email: str
    full_name: Optional[str]
    is_active: bool
    is_verified: bool