"""
WaveSession SQLAlchemy Model - Infrastructure Layer
Database persistence for WAVE sessions
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Boolean, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from src.infrastructure.database.session import Base

class WaveSession(Base):
    """SQLAlchemy WaveSession model."""
    __tablename__ = "wave_sessions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="in_progress", index=True)
    current_step: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    situation: Mapped[str] = mapped_column(Text, nullable=True)
    emotion: Mapped[str] = mapped_column(String(100), nullable=True)
    intensity: Mapped[int] = mapped_column(Integer, nullable=True)

    acceptance_statement: Mapped[str] = mapped_column(Text, nullable=True)

    action_type: Mapped[str] = mapped_column(String(50), nullable=True)
    action_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    actual_duration: Mapped[int] = mapped_column(Integer, nullable=True)  # seconds
    action_notes: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relationship to User model
    user = relationship("User", back_populates="wave_sessions")

    def __repr__(self) -> str:
        return f"<WaveSession(id={self.id}, user_id={self.user_id}, status={self.status})>"
