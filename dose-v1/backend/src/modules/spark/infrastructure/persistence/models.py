"""
SparkSession SQLAlchemy Model - Infrastructure Layer
Database persistence for SPARK sessions
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Boolean, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from src.infrastructure.database.session import Base

class SparkSession(Base):
    """SQLAlchemy SparkSession model."""
    __tablename__ = "spark_sessions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="in_progress", index=True)
    current_step: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    situation_response: Mapped[str] = mapped_column(Text, nullable=True)
    perception_response: Mapped[str] = mapped_column(Text, nullable=True)
    affect_response: Mapped[str] = mapped_column(Text, nullable=True)
    response_response: Mapped[str] = mapped_column(Text, nullable=True)
    key_result_response: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relationship to User model
    user = relationship("User", back_populates="spark_sessions")

    def __repr__(self) -> str:
        return f"<SparkSession(id={self.id}, user_id={self.user_id}, status={self.status})>"
        