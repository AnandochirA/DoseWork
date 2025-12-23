"""
SPARK Data Transfer Objects
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

@dataclass
class CreateSparkSessionDTO:
    """DTO for creating new SPARK session."""
    user_id: UUID

@dataclass
class UpdateStepDTO:
    """DTO for updating a step response."""
    session_id: UUID
    step_number: int
    response: str

@dataclass
class SparkSessionDTO:
    """DTO for complete SPARK session data."""
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

@dataclass
class SparkSessionSummaryDTO:
    """DTO for brief session info (for lists)."""
    id: UUID
    status: str
    current_step: int
    created_at: datetime
    completed_at: Optional[datetime]

