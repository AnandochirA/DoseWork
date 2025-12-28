"""
User SQLAlchemy Model - Infrastructure Layer
Persistence implementation
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Boolean, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from src.infrastructure.database.session import Base

class User(Base):
    """SQLAlchemy User model mapped to database table."""
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    spark_sessions = relationship("SparkSession", back_populates="user")
    wave_sessions = relationship("WaveSession", back_populates="user") 
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"