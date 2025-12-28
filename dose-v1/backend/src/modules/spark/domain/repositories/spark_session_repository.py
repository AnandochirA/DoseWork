"""
SparkSession Repository Interface - Domain Layer
Defines contract for SPARK session data access
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Tuple
from uuid import UUID

from src.modules.spark.domain.entities.spark_session import SparkSession
from src.modules.spark.domain.value_objects.session_status import SessionStatus


class ISparkSessionRepository(ABC):
    """Interface for SPARK session persistence and retrieval."""

    @abstractmethod
    async def create(self, session: SparkSession) -> SparkSession:
        """Create a new SPARK session and return it with generated ID."""
        pass

    @abstractmethod
    async def get_by_id(self, session_id: UUID) -> Optional[SparkSession]:
        """Retrieve session by ID. Returns None if not found."""
        pass

    @abstractmethod
    async def get_by_user_id(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[SparkSession], int]:
        """
        Get sessions for a user with pagination.
        Returns tuple of (sessions list, total count).
        """
        pass

    @abstractmethod
    async def update(self, session: SparkSession) -> SparkSession:
        """Update existing session. Returns updated entity."""
        pass

    @abstractmethod
    async def delete(self, session_id: UUID) -> bool:
        """Delete session by ID. Returns True if deleted, False if not found."""
        pass

    @abstractmethod
    async def get_latest_by_user_id(self, user_id: UUID) -> Optional[SparkSession]:
        """Get the most recently updated session for the user."""
        pass

    @abstractmethod
    async def get_in_progress_by_user_id(self, user_id: UUID) -> Optional[SparkSession]:
        """Get the user's current in-progress session (if any)."""
        pass