"""
Unit tests for SparkSession domain entity
"""

import pytest
from datetime import datetime
from uuid import uuid4

from src.modules.spark.domain.entities.spark_session import SparkSession, SparkStep
from src.modules.spark.domain.value_objects.session_status import SessionStatus


class TestSparkSessionEntity:
    """Test cases for SparkSession entity."""

    def test_create_session(self):
        """Test creating a new SPARK session."""
        session_id = uuid4()
        user_id = uuid4()

        session = SparkSession(
            id=session_id,
            user_id=user_id,
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        assert session.id == session_id
        assert session.user_id == user_id
        assert session.status == SessionStatus.IN_PROGRESS
        assert session.current_step == 1
        assert session.situation_response is None
        assert not session.is_completed()

    def test_can_progress_to_step(self):
        """Test step progression validation."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        # Can progress to step 1 (current)
        assert session.can_progress_to_step(1)

        # Can progress to step 2 (next)
        assert session.can_progress_to_step(2)

        # Cannot skip to step 3
        assert not session.can_progress_to_step(3)

        # Cannot go backwards
        assert not session.can_progress_to_step(0)

        # Invalid step numbers
        assert not session.can_progress_to_step(0)
        assert not session.can_progress_to_step(6)

    def test_set_step_response_valid(self):
        """Test setting a valid step response."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        response_text = "I felt overwhelmed when my manager asked for the report."
        session.set_step_response(1, response_text)

        assert session.situation_response == response_text
        assert session.current_step == 1
        assert session.updated_at is not None

    def test_set_step_response_empty_fails(self):
        """Test that empty response raises error."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        with pytest.raises(ValueError, match="Response cannot be empty"):
            session.set_step_response(1, "")

        with pytest.raises(ValueError, match="Response cannot be empty"):
            session.set_step_response(1, "   ")

    def test_set_step_response_too_long_fails(self):
        """Test that response exceeding 5000 characters raises error."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        long_response = "a" * 5001

        with pytest.raises(ValueError, match="Response cannot exceed 5000 characters"):
            session.set_step_response(1, long_response)

    def test_set_step_response_max_length_allowed(self):
        """Test that exactly 5000 characters is allowed."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        max_length_response = "a" * 5000
        session.set_step_response(1, max_length_response)

        assert session.situation_response == max_length_response

    def test_set_step_response_skip_step_fails(self):
        """Test that skipping steps raises error."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        with pytest.raises(ValueError, match="Cannot set response for step 3"):
            session.set_step_response(3, "Trying to skip steps")

    def test_sequential_step_completion(self):
        """Test completing all 5 steps sequentially."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        # Step 1: Situation
        session.set_step_response(1, "I felt overwhelmed")
        assert session.current_step == 1

        # Step 2: Perception
        session.set_step_response(2, "I thought I would fail")
        assert session.current_step == 2

        # Step 3: Affect
        session.set_step_response(3, "I felt anxious")
        assert session.current_step == 3

        # Step 4: Response
        session.set_step_response(4, "I reminded myself to breathe")
        assert session.current_step == 4

        # Step 5: Key Result (should auto-complete)
        assert not session.is_completed()
        session.set_step_response(5, "I learned to pause before reacting")
        assert session.current_step == 5
        assert session.is_completed()
        assert session.status == SessionStatus.COMPLETED
        assert session.completed_at is not None

    def test_auto_completion_on_step_5(self):
        """Test that session auto-completes when step 5 is filled."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        # Complete all steps
        session.set_step_response(1, "Situation")
        session.set_step_response(2, "Perception")
        session.set_step_response(3, "Affect")
        session.set_step_response(4, "Response")

        # Verify not completed yet
        assert not session.is_completed()

        # Complete step 5 - should auto-complete
        session.set_step_response(5, "Key Result")

        assert session.is_completed()
        assert session.status == SessionStatus.COMPLETED

    def test_cannot_update_completed_session(self):
        """Test that completed sessions cannot be updated."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.COMPLETED,
            current_step=5,
            situation_response="Done",
            perception_response="Done",
            affect_response="Done",
            response_response="Done",
            key_result_response="Done",
            completed_at=datetime.utcnow()
        )

        with pytest.raises(ValueError, match="Cannot set response"):
            session.set_step_response(1, "Trying to modify")

    def test_complete_session_manually_success(self):
        """Test manually completing a session with all steps done."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=5,
            situation_response="Step 1",
            perception_response="Step 2",
            affect_response="Step 3",
            response_response="Step 4",
            key_result_response="Step 5"
        )

        session.complete_session()

        assert session.status == SessionStatus.COMPLETED
        assert session.completed_at is not None

    def test_complete_session_manually_fails_incomplete(self):
        """Test that manually completing incomplete session raises error."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=3,
            situation_response="Step 1",
            perception_response="Step 2",
            affect_response="Step 3"
        )

        with pytest.raises(ValueError, match="All 5 steps must be completed"):
            session.complete_session()

    def test_get_step_response(self):
        """Test retrieving step responses."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1,
            situation_response="My situation"
        )

        assert session.get_step_response(1) == "My situation"
        assert session.get_step_response(2) is None

    def test_get_step_response_invalid_step(self):
        """Test that invalid step number raises error."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        with pytest.raises(ValueError, match="Step must be between 1 and 5"):
            session.get_step_response(0)

        with pytest.raises(ValueError, match="Step must be between 1 and 5"):
            session.get_step_response(6)

    def test_whitespace_trimming(self):
        """Test that whitespace is trimmed from responses."""
        session = SparkSession(
            id=uuid4(),
            user_id=uuid4(),
            status=SessionStatus.IN_PROGRESS,
            current_step=1
        )

        session.set_step_response(1, "  Response with spaces  ")

        assert session.situation_response == "Response with spaces"
