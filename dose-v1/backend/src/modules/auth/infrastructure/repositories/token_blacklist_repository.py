"""
Token Blacklist Repository
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.auth.infrastructure.persistence.token_blacklist_model import TokenBlacklist


class TokenBlacklistRepository:
    """Repository for token blacklist operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_to_blacklist(
        self,
        token_jti: str,
        user_id: UUID,
        expires_at: datetime
    ) -> TokenBlacklist:
        """Add token to blacklist."""
        blacklist_entry = TokenBlacklist(
            token_jti=token_jti,
            user_id=user_id,
            expires_at=expires_at,
            blacklisted_at=datetime.utcnow()
        )
        self.session.add(blacklist_entry)
        await self.session.flush()
        return blacklist_entry

    async def is_blacklisted(self, token_jti: str) -> bool:
        """Check if token is blacklisted."""
        result = await self.session.execute(
            select(TokenBlacklist).where(TokenBlacklist.token_jti == token_jti)
        )
        return result.scalar_one_or_none() is not None

    async def cleanup_expired(self) -> int:
        """Remove expired tokens from blacklist. Returns count of deleted."""
        result = await self.session.execute(
            select(TokenBlacklist).where(TokenBlacklist.expires_at < datetime.utcnow())
        )
        expired = result.scalars().all()

        for entry in expired:
            await self.session.delete(entry)

        await self.session.flush()
        return len(expired)
