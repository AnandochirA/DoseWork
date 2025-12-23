"""
Pydantic schemas for request/response validation
"""

from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    """Request schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    """Response schema for user data."""
    id: UUID
    email: str
    full_name: Optional[str]
    is_active: bool
    is_verified: bool
    
    class Config:
        from_attributes = True

