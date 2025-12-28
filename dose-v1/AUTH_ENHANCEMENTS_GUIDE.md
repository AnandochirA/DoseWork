# Auth Enhancements Implementation Guide

This guide covers all the authentication enhancements for the DOSE platform:

✅ **Implemented:**
1. Logout with token blacklisting
2. Account deletion
3. Forgot password / Reset password

🚧 **Ready to Implement:**
4. Google OAuth ("Continue with Google")
5. GitHub OAuth ("Continue with GitHub")
6. LinkedIn OAuth ("Continue with LinkedIn")

---

## 1. Database Migrations

### Create Migration Files

Run the following Alembic commands:

```bash
# Generate migration for new auth tables
alembic revision --autogenerate -m "add auth enhancements tables"
```

### Manual Migration (if needed)

Create `alembic/versions/xxx_auth_enhancements.py`:

```python
"""add auth enhancements tables

Revision ID: xxx
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    # Token Blacklist table
    op.create_table(
        'token_blacklist',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token_jti', sa.String(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('blacklisted_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_token_blacklist_token_jti', 'token_blacklist', ['token_jti'], unique=True)
    op.create_index('ix_token_blacklist_user_id', 'token_blacklist', ['user_id'])

    # Password Reset Tokens table
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('is_used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_password_reset_tokens_token', 'password_reset_tokens', ['token'], unique=True)
    op.create_index('ix_password_reset_tokens_user_id', 'password_reset_tokens', ['user_id'])

    # OAuth Accounts table
    op.create_table(
        'oauth_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('provider_user_id', sa.String(), nullable=False),
        sa.Column('provider_email', sa.String(), nullable=True),
        sa.Column('access_token', sa.String(), nullable=True),
        sa.Column('refresh_token', sa.String(), nullable=True),
        sa.Column('token_expires_at', sa.DateTime(), nullable=True),
        sa.Column('provider_data', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_oauth_accounts_user_id', 'oauth_accounts', ['user_id'])
    op.create_index('ix_oauth_accounts_provider_user_id', 'oauth_accounts', ['provider', 'provider_user_id'], unique=True)

def downgrade():
    op.drop_table('oauth_accounts')
    op.drop_table('password_reset_tokens')
    op.drop_table('token_blacklist')
```

---

## 2. Environment Variables

Add to `.env`:

```env
# Password Reset
PASSWORD_RESET_TOKEN_EXPIRE_HOURS=1
PASSWORD_RESET_URL=http://localhost:3000/reset-password  # Frontend URL

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/oauth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/v1/auth/oauth/github/callback

# OAuth - LinkedIn
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/v1/auth/oauth/linkedin/callback

# Frontend URLs
FRONTEND_URL=http://localhost:3000
OAUTH_SUCCESS_REDIRECT=http://localhost:3000/auth/success
OAUTH_ERROR_REDIRECT=http://localhost:3000/auth/error
```

---

## 3. API Endpoints Added

### Logout
```
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

### Delete Account
```
DELETE /api/v1/auth/account
Authorization: Bearer <token>
Body: { "password": "user-password" }
```

**Response:**
```json
{
  "message": "Account successfully deleted"
}
```

### Forgot Password (Request Reset)
```
POST /api/v1/auth/forgot-password
Body: { "email": "user@example.com" }
```

**Response:**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

### Reset Password
```
POST /api/v1/auth/reset-password
Body: {
  "token": "reset-token-from-email",
  "new_password": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password successfully reset. You can now login with your new password."
}
```

---

## 4. OAuth Flow

### Google OAuth Example

#### Step 1: Frontend initiates OAuth
```
GET /api/v1/auth/oauth/google/login
```

Response: Redirects to Google consent screen

#### Step 2: User authorizes, Google redirects back
```
GET /api/v1/auth/oauth/google/callback?code=<auth_code>&state=<state>
```

Response: Redirects to frontend with tokens:
```
http://localhost:3000/auth/success?access_token=xxx&refresh_token=yyy
```

#### Step 3: Frontend stores tokens and redirects to dashboard

---

## 5. Setting Up OAuth Providers

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8000/api/v1/auth/oauth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Configure:
   - Application name: DOSE Platform
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:8000/api/v1/auth/oauth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create new app
3. In "Auth" tab:
   - Add redirect URL: `http://localhost:8000/api/v1/auth/oauth/linkedin/callback`
   - Request scopes: `r_liteprofile`, `r_emailaddress`
