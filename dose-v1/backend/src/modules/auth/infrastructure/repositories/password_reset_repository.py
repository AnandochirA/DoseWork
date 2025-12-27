"""
Password Reset Token Repository
"""

from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.auth.infrastructure.persistence.password_reset_model import PasswordResetToken


class PasswordResetRepository:
    """Repository for password reset token operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_reset_token(
        self,
        user_id: UUID,
        token_hash: str,
        expires_hours: int = 1
    ) -> PasswordResetToken:
        """Create a new password reset token."""
        reset_token = PasswordResetToken(
            user_id=user_id,
            token=token_hash,
            expires_at=datetime.utcnow() + timedelta(hours=expires_hours)
        )
        self.session.add(reset_token)
        await self.session.flush()
        return reset_token

    async def get_by_token(self, token_hash: str) -> Optional[PasswordResetToken]:
        """Get reset token by hashed value."""
        result = await self.session.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.token == token_hash,
                PasswordResetToken.is_used == False,
                PasswordResetToken.expires_at > datetime.utcnow()
            )
        )
        return result.scalar_one_or_none()

    async def mark_as_used(self, token_id: UUID) -> None:
        """Mark token as used."""
        result = await self.session.execute(
            select(PasswordResetToken).where(PasswordResetToken.id == token_id)
        )
        token = result.scalar_one_or_none()
        if token:
            token.is_used = True
            await self.session.flush()

    async def delete_user_tokens(self, user_id: UUID) -> None:
        """Delete all reset tokens for a user."""
        result = await self.session.execute(
            select(PasswordResetToken).where(PasswordResetToken.user_id == user_id)
        )
        tokens = result.scalars().all()
        for token in tokens:
            await self.session.delete(token)
        await self.session.flush()
