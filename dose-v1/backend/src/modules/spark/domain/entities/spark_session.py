"""
SparkSession Entity - Domain Layer
Aggregate root for SPARK cognitive restructuring sessions
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import IntEnum
from typing import Optional
from uuid import UUID
from src.modules.spark.domain.value_objects.session_status import SessionStatus
class SparkStep(IntEnum):
    SITUATION = 1
    PERCEPTION = 2
    AFFECT = 3
    RESPONSE = 4
    KEY_RESULT = 5

@dataclass
class SparkSession:
    """
    SparkSession aggregate root.
    Represents a complete cognitive restructuring session.
    """
    id: UUID
    user_id: UUID
    status: SessionStatus = SessionStatus.IN_PROGRESS
    current_step: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    situation_response: Optional[str] = None
    perception_response: Optional[str] = None
    affect_response: Optional[str] = None
    response_response: Optional[str] = None
    key_result_response: Optional[str] = None

    _STEP_FIELDS = {
        SparkStep.SITUATION: "situation_response",
        SparkStep.PERCEPTION: "perception_response",
        SparkStep.AFFECT: "affect_response",
        SparkStep.RESPONSE: "response_response",
        SparkStep.KEY_RESULT: "key_result_response",
    }

    def can_progress_to_step(self, step_number: int) -> bool:
        if not (1 <= step_number <= 5):
            return False
        if self.is_completed():
            return False
        if step_number < self.current_step:
            return False  
        if step_number > self.current_step + 1:
            return False  
        return True

    def set_step_response(self, step_number: int, response: str) -> None:
        if not self.can_progress_to_step(step_number):
            raise ValueError(f"Cannot set response for step {step_number} at this time")

        response = response.strip()
        if not response:
            raise ValueError("Response cannot be empty")

        step = SparkStep(step_number)
        field_name = self._STEP_FIELDS[step]
        setattr(self, field_name, response)

        # Update current_step and timestamps
        self.current_step = max(self.current_step, step_number)
        self.updated_at = datetime.utcnow()

        # If final step, complete the session
        if step_number == SparkStep.KEY_RESULT:
            self.complete_session()

        
    def complete_session(self) -> None:
        if all(getattr(self, field) is not None for field in self._STEP_FIELDS.values()):
            self.status = "completed"
            self.completed_at = datetime.utcnow()
            self.updated_at = datetime.utcnow()

    def is_completed(self) -> bool:
        return self.status.is_completed

    def get_step_response(self, step_number: int) -> Optional[str]:
        if not (1 <= step_number <= 5):
            raise ValueError("Step must be between 1 and 5")
        field_name = self._STEP_FIELDS[SparkStep(step_number)]
        return getattr(self, field_name)
    

    







