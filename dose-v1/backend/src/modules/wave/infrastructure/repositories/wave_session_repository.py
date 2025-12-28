"""
WaveSession Repository Implementation - Infrastructure Layer
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.wave.domain.entities.wave_session import WaveSession as WaveSessionEntity
from src.modules.wave.domain.repositories.wave_session_repository import IWaveSessionRepository
from src.modules.wave.infrastructure.persistence.models import WaveSession as WaveSessionModel

class WaveSessionRepository(IWaveSessionRepository):
    """SQLAlchemy implementation of WAVE session repository."""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, session: WaveSessionEntity) -> WaveSessionEntity:
        """Create a new WAVE session."""
        db_session = WaveSessionModel(
            id=session.id,
            user_id=session.user_id,
            status=session.status,
            current_step=session.current_step,
            situation=session.situation,
            emotion=session.emotion,
            intensity=session.intensity,
            acceptance_statement=session.acceptance_statement,
            action_type=session.action_type,
            action_completed=session.action_completed,
            actual_duration=session.actual_duration,
            action_notes=session.action_notes,
            created_at=session.created_at,
            updated_at=session.updated_at,
            completed_at=session.completed_at,
        )
        self.session.add(db_session)
        await self.session.flush()
        await self.session.refresh(db_session)
        return self._to_entity(db_session)

    async def get_by_id(self, session_id: UUID) -> Optional[WaveSessionEntity]:
        """Get session by ID."""
        result = await self.session.execute(
            select(WaveSessionModel).where(WaveSessionModel.id == session_id)
        )
        db_session = result.scalar_one_or_none()
        return self._to_entity(db_session) if db_session else None

    async def get_by_user_id(self, user_id: UUID, limit: int = 50) -> List[WaveSessionEntity]:
        """Get all sessions for a user."""
        result = await self.session.execute(
            select(WaveSessionModel)
            .where(WaveSessionModel.user_id == user_id)
            .order_by(WaveSessionModel.created_at.desc())
            .limit(limit)
        )
        db_sessions = result.scalars().all()
        return [self._to_entity(db_session) for db_session in db_sessions]

    async def update(self, session: WaveSessionEntity) -> WaveSessionEntity:
        """Update existing session."""
        result = await self.session.execute(
            select(WaveSessionModel).where(WaveSessionModel.id == session.id)
        )
        db_session = result.scalar_one_or_none()
        if not db_session:
            raise ValueError(f"Session not found: {session.id}")
        
        # Update all fields
        db_session.status = session.status
        db_session.current_step = session.current_step
        db_session.situation = session.situation
        db_session.emotion = session.emotion
        db_session.intensity = session.intensity
        db_session.acceptance_statement = session.acceptance_statement
        db_session.action_type = session.action_type
        db_session.action_completed = session.action_completed
        db_session.actual_duration = session.actual_duration
        db_session.action_notes = session.action_notes
        db_session.updated_at = session.updated_at
        db_session.completed_at = session.completed_at
        
        await self.session.flush()
        await self.session.refresh(db_session)
        return self._to_entity(db_session)

    async def delete(self, session_id: UUID) -> bool:
        """Delete session by ID."""
        result = await self.session.execute(
            select(WaveSessionModel).where(WaveSessionModel.id == session_id)
        )
        db_session = result.scalar_one_or_none()
        if db_session:
            await self.session.delete(db_session)
            return True
        return False

    async def get_latest_by_user_id(self, user_id: UUID) -> Optional[WaveSessionEntity]:
        """Get user's most recent session."""
        result = await self.session.execute(
            select(WaveSessionModel)
            .where(WaveSessionModel.user_id == user_id)
            .order_by(WaveSessionModel.created_at.desc())
            .limit(1)
        )
        db_session = result.scalar_one_or_none()
        return self._to_entity(db_session) if db_session else None

    async def get_in_progress_by_user_id(self, user_id: UUID) -> Optional[WaveSessionEntity]:
        """Get user's current in-progress session."""
        result = await self.session.execute(
            select(WaveSessionModel)
            .where(
                WaveSessionModel.user_id == user_id,
                WaveSessionModel.status == "in_progress"
            )
            .order_by(WaveSessionModel.created_at.desc())
            .limit(1)
        )
        db_session = result.scalar_one_or_none()
        return self._to_entity(db_session) if db_session else None

    @staticmethod
    def _to_entity(model: WaveSessionModel) -> WaveSessionEntity:
        """Convert SQLAlchemy model to domain entity."""
        return WaveSessionEntity(
            id=model.id,
            user_id=model.user_id,
            status=model.status,
            current_step=model.current_step,
            situation=model.situation,
            emotion=model.emotion,
            intensity=model.intensity,
            acceptance_statement=model.acceptance_statement,
            action_type=model.action_type,
            action_completed=model.action_completed,
            actual_duration=model.actual_duration,
            action_notes=model.action_notes,
            created_at=model.created_at,
            updated_at=model.updated_at,
            completed_at=model.completed_at,
        )
    
    