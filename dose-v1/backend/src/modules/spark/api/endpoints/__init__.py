"""
SPARK API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.session import get_db
from src.modules.spark.api.schemas.spark_schemas import (
    CreateSessionRequest,
    UpdateStepRequest,
    SessionResponse,
    SessionListResponse
)
from src.modules.spark.application.dto.spark_dto import (
    CreateSparkSessionDTO,
    UpdateStepDTO
)
from src.modules.spark.application.services.spark_service import SparkService
from src.modules.spark.infrastructure.repositories.spark_session_repository import SparkSessionRepository
from src.modules.auth.application.services.auth_service import AuthService
from src.modules.auth.infrastructure.repositories.user_repository import UserRepository

router = APIRouter()
security = HTTPBearer()

def get_spark_service(db: AsyncSession = Depends(get_db)) -> SparkService:
    """Dependency to get SPARK service."""
    session_repository = SparkSessionRepository(db)
    return SparkService(session_repository)

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
async def create_session(request: CreateSessionRequest, user_id: UUID = Depends(get_current_user_id), spark_service: SparkService = Depends(get_spark_service)):
    """Create a new SPARK session."""
    try:
        # Create DTO with authenticated user's ID
        dto = CreateSparkSessionDTO(user_id=user_id)
        # Create session
        session = await spark_service.create_session(dto)
        return session
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: UUID, user_id: UUID = Depends(get_current_user_id), spark_service: SparkService = Depends(get_spark_service)):
    """Get a specific SPARK session."""
    # Get session
    session = await spark_service.get_session(session_id)
    
    # Check if exists
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session not found: {session_id}"
        )
    
    # Check ownership (security!)
    if session.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this session"
        )
    
    return session

@router.put("/sessions/{session_id}/steps", response_model=SessionResponse)
async def update_step(session_id: UUID, request: UpdateStepRequest, user_id: UUID = Depends(get_current_user_id), spark_service: SparkService = Depends(get_spark_service)):
    """Update a step response in a SPARK session."""
    # First verify user owns this session
    session = await spark_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session not found: {session_id}"
        )
    
    if session.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this session"
        )
    
    try:
        # Create DTO
        dto = UpdateStepDTO(
            session_id=session_id,
            step_number=request.step_number,
            response=request.response
        )
        # Update step
        updated_session = await spark_service.update_step(dto)
        return updated_session
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/sessions/{session_id}/complete", response_model=SessionResponse)
async def complete_session(session_id: UUID, user_id: UUID = Depends(get_current_user_id), spark_service: SparkService = Depends(get_spark_service)):
    """Mark a SPARK session as completed."""
    # Verify ownership
    session = await spark_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session not found: {session_id}"
        )
    
    if session.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this session"
        )
    
    try:
        # Complete session
        completed_session = await spark_service.complete_session(session_id)
        
        return completed_session
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(
    limit: int = 50,
    offset: int = 0,
    user_id: UUID = Depends(get_current_user_id),
    spark_service: SparkService = Depends(get_spark_service)
):
    """
    Get all SPARK sessions for the current user with pagination.

    Args:
        limit: Maximum number of sessions to return (default: 50, max: 100)
        offset: Number of sessions to skip (default: 0)
    """
    # Validate pagination parameters
    if limit > 100:
        limit = 100
    if limit < 1:
        limit = 1
    if offset < 0:
        offset = 0

    # Get user's sessions with pagination
    sessions, total = await spark_service.get_user_sessions(user_id, limit, offset)

    return SessionListResponse(
        sessions=sessions,
        total=total,
        offset=offset,
        limit=limit
    )
