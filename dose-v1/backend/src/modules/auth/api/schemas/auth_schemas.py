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


# ========== New Schemas for Enhanced Auth ==========

class DeleteAccountRequest(BaseModel):
    """Request schema for account deletion (requires password confirmation)."""
    password: str = Field(..., min_length=1, description="Current password for confirmation")


class ForgotPasswordRequest(BaseModel):
    """Request schema for password reset request."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request schema for password reset."""
    token: str = Field(..., min_length=1, description="Password reset token from email")
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


class PasswordResetResponse(BaseModel):
    """Response for password reset request (for testing only)."""
    message: str
    reset_token: Optional[str] = None  # Only in development

