"""
SparkSession Repository Implementation - Infrastructure Layer
"""

from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.spark.domain.entities.spark_session import SparkSession as SparkSessionEntity
from src.modules.spark.domain.repositories.spark_session_repository import ISparkSessionRepository
from src.modules.spark.infrastructure.persistence.models import SparkSession as SparkSessionModel

class SparkSessionRepository(ISparkSessionRepository):
    """SQLAlchemy implementation of SPARK session repository."""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, session: SparkSessionEntity) -> SparkSessionEntity:
        """Create a new SPARK session."""
        db_session = SparkSessionModel(
            id=session.id,
            user_id=session.user_id,
            status=session.status,
            current_step=session.current_step,
            situation_response=session.situation_response,
            perception_response=session.perception_response,
            affect_response=session.affect_response,
            response_response=session.response_response,
            key_result_response=session.key_result_response,
            created_at=session.created_at,
            updated_at=session.updated_at,
            completed_at=session.completed_at,
        )
        self.session.add(db_session)
        await self.session.flush()
        await self.session.refresh(db_session)
        return self._to_entity(db_session)
    
    async def get_by_id(self, session_id: UUID) -> Optional[SparkSessionEntity]:
        """Get session by ID."""
        result = await self.session.execute(
            select(SparkSessionModel).where(SparkSessionModel.id == session_id)
        )
        db_session = result.scalar_one_or_none()
        return self._to_entity(db_session) if db_session else None

    async def get_by_user_id(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[SparkSessionEntity], int]:
        """
        Get sessions for a user with pagination.

        Args:
            user_id: The user's UUID
            limit: Maximum number of sessions to return
            offset: Number of sessions to skip

        Returns:
            Tuple of (sessions list, total count)
        """
        # Get paginated results
        result = await self.session.execute(
            select(SparkSessionModel)
            .where(SparkSessionModel.user_id == user_id)
            .order_by(SparkSessionModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        db_sessions = result.scalars().all()

        # Get total count
        count_result = await self.session.execute(
            select(func.count(SparkSessionModel.id))
            .where(SparkSessionModel.user_id == user_id)
        )
        total_count = count_result.scalar()

        return [self._to_entity(db_session) for db_session in db_sessions], total_count
    
    async def update(self, session: SparkSessionEntity) -> SparkSessionEntity:
        """Update existing session."""
        result = await self.session.execute(
            select(SparkSessionModel).where(SparkSessionModel.id == session.id)
        )
        db_session = result.scalar_one_or_none()
        if not db_session:
            raise ValueError(f"Session not found: {session.id}")
        
        # Update all fields
        db_session.status = session.status
        db_session.current_step = session.current_step
        db_session.situation_response = session.situation_response
        db_session.perception_response = session.perception_response
        db_session.affect_response = session.affect_response
        db_session.response_response = session.response_response
        db_session.key_result_response = session.key_result_response
        db_session.updated_at = session.updated_at
        db_session.completed_at = session.completed_at
        
        await self.session.flush()
        await self.session.refresh(db_session)
        return self._to_entity(db_session)

    async def delete(self, session_id: UUID) -> bool:
        """Delete session by ID."""
        result = await self.session.execute(
            select(SparkSessionModel).where(SparkSessionModel.id == session_id)
        )
        db_session = result.scalar_one_or_none()
        if db_session:
            await self.session.delete(db_session)
            return True
        return False

    async def get_latest_by_user_id(self, user_id: UUID) -> Optional[SparkSessionEntity]:
        """Get user's most recent session."""
        result = await self.session.execute(
            select(SparkSessionModel)
            .where(SparkSessionModel.user_id == user_id)
            .order_by(SparkSessionModel.created_at.desc())
            .limit(1)
        )
        db_session = result.scalar_one_or_none()
        return self._to_entity(db_session) if db_session else None

    async def get_in_progress_by_user_id(self, user_id: UUID) -> Optional[SparkSessionEntity]:
        """Get user's current in-progress session."""
        result = await self.session.execute(
            select(SparkSessionModel)
            .where(
                SparkSessionModel.user_id == user_id,
                SparkSessionModel.status == "in_progress"
            )
            .order_by(SparkSessionModel.created_at.desc())
            .limit(1)
        )
        db_session = result.scalar_one_or_none()
        return self._to_entity(db_session) if db_session else None

    @staticmethod
    def _to_entity(model: SparkSessionModel) -> SparkSessionEntity:
        """Convert SQLAlchemy model to domain entity."""
        return SparkSessionEntity(
            id=model.id,
            user_id=model.user_id,
            status=model.status,
            current_step=model.current_step,
            situation_response=model.situation_response,
            perception_response=model.perception_response,
            affect_response=model.affect_response,
            response_response=model.response_response,
            key_result_response=model.key_result_response,
            created_at=model.created_at,
            updated_at=model.updated_at,
            completed_at=model.completed_at,
        )
        