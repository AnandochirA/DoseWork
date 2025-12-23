"""
API Router Configuration
Registers all module routers with prefixes and tags
"""

from fastapi import APIRouter
from src.modules.auth.api.endpoints import router as auth_router

api_router = APIRouter()

api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)