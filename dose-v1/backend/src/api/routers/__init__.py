"""
API Router Configuration
Registers all module routers with prefixes and tags
"""

from fastapi import APIRouter
# Use enhanced auth endpoints with OAuth, logout, password reset
from src.modules.auth.api.endpoints.auth_endpoints_enhanced import router as auth_router
from src.modules.spark.api.endpoints import router as spark_router

api_router = APIRouter()

api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    spark_router,
    prefix="/spark",
    tags=["SPARK Module"]
)