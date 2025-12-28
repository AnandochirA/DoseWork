"""
OAuth Account Model for Social Login
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from src.infrastructure.database.session import Base


class OAuthAccount(Base):
    """
    Stores OAuth provider connections (Google, GitHub, LinkedIn, etc.).
    Links external OAuth accounts to internal user accounts.
    """
    __tablename__ = "oauth_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(50), nullable=False)  # 'google', 'github', 'linkedin'
    provider_user_id = Column(String, nullable=False)  # ID from OAuth provider
    provider_email = Column(String, nullable=True)  # Email from OAuth provider
    access_token = Column(String, nullable=True)  # OAuth access token (encrypted in production)
    refresh_token = Column(String, nullable=True)  # OAuth refresh token (encrypted in production)
    token_expires_at = Column(DateTime, nullable=True)
    provider_data = Column(JSON, nullable=True)  # Additional data from provider
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Ensure one provider account per user
    __table_args__ = (
        {"schema": None},  # Default schema
    )

    # Note: Add unique constraint: (user_id, provider) in migration
