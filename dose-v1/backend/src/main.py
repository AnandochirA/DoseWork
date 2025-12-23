"""
Main FastAPI Application
Entry point for DOSE backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.infrastructure.config.settings import settings
from src.api.routers import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "DOSE API", "version": settings.APP_VERSION, "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.APP_VERSION}