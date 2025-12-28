"""
Enhanced Auth Service with Logout, Password Reset, and OAuth
"""

from datetime import datetime
from uuid import uuid4, UUID
from typing import Optional, Dict, Any
import secrets
import hashlib

from src.modules.auth.domain.entities.user import User
from src.modules.auth.infrastructure.repositories.user_repository import IUserRepository
from src.modules.auth.infrastructure.repositories.token_blacklist_repository import TokenBlacklistRepository
from src.modules.auth.infrastructure.repositories.password_reset_repository import PasswordResetRepository
from src.modules.auth.infrastructure.repositories.oauth_repository import OAuthAccountRepository
from src.modules.auth.application.dto.auth_dto import (
    RegisterUserDTO,
    LoginDTO,
    TokenDTO,
    UserDTO
)
from src.core.utils.security.password import hash_password, verify_password
from src.modules.auth.infrastructure.jwt.token_service import TokenService


class AuthServiceEnhanced:
    """Enhanced authentication service with all modern auth features."""

    def __init__(
        self,
        user_repository: IUserRepository,
        token_blacklist_repo: TokenBlacklistRepository,
        password_reset_repo: PasswordResetRepository,
        oauth_repo: OAuthAccountRepository
    ):
        self.user_repository = user_repository
        self.token_blacklist_repo = token_blacklist_repo
        self.password_reset_repo = password_reset_repo
        self.oauth_repo = oauth_repo
        self.token_service = TokenService()

    # ========== Original Methods ==========

    async def register(self, dto: RegisterUserDTO) -> UserDTO:
        """Register a new user."""
        if await self.user_repository.exists_by_email(dto.email):
            raise ValueError(f"User with email {dto.email} already exists")

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

        created_user = await self.user_repository.create(user)
        return self._to_dto(created_user)

    async def login(self, dto: LoginDTO) -> TokenDTO:
        """Authenticate user and return tokens."""
        user = await self.user_repository.get_by_email(dto.email)
        if not user:
            raise ValueError("Invalid email or password")

        if not verify_password(dto.password, user.hashed_password):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("User account is deactivated")

        access_token = self.token_service.create_access_token(user_id=str(user.id), email=user.email)
        refresh_token = self.token_service.create_refresh_token(user_id=str(user.id))

        return TokenDTO(access_token=access_token, refresh_token=refresh_token)

    async def get_current_user(self, token: str) -> Optional[UserDTO]:
        """Get current user from token."""
        # Check if token is blacklisted
        token_jti = self.token_service.get_token_jti(token)
        if token_jti and await self.token_blacklist_repo.is_blacklisted(token_jti):
            return None

        payload = self.token_service.decode_token(token)
        if not payload:
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        user = await self.user_repository.get_by_id(user_id)
        return self._to_dto(user) if user else None

    # ========== New Methods: Logout ==========

    async def logout(self, token: str) -> bool:
        """
        Logout user by blacklisting their token.

        Args:
            token: JWT access token

        Returns:
            True if successful
        """
        token_jti = self.token_service.get_token_jti(token)
        if not token_jti:
            raise ValueError("Invalid token")

        # Get user ID and expiry from token
        payload = self.token_service.decode_token(token)
        if not payload:
            raise ValueError("Invalid token")

        user_id = UUID(payload.get("sub"))
        expires_at = self.token_service.get_token_expiry(token)

        if not expires_at:
            raise ValueError("Token has no expiry")

        # Add to blacklist
        await self.token_blacklist_repo.add_to_blacklist(
            token_jti=token_jti,
            user_id=user_id,
            expires_at=expires_at
        )

        return True

    # ========== New Methods: Account Deletion ==========

    async def delete_account(self, user_id: UUID, password: str) -> bool:
        """
        Delete user account (requires password confirmation).

        Args:
            user_id: User's UUID
            password: User's password for confirmation

        Returns:
            True if successfully deleted
        """
        user = await self.user_repository.get_by_id(str(user_id))
        if not user:
            raise ValueError("User not found")

        # Verify password
        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid password")

        # Delete user (cascade will delete related data)
        await self.user_repository.delete(user_id)

        return True

    # ========== New Methods: Password Reset ==========

    async def request_password_reset(self, email: str) -> Optional[str]:
        """
        Request password reset.

        Args:
            email: User's email

        Returns:
            Reset token (in production, this would be emailed, not returned)
        """
        user = await self.user_repository.get_by_email(email)
        if not user:
            # Don't reveal if email exists (security best practice)
            return None

        # Generate secure random token
        raw_token = secrets.token_urlsafe(32)

        # Hash token before storing
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        # Delete any existing reset tokens for this user
        await self.password_reset_repo.delete_user_tokens(user.id)

        # Create new reset token
        await self.password_reset_repo.create_reset_token(
            user_id=user.id,
            token_hash=token_hash,
            expires_hours=1
        )

        # In production: Send email with reset link containing raw_token
        # For now, return raw_token for testing
        return raw_token

    async def reset_password(self, token: str, new_password: str) -> bool:
        """
        Reset password using reset token.

        Args:
            token: Password reset token
            new_password: New password

        Returns:
            True if successful
        """
        # Hash the token to look up in database
        token_hash = hashlib.sha256(token.encode()).hexdigest()

        # Get reset token from database
        reset_token = await self.password_reset_repo.get_by_token(token_hash)
        if not reset_token:
            raise ValueError("Invalid or expired reset token")

        # Get user
        user = await self.user_repository.get_by_id(str(reset_token.user_id))
        if not user:
            raise ValueError("User not found")

        # Update password
        user.hashed_password = hash_password(new_password)
        user.updated_at = datetime.utcnow()
        await self.user_repository.update(user)

        # Mark token as used
        await self.password_reset_repo.mark_as_used(reset_token.id)

        return True

    # ========== New Methods: OAuth ==========

    async def oauth_login(
        self,
        provider: str,
        provider_user_id: str,
        email: str,
        name: Optional[str] = None,
        provider_data: Optional[Dict[str, Any]] = None
    ) -> TokenDTO:
        """
        Login or register user via OAuth provider.

        Args:
            provider: OAuth provider (google, github, linkedin)
            provider_user_id: User ID from provider
            email: Email from provider
            name: Full name from provider
            provider_data: Additional data from provider

        Returns:
            JWT tokens
        """
        # Check if OAuth account already exists
        oauth_account = await self.oauth_repo.get_by_provider(provider, provider_user_id)

        if oauth_account:
            # Existing OAuth account - login
            user = await self.user_repository.get_by_id(str(oauth_account.user_id))
            if not user:
                raise ValueError("User not found")

        else:
            # New OAuth account
            # Check if user exists by email
            user = await self.user_repository.get_by_email(email)

            if not user:
                # Create new user
                user = User(
                    id=uuid4(),
                    email=email,
                    hashed_password=hash_password(secrets.token_urlsafe(32)),  # Random password
                    full_name=name,
                    is_active=True,
                    is_verified=True,  # OAuth emails are verified
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                user = await self.user_repository.create(user)

            # Link OAuth account to user
            await self.oauth_repo.create(
                user_id=user.id,
                provider=provider,
                provider_user_id=provider_user_id,
                provider_email=email,
                provider_data=provider_data
            )

        # Generate tokens
        access_token = self.token_service.create_access_token(user_id=str(user.id), email=user.email)
        refresh_token = self.token_service.create_refresh_token(user_id=str(user.id))

        return TokenDTO(access_token=access_token, refresh_token=refresh_token)

    # ========== Helper Methods ==========

    @staticmethod
    def _to_dto(user: User) -> UserDTO:
        """Convert entity to DTO."""
        return UserDTO(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            is_verified=user.is_verified
        )
