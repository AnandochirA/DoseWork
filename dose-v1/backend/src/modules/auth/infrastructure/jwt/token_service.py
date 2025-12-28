"""
JWT Token Service - Infrastructure Layer
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4
from jose import jwt, JWTError
from src.infrastructure.config.settings import settings

class TokenService:
    """Service for creating and validating JWT tokens."""

    @staticmethod
    def create_access_token(user_id: str, email: str) -> str:
        """Create JWT access token with unique JTI for blacklisting."""
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "email": email,
            "exp": expire,
            "type": "access",
            "jti": str(uuid4())  # Unique token ID for blacklisting
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create JWT refresh token with unique JTI."""
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": user_id,
            "exp": expire,
            "type": "refresh",
            "jti": str(uuid4())  # Unique token ID
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """Decode and validate JWT token."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None

    @staticmethod
    def get_token_expiry(token: str) -> Optional[datetime]:
        """Get expiry datetime from token."""
        payload = TokenService.decode_token(token)
        if payload and "exp" in payload:
            return datetime.fromtimestamp(payload["exp"])
        return None

    @staticmethod
    def get_token_jti(token: str) -> Optional[str]:
        """Get JTI (token ID) from token."""
        payload = TokenService.decode_token(token)
        return payload.get("jti") if payload else None