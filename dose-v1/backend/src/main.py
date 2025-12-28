"""
Main FastAPI Application
Entry point for DOSE backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from src.infrastructure.config.settings import settings
from src.infrastructure.logging import setup_logging, get_logger
from src.api.middleware.logging_middleware import LoggingMiddleware
from src.api.routers import api_router

# Initialize logging
setup_logging(log_level=settings.LOG_LEVEL)
logger = get_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Add session middleware (required for OAuth)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="dose_session",
    max_age=1800,  # 30 minutes
    same_site="lax",
    https_only=settings.ENVIRONMENT == "production"
)

# Add logging middleware (first to capture all requests)
app.add_middleware(LoggingMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Log application startup
logger.info(f"{settings.APP_NAME} v{settings.APP_VERSION} starting up...")

@app.get("/")
async def root():
    """Root endpoint."""
    logger.debug("Root endpoint accessed")
    return {"message": "DOSE API", "version": settings.APP_VERSION, "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.APP_VERSION}

@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} started successfully")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info(f"👋 {settings.APP_NAME} shutting down...")