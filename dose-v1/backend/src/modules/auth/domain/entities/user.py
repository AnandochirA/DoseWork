"""
User Entity - Domain Layer
Pure business logic, no database dependencies
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

@dataclass 
class User:
    """
    User domain entity representing an ADHD app user.
    Contains only business logic, no persistence concerns.
    """
    # User's unique ID
    id: UUID
    # Email Address
    email: str
    # Password Hash 
    hashed_password: str
    # Name can be None
    full_name: Optional[str]
    # Account Active?
    is_active: bool
    # Email Verified
    is_verified: bool
    # When Created
    created_at: datetime
    # Last Update
    updated_at: datetime

    def deactivate(self) -> None:
        self.is_active = False

    def activate(self) -> None:
        self.is_active = True

    def verify_email(self) -> None:
        self.is_verified = True
    
    def update_profile(self, full_name: Optional[str] = None):
        if full_name:
            self.full_name = full_name
            self.updated_at = datetime.utcnow()
    
