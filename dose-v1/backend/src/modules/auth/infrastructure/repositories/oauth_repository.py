"""
OAuth Account Repository
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.auth.infrastructure.persistence.oauth_account_model import OAuthAccount


class OAuthAccountRepository:
    """Repository for OAuth account operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        user_id: UUID,
        provider: str,
        provider_user_id: str,
        provider_email: Optional[str] = None,
        access_token: Optional[str] = None,
        refresh_token: Optional[str] = None,
        token_expires_at: Optional[datetime] = None,
        provider_data: Optional[dict] = None
    ) -> OAuthAccount:
        """Create new OAuth account link."""
        oauth_account = OAuthAccount(
            user_id=user_id,
            provider=provider,
            provider_user_id=provider_user_id,
            provider_email=provider_email,
            access_token=access_token,
            refresh_token=refresh_token,
            token_expires_at=token_expires_at,
            provider_data=provider_data
        )
        self.session.add(oauth_account)
        await self.session.flush()
        return oauth_account

    async def get_by_provider(
        self,
        provider: str,
        provider_user_id: str
    ) -> Optional[OAuthAccount]:
        """Get OAuth account by provider and provider user ID."""
        result = await self.session.execute(
            select(OAuthAccount).where(
                OAuthAccount.provider == provider,
                OAuthAccount.provider_user_id == provider_user_id
            )
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: UUID,
        provider: str
    ) -> Optional[OAuthAccount]:
        """Get OAuth account for a user and provider."""
        result = await self.session.execute(
            select(OAuthAccount).where(
                OAuthAccount.user_id == user_id,
                OAuthAccount.provider == provider
            )
        )
        return result.scalar_one_or_none()

    async def update_tokens(
        self,
        oauth_account_id: UUID,
        access_token: str,
        refresh_token: Optional[str] = None,
        expires_at: Optional[datetime] = None
    ) -> None:
        """Update OAuth tokens."""
        result = await self.session.execute(
            select(OAuthAccount).where(OAuthAccount.id == oauth_account_id)
        )
        account = result.scalar_one_or_none()
        if account:
            account.access_token = access_token
            if refresh_token:
                account.refresh_token = refresh_token
            if expires_at:
                account.token_expires_at = expires_at
            account.updated_at = datetime.utcnow()
            await self.session.flush()

    async def delete_by_user_and_provider(
        self,
        user_id: UUID,
        provider: str
    ) -> bool:
        """Delete OAuth connection."""
        result = await self.session.execute(
            select(OAuthAccount).where(
                OAuthAccount.user_id == user_id,
                OAuthAccount.provider == provider
            )
        )
        account = result.scalar_one_or_none()
        if account:
            await self.session.delete(account)
            await self.session.flush()
            return True
        return False
