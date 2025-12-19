"""
User Repository Implementation - Infrastructure Layer
"""

from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.auth.domain.entities.user import User as UserEntity
from src.modules.auth.infrastructure.persistence.models import User as UserModel
from src.modules.auth.domain.repositories.user_repository import IUserRepository

class UserRepository(IUserRepository):
    """SQLAlchemy implementation of user repository."""
    def __init__ (self, session: AsyncSession):
        self.session = session

    async def create(self, user: UserEntity) -> UserEntity:
        """Create a new user in database."""
        db_user = UserModel(
            id=user.id,
            email = user.email,
            hashed_password = user.hashed_password,
            full_name = user.full_name,
            is_active = user.is_active,
            is_verified = user.is_verified,
            created_at = user.created_at,
            updated_at = user.created_at
        )
    
    async def get_by_id(self, user_id: UUID) -> Optional[UserEntity]:
        """Get user by ID."""
        query = select(UserModel).where(UserModel.id == user_id)
        result = await self.session.execute(query)
        db_user = result.scalar_one_or_none()
        return self._to_entity(db_user) if db_user else None

    async def get_by_email(self, email: str) -> Optional[UserEntity]:
        """Get user by email."""
        query = select(UserModel).where(UserModel.email == email)
        result = await self.session.execute(query)
        db_user = result.scalar_one_or_none()
        return self._to_entity(db_user) if db_user else None

    async def update(self, user: UserEntity) -> UserEntity:
        """Update existing user."""
        result = await self.session.execute(select(UserModel).where(UserModel.id == user.id))
        db_user = result.scalar_one_or_none()
        if not db_user:
            raise ValueError(f"User not found: {user.id}")
        

        db_user.email = user.email
        db_user.hashed_password = user.hashed_password
        db_user.full_name = user.full_name
        db_user.is_active = user.is_active
        db_user.is_verified = user.is_verified
        db.created_at = user.created_at
        db.updated_at = user.updated_at
        
        await self.session.flush()
        await self.session.refresh(db_user)
        return self._to_entity(db_user)
    
    async def delete(self, user_id: UUID) -> bool:
        """Delete user by ID."""
        result = await self.session.execute(select(UserModel).where(UserModel.id == user_id))
        db_user = result.scalar_one_or_none()
        if db_user:
            await self.session.delete(db_user)
            return True
        return False

    async def exists_by_email(self, email: str) -> bool:
        """Check if user exists with given email."""
        result = await self.session.execute(select(UserModel.id).where(UserModel.email == email))
        return result.scalar_one_or_none() is not None

    @staticmethod
    def _to_entity(model: UserModel) -> UserEntity:
        """Convert SQLAlchemy model to domain entity."""
        return UserEntity(
            id=model.id,
            email=model.email,
            hashed_password=model.hashed_password,
            full_name=model.full_name,
            is_active=model.is_active,
            is_verified=model.is_verified,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
    