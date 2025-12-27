"""
WaveSession Entity - Domain Layer
Aggregate root for WAVE emotional grounding sessions
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

@dataclass
class WaveSession:
    """
    WaveSession aggregate root.
    Represents a complete emotional grounding session with 4 steps.
    """
    id: UUID
    user_id: UUID
    status: str
    current_step: int

    situation: Optional[str]
    emotion: Optional[str]
    intensity: Optional[int]

    acceptance_statement: Optional[str]

    action_type: Optional[str]
    action_completed: bool
    actual_duration: Optional[int]
    action_notes: Optional[str]

    created_at: datetime
    updated_at: datetime
    completed_at: datetime

    def can_progress_to_step(self, step_number: int) -> bool:
        """Check if session can progress to given step."""
        # Validate step range
        if step_number < 1 or step_number > 4:
            return False
        
        # Can't skip steps
        if step_number > self.current_step + 1:
            return False
        
        # Can't progress if completed
        if self.status == "completed":
            return False
        
        return True

    def set_checkin_data(self, situation: str, emotion: str, intensity: int) -> None:
        """Set check-in data (step 1)."""
        # Validate intensity
        if intensity < 1 or intensity > 10:
            raise ValueError("Intensity must be between 1 and 10")
        
        # Set data
        self.situation = situation
        self.emotion = emotion
        self.intensity = intensity
        self.current_step = 2
        self.updated_at = datetime.utcnow()

    
    def set_acceptance(self, statement: str) -> None:
        """Set acceptance statement (step 2)."""
        self.acceptance_statement = statement
        self.current_step = 3
        self.updated_at = datetime.utcnow()

    def set_action(self, action_type: str, action_notes: Optional[str] = None) -> None:
        """Set action type (step 3)."""
        self.action_type = action_type
        self.action_notes = action_notes
        self.action_completed = False
        self.updated_at = datetime.utcnow()

    def complete_action(self, duration_seconds: int) -> None:
        """Mark action as completed."""
        if not self.action_type:
            raise ValueError("No action has been set")
        
        self.action_completed = True
        self.actual_duration = duration_seconds
        self.current_step = 4
        self.updated_at = datetime.utcnow()

    def complete_session(self) -> None:
        """Mark session as completed."""
        # Validate all steps completed
        if not all([
            self.situation,
            self.emotion,
            self.intensity,
            self.acceptance_statement,
            self.action_type,
            self.action_completed
        ]):
            raise ValueError("All steps must be completed before finishing the session")
        
        self.status = "completed"
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def is_completed(self) -> bool:
        """Check if session is completed."""
        return self.status == "completed"

    def get_progress_percentage(self) -> float:
        """Get session completion progress as percentage."""
        if self.is_completed():
            return 100.0
        
        # Each step is 25%
        return (self.current_step - 1) * 25.0