"""
WaveSession Repository Interface - Domain Layer
Defines contract for WAVE session data access
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from src.modules.wave.domain.entities.wave_session import WaveSession

class IWaveSessionRepository(ABC):
    """Interface for WAVE session data access."""
    @abstractmethod
    async def create(self, session: WaveSession) -> WaveSession:
        """Create a new WAVE session."""
        pass

    @abstractmethod
    async def get_by_id(self, session_id: UUID) -> Optional[WaveSession]:
        """Get session by ID."""
        pass

    @abstractmethod
    async def get_by_user_id(self, user_id: UUID, limit: int = 50) -> List[WaveSession]:
        """Get all sessions for a user."""
        pass

    @abstractmethod
    async def update(self, session: WaveSession) -> WaveSession:
        """Update existing session."""
        pass

    @abstractmethod
    async def delete(self, session_id: UUID) -> bool:
        """Delete session by ID."""
        pass

    @abstractmethod
    async def get_latest_by_user_id(self, user_id: UUID) -> Optional[WaveSession]:
        """Get user's most recent session."""
        pass

    @abstractmethod
    async def get_in_progress_by_user_id(self, user_id: UUID) -> Optional[WaveSession]:
        """Get user's current in-progress session."""
        pass

