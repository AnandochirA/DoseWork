"""
Enhanced Auth API Endpoints with Logout, Password Reset, and OAuth
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from src.infrastructure.database.session import get_db
from src.infrastructure.logging import get_logger
from src.modules.auth.api.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    DeleteAccountRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
    PasswordResetResponse
)
from src.modules.auth.application.dto.auth_dto import RegisterUserDTO, LoginDTO
from src.modules.auth.application.services.auth_service_enhanced import AuthServiceEnhanced
from src.modules.auth.infrastructure.repositories.user_repository import UserRepository
from src.modules.auth.infrastructure.repositories.token_blacklist_repository import TokenBlacklistRepository
from src.modules.auth.infrastructure.repositories.password_reset_repository import PasswordResetRepository
from src.modules.auth.infrastructure.repositories.oauth_repository import OAuthAccountRepository
from src.modules.auth.infrastructure.oauth.oauth_service import OAuthService, oauth
from src.infrastructure.config.settings import settings

router = APIRouter()
security = HTTPBearer()
logger = get_logger(__name__)


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthServiceEnhanced:
    """Dependency to get enhanced auth service."""
    user_repository = UserRepository(db)
    token_blacklist_repo = TokenBlacklistRepository(db)
    password_reset_repo = PasswordResetRepository(db)
    oauth_repo = OAuthAccountRepository(db)
    return AuthServiceEnhanced(user_repository, token_blacklist_repo, password_reset_repo, oauth_repo)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
) -> UUID:
    """Dependency to get current authenticated user ID."""
    user = await auth_service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user.id


# ========== Original Endpoints ==========

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
):
    """Register a new user."""
    try:
        dto = RegisterUserDTO(email=request.email, password=request.password, full_name=request.full_name)
        user = await auth_service.register(dto)
        logger.info(f"User registered: {user.email}")
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
):
    """Login and get access tokens."""
    try:
        dto = LoginDTO(email=request.email, password=request.password)
        tokens = await auth_service.login(dto)
        logger.info(f"User logged in: {request.email}")
        return tokens
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
):
    """Get current authenticated user."""
    user = await auth_service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user


# ========== New Endpoints: Logout ==========

@router.post("/logout", response_model=MessageResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
):
    """
    Logout user by blacklisting their token.
    The token will no longer be valid for authentication.
    """
    try:
        await auth_service.logout(credentials.credentials)
        logger.info("User logged out successfully")
        return MessageResponse(message="Successfully logged out")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ========== New Endpoints: Account Deletion ==========

@router.delete("/account", response_model=MessageResponse)
async def delete_account(
    request: DeleteAccountRequest,
    user_id: UUID = Depends(get_current_user_id),
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
):
    """
    Delete user account permanently.
    Requires password confirmation for security.
    """
    try:
        await auth_service.delete_account(user_id, request.password)
        logger.info(f"User account deleted: {user_id}")
        return MessageResponse(message="Account successfully deleted")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ========== New Endpoints: Password Reset ==========

@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
):
    """
    Request password reset.
    Sends reset link to user's email (or returns token in development).
    """
    reset_token = await auth_service.request_password_reset(request.email)

    # In production, send email and don't return token
    # For development/testing, return token
    if settings.ENVIRONMENT == "development" and reset_token:
        logger.info(f"Password reset requested for: {request.email}")
        return PasswordResetResponse(
            message="Password reset link has been sent to your email",
            reset_token=reset_token
        )

    return PasswordResetResponse(
        message="If an account exists with this email, a password reset link has been sent"
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: ResetPasswordRequest,
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
):
    """
    Reset password using reset token.
    Token is provided via email link.
    """
    try:
        await auth_service.reset_password(request.token, request.new_password)
        logger.info("Password reset successful")
        return MessageResponse(
            message="Password successfully reset. You can now login with your new password."
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ========== New Endpoints: OAuth ==========

@router.get("/oauth/{provider}/login")
async def oauth_login(provider: str, request: Request):
    """
    Initiate OAuth login flow.
    Redirects to provider's authorization page.

    Supported providers: google, github, linkedin
    """
    if provider not in ['google', 'github', 'linkedin']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: {provider}"
        )

    # Get OAuth client
    client = getattr(oauth, provider, None)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth provider {provider} not configured"
        )

    # Build redirect URI
    redirect_uri = request.url_for('oauth_callback', provider=provider)

    logger.info(f"Initiating {provider} OAuth login")
    return await client.authorize_redirect(request, redirect_uri)


@router.get("/oauth/{provider}/callback", name="oauth_callback")
async def oauth_callback(
    provider: str,
    request: Request,
    auth_service: AuthServiceEnhanced = Depends(get_auth_service)
):
    """
    OAuth callback endpoint.
    Handles the redirect from OAuth provider after user authorization.
    """
    if provider not in ['google', 'github', 'linkedin']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: {provider}"
        )

    try:
        # Get OAuth client
        client = getattr(oauth, provider, None)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OAuth provider {provider} not configured"
            )

        # Get access token from provider
        token = await client.authorize_access_token(request)

        # Get user info from provider
        oauth_service = OAuthService()
        user_info_method = oauth_service.get_provider_user_info_method(provider)

        if not user_info_method:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get user info"
            )

        user_info = await user_info_method(token)

        # Login or register user
        tokens = await auth_service.oauth_login(
            provider=provider,
            provider_user_id=user_info['provider_user_id'],
            email=user_info['email'],
            name=user_info.get('name'),
            provider_data=user_info
        )

        logger.info(f"OAuth login successful via {provider}: {user_info['email']}")

        # Redirect to frontend with tokens
        frontend_url = getattr(settings, 'OAUTH_SUCCESS_REDIRECT', 'http://localhost:3000/auth/success')
        redirect_url = f"{frontend_url}?access_token={tokens.access_token}&refresh_token={tokens.refresh_token}"

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        logger.error(f"OAuth callback error for {provider}: {str(e)}")
        error_url = getattr(settings, 'OAUTH_ERROR_REDIRECT', 'http://localhost:3000/auth/error')
        return RedirectResponse(url=f"{error_url}?error={str(e)}")
