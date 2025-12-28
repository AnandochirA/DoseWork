from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Name
    APP_NAME: str = "DOSE" 

    # Version
    APP_VERSION: str = "1.0.0"

    # Debug Mode
    DEBUG: bool = False

    # Environment
    ENVIRONMENT: str = "production"

    # Server host 
    HOST: str = "0.0.0.0"

    # Server port
    PORT: int = 8000

    # Database URL
    DATABASE_URL: str

    # Connection Pool
    DATABASE_POOL_SIZE: int = 5

    # Max overflow
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis Connection
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str

    # JWT Algorithm
    ALGORITHM: str = "HS256"

    # Token expiry
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Refresh token expiry
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS ORIGINS
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Logging level
    LOG_LEVEL: str = "INFO"

    # OAuth - Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/oauth/google/callback"

    # OAuth - GitHub
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/oauth/github/callback"

    # OAuth - LinkedIn
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    LINKEDIN_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/oauth/linkedin/callback"

    # Frontend URLs
    FRONTEND_URL: str = "http://localhost:3000"
    OAUTH_SUCCESS_REDIRECT: str = "http://localhost:3000/auth/success"
    OAUTH_ERROR_REDIRECT: str = "http://localhost:3000/auth/error"

    # Password Reset
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 1
    PASSWORD_RESET_URL: str = "http://localhost:3000/reset-password"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()


