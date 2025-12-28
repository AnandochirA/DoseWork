"""
WAVE API Endpoints
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query

from src.infrastructure.database.session import get_db
from src.modules.auth.application.services.auth_service import AuthService
from src.modules.wave.application.services.wave_service import WaveService
from src.modules.wave.application.dto.wave_dto import (
    CreateWaveSessionDTO,
    UpdateCheckinDTO,
    UpdateAcceptanceDTO,
    UpdateActionDTO,
    CompleteActionDTO,
)
from src.modules.wave.infrastructure.repositories.wave_session_repository import WaveSessionRepository
from src.modules.wave.api.schemas.wave_schemas import (
    CreateSessionRequest,
    UpdateCheckinRequest,
    UpdateAcceptanceRequest,
    UpdateActionRequest,
    CompleteActionRequest,
    SessionResponse,
    SessionListResponse,
)
from src.modules.auth.infrastructure.repositories.user_repository import UserRepository
from src.modules.wave.domain.value_objects.action_type import ActionType
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

security = HTTPBearer()

async def get_wave_service(db = Depends(get_db)) -> WaveService:
    """Dependency to get WaveService instance."""
    repository = WaveSessionRepository(db)
    return WaveService(repository)


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)) -> UUID:
      """Dependency to get current user ID from token."""
      # Create auth service
      user_repository = UserRepository(db)
      auth_service = AuthService(user_repository)

      # Get user from token
      user = await auth_service.get_current_user(credentials.credentials)
      if not user:
          raise HTTPException(
              status_code=status.HTTP_401_UNAUTHORIZED,
              detail="Invalid authentication credentials"
          )

      return user.id

@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: CreateSessionRequest,
    user_id: UUID = Depends(get_current_user_id),
    wave_service: WaveService = Depends(get_wave_service)
):
    """Create a new WAVE session."""
    try:
        dto = CreateWaveSessionDTO(user_id=user_id)
        session = await wave_service.create_session(dto)
        return session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    wave_service: WaveService = Depends(get_wave_service)
):
    """Get a specific WAVE session."""
    try:
        session = await wave_service.get_session(session_id)
        
        # Check ownership
        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )
        
        return session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/sessions/{session_id}/checkin", response_model=SessionResponse)
async def update_checkin(
    session_id: UUID,
    request: UpdateCheckinRequest,
    user_id: UUID = Depends(get_current_user_id),
    wave_service: WaveService = Depends(get_wave_service)
):
    """Update check-in data (step 1)."""
    try:
        # Verify ownership
        session = await wave_service.get_session(session_id)
        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this session"
            )
        
        # Update
        dto = UpdateCheckinDTO(
            session_id=session_id,
            situation=request.situation,
            emotion=request.emotion,
            intensity=request.intensity
        )
        updated_session = await wave_service.update_checkin(dto)
        return updated_session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/sessions/{session_id}/acceptance", response_model=SessionResponse)
async def update_acceptance(
    session_id: UUID,
    request: UpdateAcceptanceRequest,
    user_id: UUID = Depends(get_current_user_id),
    wave_service: WaveService = Depends(get_wave_service)
):
    """Update acceptance statement (step 2)."""
    try:
        # Verify ownership
        session = await wave_service.get_session(session_id)
        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this session"
            )
        
        # Update
        dto = UpdateAcceptanceDTO(
            session_id=session_id,
            acceptance_statement=request.acceptance_statement
        )
        updated_session = await wave_service.update_acceptance(dto)
        return updated_session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/sessions/{session_id}/action", response_model=SessionResponse)
async def update_action(
    session_id: UUID,
    request: UpdateActionRequest,
    user_id: UUID = Depends(get_current_user_id),
    wave_service: WaveService = Depends(get_wave_service)
):
    """Update action choice (step 3)."""
    try:
        # Verify ownership
        session = await wave_service.get_session(session_id)
        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this session"
            )
        
        # Update
        dto = UpdateActionDTO(
            session_id=session_id,
            action_type=request.action_type,
            action_notes=request.action_notes
        )
        updated_session = await wave_service.update_action(dto)
        return updated_session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/sessions/{session_id}/action/complete", response_model=SessionResponse)
async def complete_action(
    session_id: UUID,
    request: CompleteActionRequest,
    user_id: UUID = Depends(get_current_user_id),
    wave_service: WaveService = Depends(get_wave_service)
):
    """Mark action as completed."""
    try:
        # Verify ownership
        session = await wave_service.get_session(session_id)
        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this session"
            )
        
        # Complete action
        dto = CompleteActionDTO(
            session_id=session_id,
            duration_seconds=request.duration_seconds
        )
        updated_session = await wave_service.complete_action(dto)
        return updated_session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/sessions/{session_id}/complete", response_model=SessionResponse)
async def complete_session(
    session_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    wave_service: WaveService = Depends(get_wave_service)
):
    """Mark session as completed."""
    try:
        # Verify ownership
        session = await wave_service.get_session(session_id)
        if session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this session"
            )
        
        # Complete session
        completed_session = await wave_service.complete_session(session_id)
        return completed_session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    wave_service: WaveService = Depends(get_wave_service)
):
    """Get all sessions for the current user with pagination."""
    try:
        sessions, total = await wave_service.get_user_sessions(user_id, limit, offset)
        return SessionListResponse(
            sessions=sessions,
            total=total,
            offset=offset,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/actions")
async def get_available_actions():
    """Get all available actions with metadata."""
    try:
        actions = ActionType.all_actions()
        return {
            "actions": actions,
            "total": len(actions)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )