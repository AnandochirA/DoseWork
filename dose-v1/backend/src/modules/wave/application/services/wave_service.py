"""
WaveService - Application Layer
Orchestrates WAVE session business logic
"""

from datetime import datetime
from typing import List, Tuple
from uuid import UUID, uuid4

from src.modules.wave.domain.entities.wave_session import WaveSession
from src.modules.wave.domain.repositories.wave_session_repository import IWaveSessionRepository
from src.modules.wave.domain.value_objects.session_status import SessionStatus
from src.modules.wave.application.dto.wave_dto import (
    CreateWaveSessionDTO,
    UpdateCheckinDTO,
    UpdateAcceptanceDTO,
    UpdateActionDTO,
    CompleteActionDTO,
    WaveSessionDTO,
    WaveSessionSummaryDTO,
)

class WaveService:
    """Service for WAVE session operations."""
    
    def __init__(self, repository: IWaveSessionRepository):
        self.repository = repository
    
    async def create_session(self, dto: CreateWaveSessionDTO) -> WaveSessionDTO:
        """Create a new WAVE session."""
        # Create domain entity
        session = WaveSession(
            id=uuid4(),
            user_id=dto.user_id,
            status=SessionStatus.IN_PROGRESS,
            current_step=1,
            situation=None,
            emotion=None,
            intensity=None,
            acceptance_statement=None,
            action_type=None,
            action_completed=False,
            actual_duration=None,
            action_notes=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            completed_at=None,
        )
        
        # Save to database
        created_session = await self.repository.create(session)
        
        # Return DTO
        return self._to_dto(created_session)
    
    async def update_checkin(self, dto: UpdateCheckinDTO) -> WaveSessionDTO:
        """Update check-in data (step 1)."""
        # Get session
        session = await self.repository.get_by_id(dto.session_id)
        if not session:
            raise ValueError(f"Session not found: {dto.session_id}")
        
        # Check if can progress
        if not session.can_progress_to_step(2):
            raise ValueError("Cannot update check-in at this stage")
        
        # Update entity
        session.set_checkin_data(
            situation=dto.situation,
            emotion=dto.emotion,
            intensity=dto.intensity
        )
        
        # Save to database
        updated_session = await self.repository.update(session)
        
        # Return DTO
        return self._to_dto(updated_session)

    async def update_acceptance(self, dto: UpdateAcceptanceDTO) -> WaveSessionDTO:
        """Update acceptance statement (step 2)."""
        # Get session
        session = await self.repository.get_by_id(dto.session_id)
        if not session:
            raise ValueError(f"Session not found: {dto.session_id}")
        
        # Check if can progress
        if session.current_step != 2:
            raise ValueError("Must complete check-in before acceptance")
        
        # Update entity
        session.set_acceptance(dto.acceptance_statement)
        
        # Save to database
        updated_session = await self.repository.update(session)
        
        # Return DTO
        return self._to_dto(updated_session)

    async def update_action(self, dto: UpdateActionDTO) -> WaveSessionDTO:
        """Update action choice (step 3)."""
        # Get session
        session = await self.repository.get_by_id(dto.session_id)
        if not session:
            raise ValueError(f"Session not found: {dto.session_id}")
        
        # Check if can progress
        if session.current_step != 3:
            raise ValueError("Must complete acceptance before choosing action")
        
        # Update entity
        session.set_action(
            action_type=dto.action_type,
            action_notes=dto.action_notes
        )
        
        # Save to database
        updated_session = await self.repository.update(session)
        
        # Return DTO
        return self._to_dto(updated_session)

    async def complete_action(self, dto: CompleteActionDTO) -> WaveSessionDTO:
        """Mark action as completed."""
        # Get session
        session = await self.repository.get_by_id(dto.session_id)
        if not session:
            raise ValueError(f"Session not found: {dto.session_id}")
        
        # Check if action is set
        if not session.action_type:
            raise ValueError("No action has been set")
        
        # Complete action
        session.complete_action(duration_seconds=dto.duration_seconds)
        
        # Save to database
        updated_session = await self.repository.update(session)
        
        # Return DTO
        return self._to_dto(updated_session)

    async def complete_session(self, session_id: UUID) -> WaveSessionDTO:
        """Mark session as completed."""
        # Get session
        session = await self.repository.get_by_id(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")
        
        # Complete session (entity validates all steps done)
        session.complete_session()
        
        # Save to database
        updated_session = await self.repository.update(session)
        
        # Return DTO
        return self._to_dto(updated_session)

    async def get_session(self, session_id: UUID) -> WaveSessionDTO:
        """Get session by ID."""
        session = await self.repository.get_by_id(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")
        
        return self._to_dto(session)

    async def get_user_sessions(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[WaveSessionSummaryDTO], int]:
        """
        Get sessions for a user with pagination.
        Returns tuple of (sessions list, total count).
        """
        sessions, total = await self.repository.get_by_user_id(user_id, limit, offset)
        return [self._to_summary_dto(session) for session in sessions], total

    @staticmethod
    def _to_dto(session: WaveSession) -> WaveSessionDTO:
        """Convert entity to full DTO."""
        return WaveSessionDTO(
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
            progress_percentage=session.get_progress_percentage(),
        )
    
    @staticmethod
    def _to_summary_dto(session: WaveSession) -> WaveSessionSummaryDTO:
        """Convert entity to summary DTO."""
        return WaveSessionSummaryDTO(
            id=session.id,
            status=session.status,
            current_step=session.current_step,
            emotion=session.emotion,
            action_type=session.action_type,
            created_at=session.created_at,
            completed_at=session.completed_at,
            progress_percentage=session.get_progress_percentage(),
        )

    