4. Copy Client ID and Client Secret to `.env`

---

## 6. Testing the New Features

### Test Logout
```bash
# Login first
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# Logout
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Try to use token again (should fail)
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test Forgot Password
```bash
# Request password reset
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check logs for reset token (in production, this would be emailed)
# Then reset password
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<reset-token>","new_password":"NewPassword123!"}'
```

### Test OAuth (Manual)
1. Open browser to: `http://localhost:8000/api/v1/auth/oauth/google/login`
2. Authorize with Google
3. Should redirect to frontend with tokens

---

## 7. Frontend Integration Examples

### React Login/Signup Component

```tsx
// LoginPage.tsx
import { useState } from 'react';

const BACKEND_URL = 'http://localhost:8000/api/v1';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async () => {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    // Redirect to dashboard
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/oauth/google/login`;
  };

  const handleGitHubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/oauth/github/login`;
  };

  const handleLinkedInLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/oauth/linkedin/login`;
  };

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button onClick={handleEmailLogin}>Login</button>

      <div>Or continue with:</div>
      <button onClick={handleGoogleLogin}>
        <GoogleIcon /> Continue with Google
      </button>
      <button onClick={handleGitHubLogin}>
        <GitHubIcon /> Continue with GitHub
      </button>
      <button onClick={handleLinkedInLogin}>
        <LinkedInIcon /> Continue with LinkedIn
      </button>
    </div>
  );
}

// AuthSuccessPage.tsx (handles OAuth callback)
export function AuthSuccessPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      window.location.href = '/dashboard';
    }
  }, []);

  return <div>Logging you in...</div>;
}
```

### Logout Function
```tsx
const handleLogout = async () => {
  const token = localStorage.getItem('access_token');
  await fetch(`${BACKEND_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};
```

### Forgot Password Flow
```tsx
const handleForgotPassword = async (email: string) => {
  await fetch(`${BACKEND_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  alert('Check your email for a password reset link');
};

const handleResetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (response.ok) {
    alert('Password reset successful! Please login.');
    window.location.href = '/login';
  }
};
```

---

## 8. Security Considerations

### Token Blacklisting
- Tokens are stored in database when user logs out
- Middleware checks blacklist on each request
- Old tokens are automatically cleaned up after expiration

### Password Reset Tokens
- Tokens expire after 1 hour
- Tokens can only be used once
- Tokens are securely hashed before storage
- Always use HTTPS in production

### OAuth Security
- State parameter prevents CSRF attacks
- Tokens are never exposed in URLs (use POST for token exchange in production)
- Store OAuth tokens encrypted in production
- Regularly rotate client secrets

---

## 9. Production Checklist

Before deploying to production:

- [ ] Enable HTTPS for all endpoints
- [ ] Update OAuth redirect URIs to production URLs
- [ ] Encrypt OAuth access/refresh tokens in database
- [ ] Set up email service for password reset emails (SendGrid, AWS SES, etc.)
- [ ] Add rate limiting to auth endpoints
- [ ] Implement CAPTCHA for registration/login
- [ ] Set up monitoring for failed login attempts
- [ ] Add MFA (Multi-Factor Authentication) option
- [ ] Configure CORS to only allow your frontend domain
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)

---

## 10. Email Templates

### Password Reset Email (HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your DOSE Password</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <p>
            <a href="{{ reset_url }}" class="button">Reset Password</a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The DOSE Team</p>
    </div>
</body>
</html>
```

---

## 11. Monitoring & Analytics

Track these metrics:

- Login success/failure rates
- OAuth provider usage (Google vs GitHub vs LinkedIn)
- Password reset requests
- Account deletions
- Token blacklist size (for cleanup)

---

**Implementation Status:**
- ✅ Database models created
- ✅ Enhanced auth service (see `auth_service_enhanced.py`)
- ✅ New API endpoints (see `auth_endpoints_enhanced.py`)
- ✅ OAuth infrastructure ready
- 📝 Frontend integration examples provided
- 📝 Production deployment guide provided

**Next Steps:**
1. Run database migrations
2. Install new dependencies: `pip install -r requirements.txt`
3. Configure OAuth providers (Google, GitHub, LinkedIn)
4. Update environment variables
5. Test endpoints
6. Integrate with frontend
