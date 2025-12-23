"""
Auth Service - Application Layer
Business logic for authentication
"""

from datetime import datetime
from uuid import uuid4
from typing import Optional
from src.modules.auth.domain.entities.user import User
from src.modules.auth.infrastructure.repositories.user_repository import IUserRepository
from src.modules.auth.application.dto.auth_dto import RegisterUserDTO, LoginDTO, TokenDTO, UserDTO
from src.core.utils.security.password import hash_password, verify_password
from src.modules.auth.infrastructure.jwt.token_service import TokenService

class AuthService:
    """Service handling authentication business logic."""
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository
        self.token_service = TokenService()

    async def register(self, dto: RegisterUserDTO) -> UserDTO:
        """Register a new user."""
        # Check if user already exists
        if await self.user_repository.exists_by_email(dto.email):
            raise ValueError(f"User with email {dto.email} already exists")
        
        # Create user entity
        user = User(
            id=uuid4(),
            email=dto.email,
            hashed_password=hash_password(dto.password),
            full_name=dto.full_name,
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # Save to database
        created_user = await self.user_repository.create(user)

        return self._to_dto(created_user)

    async def login(self, dto: LoginDTO) -> TokenDTO:
        """Authenticate user and return tokens."""
        # Get user by email
        user = await self.user_repository.get_by_email(dto.email)
        if not user:
            raise ValueError("Invalid email or password")

        # Verify password
        if not verify_password(dto.password, user.hashed_password):
            raise ValueError("Invalid email or password")

        # Check if user is active
        if not user.is_active:
            raise ValueError("User account is deactivated")

        # Generate tokens
        access_token = self.token_service.create_access_token(user_id=str(user.id), email=user.email)
        refresh_token = self.token_service.create_refresh_token(user_id=str(user.id))

        return TokenDTO(access_token=access_token, refresh_token=refresh_token)

    async def get_current_user(self, token: str) -> Optional[UserDTO]:
        """Get current user from token."""
        payload = self.token_service.decode_token(token)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None

        user = await self.user_repository.get_by_id(user_id)
        return self._to_dto(user) if user else None

    @staticmethod
    def _to_dto(user: User) -> UserDTO:
        """Convert entity to DTO."""
        return UserDTO(id=user.id, email=user.email, full_name=user.full_name,
            is_active=user.is_active, is_verified=user.is_verified)

    

