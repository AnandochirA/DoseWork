"""
JWT Token Service - Infrastructure Layer
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from src.infrastructure.config.settings import settings

class TokenService:
    """Service for creating and validating JWT tokens."""

    @staticmethod
    def create_access_token(user_id: str, email: str) -> str:
        """Create JWT access token."""
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "email": email,
            "exp": expire,  
            "type": "access"
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create JWT refresh token."""
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": user_id,
            "exp": expire, 
            "type": "refresh"
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