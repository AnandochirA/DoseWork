"""
WAVE API Schemas - Request/Response validation
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

class CreateSessionRequest(BaseModel):
    """Request to create a new WAVE session."""
    # Empty - user_id comes from JWT token
    pass

class UpdateCheckinRequest(BaseModel):
    """Request to update check-in data (step 1)."""
    situation: str = Field(..., min_length=1, max_length=1000, description="What's going on?")
    emotion: str = Field(..., min_length=1, max_length=100, description="What are you feeling?")
    intensity: int = Field(..., ge=1, le=10, description="How intense is this feeling? (1-10)")
    
    @field_validator('situation', 'emotion')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v or v.strip() == '':
            raise ValueError('Field cannot be empty')
        return v.strip()

class UpdateAcceptanceRequest(BaseModel):
    """Request to update acceptance statement (step 2)."""
    acceptance_statement: str = Field(
        ..., 
        min_length=1, 
        max_length=500,
        description="Acceptance/validation statement"
    )
    
    @field_validator('acceptance_statement')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v or v.strip() == '':
            raise ValueError('Acceptance statement cannot be empty')
        return v.strip()

class UpdateActionRequest(BaseModel):
    """Request to update action choice (step 3)."""
    action_type: str = Field(..., min_length=1, description="Action type identifier")
    action_notes: Optional[str] = Field(None, max_length=2000, description="Optional notes (JSON string)")

class CompleteActionRequest(BaseModel):
    """Request to mark action as completed."""
    duration_seconds: int = Field(..., ge=1, le=3600, description="How long the action took (seconds)")

class SessionResponse(BaseModel):
    """Full WAVE session response."""
    id: UUID
    user_id: UUID
    status: str
    current_step: int
    
    # Step 1
    situation: Optional[str] = None
    emotion: Optional[str] = None
    intensity: Optional[int] = None
    
    # Step 2
    acceptance_statement: Optional[str] = None
    
    # Step 3
    action_type: Optional[str] = None
    action_completed: bool
    actual_duration: Optional[int] = None
    action_notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    # Computed
    progress_percentage: float
    
    model_config = {"from_attributes": True}

class SessionSummaryResponse(BaseModel):
    """Brief WAVE session summary."""
    id: UUID
    status: str
    current_step: int
    emotion: Optional[str] = None
    action_type: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    progress_percentage: float
    
    model_config = {"from_attributes": True}

class SessionListResponse(BaseModel):
    """List of WAVE sessions."""
    sessions: List[SessionSummaryResponse]
    total: int

