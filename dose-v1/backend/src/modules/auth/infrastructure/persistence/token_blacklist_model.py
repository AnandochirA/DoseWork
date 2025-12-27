"""
Token Blacklist Model for Logout Functionality
"""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from src.infrastructure.database.base import Base


class TokenBlacklist(Base):
    """
    Stores blacklisted JWT tokens (for logout functionality).
    Tokens are stored here when users logout to prevent reuse.
    """
    __tablename__ = "token_blacklist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token_jti = Column(String, unique=True, nullable=False, index=True)  # JWT ID
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    blacklisted_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)  # When token would naturally expire
