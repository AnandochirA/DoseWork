"""
Auth API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.session import get_db
from src.modules.auth.api.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse
)
from src.modules.auth.application.dto.auth_dto import RegisterUserDTO, LoginDTO
from src.modules.auth.application.services.auth_service import AuthService
from src.modules.auth.infrastructure.repositories.user_repository import UserRepository


router = APIRouter()

security = HTTPBearer()


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency to get auth service."""
    user_repository = UserRepository(db)
    return AuthService(user_repository)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)):
    """Register a new user."""
    try:
        dto = RegisterUserDTO(email=request.email, password=request.password, full_name=request.full_name)
        user = await auth_service.register(dto)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post('/login', response_model=TokenResponse)
async def login(request: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    """Login and get access tokens."""
    try:
        dto = LoginDTO(email=request.email, password=request.password)
        tokens = await auth_service.login(dto)
        return tokens
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), auth_service: AuthService = Depends(get_auth_service)):
    """Get current authenticated user."""
    user = await auth_service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    
    return user


    