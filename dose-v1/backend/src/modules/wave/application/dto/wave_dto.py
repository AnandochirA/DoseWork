"""
WAVE Module DTOs - Application Layer
Data transfer objects for WAVE sessions
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

@dataclass
class CreateWaveSessionDTO:
    """DTO for creating a new WAVE session."""
    user_id: UUID

@dataclass
class UpdateCheckinDTO:
    """DTO for updating check-in data (step 1)."""
    session_id: UUID
    situation: str
    emotion: str
    intensity: int  # 1-10

@dataclass
class UpdateAcceptanceDTO:
    """DTO for updating acceptance statement (step 2)."""
    session_id: UUID
    acceptance_statement: str

@dataclass
class UpdateActionDTO:
    """DTO for updating action choice (step 3)."""
    session_id: UUID
    action_type: str
    action_notes: Optional[str] = None

@dataclass
class CompleteActionDTO:
    """DTO for completing an action."""
    session_id: UUID
    duration_seconds: int

@dataclass
class WaveSessionDTO:
    """DTO for full WAVE session data."""
    id: UUID
    user_id: UUID
    status: str
    current_step: int
    
    # Step 1
    situation: Optional[str]
    emotion: Optional[str]
    intensity: Optional[int]
    
    # Step 2
    acceptance_statement: Optional[str]
    
    # Step 3
    action_type: Optional[str]
    action_completed: bool
    actual_duration: Optional[int]
    action_notes: Optional[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    
    # Computed
    progress_percentage: float

@dataclass
class WaveSessionSummaryDTO:
    """DTO for brief WAVE session summary."""
    id: UUID
    status: str
    current_step: int
    emotion: Optional[str]
    action_type: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    progress_percentage: float