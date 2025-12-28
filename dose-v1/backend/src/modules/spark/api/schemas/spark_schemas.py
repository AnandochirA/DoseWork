"""
Pydantic schemas for SPARK API request/response validation
"""

from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class CreateSessionRequest(BaseModel):
    """Request schema for creating new SPARK session."""
    pass  # No body needed - user_id comes from auth token!

class UpdateStepRequest(BaseModel):
    """Request schema for updating step response."""
    step_number: int = Field(..., ge=1, le=5, description="Step number (1-5)")
    response: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's response to the step (max 5000 characters)"
    )

class SessionResponse(BaseModel):
    """Response schema for complete session data."""
    id: UUID
    user_id: UUID
    status: str
    current_step: int
    situation_response: Optional[str]
    perception_response: Optional[str]
    affect_response: Optional[str]
    response_response: Optional[str]
    key_result_response: Optional[str]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class SessionSummaryResponse(BaseModel):
    """Response schema for brief session info."""
    id: UUID
    status: str
    current_step: int
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class SessionListResponse(BaseModel):
    """Response schema for list of sessions."""
    sessions: List[SessionSummaryResponse]
    total: int
    offset: int = Field(default=0, description="Number of items skipped")
    limit: int = Field(default=50, description="Number of items returned")