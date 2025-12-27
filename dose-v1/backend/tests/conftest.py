"""
Pytest configuration and fixtures
"""

import pytest
from uuid import uuid4


@pytest.fixture
def user_id():
    """Fixture providing a random user ID."""
    return uuid4()


@pytest.fixture
def session_id():
    """Fixture providing a random session ID."""
    return uuid4()


@pytest.fixture
def sample_spark_responses():
    """Fixture providing sample SPARK session responses."""
    return {
        "situation": "I felt overwhelmed when my manager asked for the weekly report this morning.",
        "perception": "I thought everyone would think I'm incompetent for forgetting.",
        "affect": "I felt anxious, ashamed, and panicked.",
        "response": "I took a deep breath and reminded myself that forgetting things is common with ADHD.",
        "key_result": "I learned that I need to set up weekly reminders for recurring tasks."
    }
