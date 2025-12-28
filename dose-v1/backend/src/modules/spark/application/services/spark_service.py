"""
SPARK Service - Application Layer
Business logic for SPARK cognitive restructuring sessions
"""

from datetime import datetime
from uuid import uuid4, UUID
from typing import List, Optional, Tuple

from src.modules.spark.domain.entities.spark_session import SparkSession
from src.modules.spark.domain.repositories.spark_session_repository import ISparkSessionRepository
from src.modules.spark.domain.value_objects.session_status import SessionStatus
from src.modules.spark.application.dto.spark_dto import (
    CreateSparkSessionDTO,
    UpdateStepDTO,
    SparkSessionDTO,
    SparkSessionSummaryDTO
)

class SparkService:
    """Service handling SPARK session business logic."""
    
    def __init__(self, session_repository: ISparkSessionRepository):
        self.session_repository = session_repository

    async def create_session(self, dto: CreateSparkSessionDTO) -> SparkSessionDTO:
        """
        Create a new SPARK session.

        Args:
            dto: Data transfer object containing user_id.

        Returns:
            SparkSessionDTO with the created session data.
        """
        # Create session entity
        session = SparkSession(
            id=uuid4(),
            user_id=dto.user_id,
            status=SessionStatus.IN_PROGRESS,
            current_step=1,
            situation_response=None,
            perception_response=None,
            affect_response=None,
            response_response=None,
            key_result_response=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            completed_at=None,
        )
        
        # Save to database
        created_session = await self.session_repository.create(session)
        
        # Convert to DTO and return
        return self._to_dto(created_session)

    async def update_step(self, dto: UpdateStepDTO) -> SparkSessionDTO:
        """
        Update a step response in a session.

        Args:
            dto: Data transfer object with session_id, step_number, and response.

        Returns:
            SparkSessionDTO with the updated session data.

        Raises:
            ValueError: If session not found or step update is invalid.
        """
        # Get session
        session = await self.session_repository.get_by_id(dto.session_id)
        if not session:
            raise ValueError(f"Session not found: {dto.session_id}")

        # Check if can progress to this step
        if not session.can_progress_to_step(dto.step_number):
            raise ValueError(f"Cannot update step {dto.step_number}")

        # Update step response (entity method handles logic)
        session.set_step_response(dto.step_number, dto.response)
        session.updated_at = datetime.utcnow()

        # Save updated session
        updated_session = await self.session_repository.update(session)

        return self._to_dto(updated_session)
    
    async def complete_session(self, session_id: UUID) -> SparkSessionDTO:
        """
        Mark session as completed.

        Args:
            session_id: UUID of the session to complete.

        Returns:
            SparkSessionDTO with the completed session data.

        Raises:
            ValueError: If session not found or not all steps completed.
        """
        # Get session
        session = await self.session_repository.get_by_id(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")

        # Complete session (entity validates all steps done)
        session.complete_session()
        session.updated_at = datetime.utcnow()

        # Save
        completed_session = await self.session_repository.update(session)

        return self._to_dto(completed_session)

    async def get_session(self, session_id: UUID) -> Optional[SparkSessionDTO]:
        """
        Get session by ID.

        Args:
            session_id: UUID of the session to retrieve.

        Returns:
            SparkSessionDTO if found, None otherwise.
        """
        session = await self.session_repository.get_by_id(session_id)
        return self._to_dto(session) if session else None

    async def get_user_sessions(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[SparkSessionSummaryDTO], int]:
        """
        Get sessions for a user with pagination.

        Args:
            user_id: UUID of the user.
            limit: Maximum number of sessions to return (default: 50).
            offset: Number of sessions to skip (default: 0).

        Returns:
            Tuple of (List of SparkSessionSummaryDTO objects, total count).
        """
        sessions, total = await self.session_repository.get_by_user_id(user_id, limit, offset)
        return [self._to_summary_dto(session) for session in sessions], total

    @staticmethod
    def _to_dto(session: SparkSession) -> SparkSessionDTO:
        """Convert entity to full DTO."""
        return SparkSessionDTO(
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

    @staticmethod
    def _to_summary_dto(session: SparkSession) -> SparkSessionSummaryDTO:
        """Convert entity to summary DTO."""
        return SparkSessionSummaryDTO(
            id=session.id,
            status=session.status,
            current_step=session.current_step,
            created_at=session.created_at,
            completed_at=session.completed_at,
        )