"""
User Repository Interface - Domain Layer
Defines contract, implementation in infrastructure layer
"""

from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID
from src.modules.auth.domain.entities.user import User

class IUserRepository(ABC):
    """Interface for user data access."""
    @abstractmethod
    async def create(self, user: User) -> User:
        """Create a new user."""
        pass

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        pass

    @abstractmethod
    async def update(self, user: User) -> User:
        """Update existing user."""
        pass

    @abstractmethod
    async def delete(self, user_id: UUID) -> bool:
        """Delete user by ID."""
        pass

    @abstractmethod
    async def exists_by_email(self, email: str) -> bool:
        """Check if user exists with given email."""
        pass