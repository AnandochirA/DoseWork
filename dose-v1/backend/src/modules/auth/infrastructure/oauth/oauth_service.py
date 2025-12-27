"""
OAuth Service for Social Login (Google, GitHub, LinkedIn)
"""

from typing import Optional, Dict, Any
from authlib.integrations.starlette_client import OAuth
from src.infrastructure.config.settings import settings


# Initialize OAuth
oauth = OAuth()

# Register Google OAuth
oauth.register(
    name='google',
    client_id=getattr(settings, 'GOOGLE_CLIENT_ID', None),
    client_secret=getattr(settings, 'GOOGLE_CLIENT_SECRET', None),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Register GitHub OAuth
oauth.register(
    name='github',
    client_id=getattr(settings, 'GITHUB_CLIENT_ID', None),
    client_secret=getattr(settings, 'GITHUB_CLIENT_SECRET', None),
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    refresh_token_url=None,
    client_kwargs={'scope': 'user:email'}
)

# Register LinkedIn OAuth
oauth.register(
    name='linkedin',
    client_id=getattr(settings, 'LINKEDIN_CLIENT_ID', None),
    client_secret=getattr(settings, 'LINKEDIN_CLIENT_SECRET', None),
    authorize_url='https://www.linkedin.com/oauth/v2/authorization',
    authorize_params=None,
    access_token_url='https://www.linkedin.com/oauth/v2/accessToken',
    access_token_params=None,
    refresh_token_url=None,
    client_kwargs={'scope': 'r_liteprofile r_emailaddress'}
)


class OAuthService:
    """Service for handling OAuth authentication flows."""

    def __init__(self):
        self.oauth = oauth

    async def get_google_user_info(self, token: Dict[str, Any]) -> Dict[str, Any]:
        """Get user information from Google."""
        resp = await self.oauth.google.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            token=token
        )
        user_data = resp.json()
        return {
            'provider_user_id': user_data.get('sub'),
            'email': user_data.get('email'),
            'name': user_data.get('name'),
            'picture': user_data.get('picture'),
            'email_verified': user_data.get('email_verified', False)
        }

    async def get_github_user_info(self, token: Dict[str, Any]) -> Dict[str, Any]:
        """Get user information from GitHub."""
        # Get user profile
        resp = await self.oauth.github.get(
            'https://api.github.com/user',
            token=token
        )
        user_data = resp.json()

        # Get user emails
        emails_resp = await self.oauth.github.get(
            'https://api.github.com/user/emails',
            token=token
        )
        emails = emails_resp.json()

        # Find primary email
        primary_email = next(
            (email['email'] for email in emails if email.get('primary')),
            emails[0]['email'] if emails else None
        )

        return {
            'provider_user_id': str(user_data.get('id')),
            'email': primary_email,
            'name': user_data.get('name') or user_data.get('login'),
            'picture': user_data.get('avatar_url'),
            'email_verified': any(email.get('verified') for email in emails) if emails else False
        }

    async def get_linkedin_user_info(self, token: Dict[str, Any]) -> Dict[str, Any]:
        """Get user information from LinkedIn."""
        # Get profile
        profile_resp = await self.oauth.linkedin.get(
            'https://api.linkedin.com/v2/me',
            token=token
        )
        profile = profile_resp.json()

        # Get email
        email_resp = await self.oauth.linkedin.get(
            'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
            token=token
        )
        email_data = email_resp.json()

        email = None
        if 'elements' in email_data and len(email_data['elements']) > 0:
            email = email_data['elements'][0].get('handle~', {}).get('emailAddress')

        # Build name from localized fields
        first_name = profile.get('localizedFirstName', '')
        last_name = profile.get('localizedLastName', '')
        name = f"{first_name} {last_name}".strip()

        return {
            'provider_user_id': profile.get('id'),
            'email': email,
            'name': name or email,
            'picture': None,  # LinkedIn v2 API requires additional permissions for profile picture
            'email_verified': True  # LinkedIn emails are always verified
        }

    def get_provider_user_info_method(self, provider: str):
        """Get the appropriate user info method for provider."""
        methods = {
            'google': self.get_google_user_info,
            'github': self.get_github_user_info,
            'linkedin': self.get_linkedin_user_info
        }
        return methods.get(provider)
