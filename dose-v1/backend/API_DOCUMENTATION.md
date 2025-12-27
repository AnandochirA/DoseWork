# DOSE API Documentation

## Base URL

**Development:** `http://localhost:8000`
**Production:** `https://api.dose.app` (when deployed)

All endpoints are prefixed with `/api/v1`

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Authentication Flow

1. **Register** or **Login** to receive an access token
2. Include the token in the `Authorization` header for protected endpoints:
   ```
   Authorization: Bearer <your_access_token>
   ```

### Token Expiration

- **Access Token:** 30 minutes
- **Refresh Token:** 7 days

---

## API Endpoints

### Health Check

#### GET `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## Authentication Module (`/api/v1/auth`)

### Register New User

#### POST `/api/v1/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid email or password requirements not met
- `409 Conflict` - Email already registered

---

### Login

#### POST `/api/v1/auth/login`

Login and receive JWT tokens.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

### Get Current User

#### GET `/api/v1/auth/me`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired token

---

## SPARK Module (`/api/v1/spark`)

### SPARK Session Overview

SPARK is a 5-step cognitive restructuring framework:

1. **Situation** - Describe the triggering event
2. **Perception** - What negative thoughts emerged?
3. **Affect** - What emotions did you feel?
4. **Response** - Cognitive reframes & coping strategies
5. **Key Result** - Summary learning from the session

---

### Create SPARK Session

#### POST `/api/v1/spark/sessions`

Create a new SPARK cognitive restructuring session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{}
```
_(Empty object - session is created with default values)_

**Response (201 Created):**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174111",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "in_progress",
  "current_step": 1,
  "situation_response": null,
  "perception_response": null,
  "affect_response": null,
  "response_response": null,
  "key_result_response": null,
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z",
  "completed_at": null
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

---

### Get SPARK Session

#### GET `/api/v1/spark/sessions/{session_id}`

Retrieve a specific SPARK session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `session_id` (UUID) - The session ID

**Response (200 OK):**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174111",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "in_progress",
  "current_step": 2,
  "situation_response": "I felt overwhelmed when my manager asked for the report today",
  "perception_response": "I thought I would disappoint everyone and get fired",
  "affect_response": null,
  "response_response": null,
  "key_result_response": null,
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:15:00Z",
  "completed_at": null
}
```

**Errors:**
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Session belongs to another user
- `404 Not Found` - Session doesn't exist

---

### Update Step Response

#### PUT `/api/v1/spark/sessions/{session_id}/steps`

Update a step response in the SPARK session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `session_id` (UUID) - The session ID

**Request Body:**
```json
{
  "step_number": 1,
  "response": "I felt overwhelmed when my manager asked for the report today. I had forgotten it was due and panicked."
}
```

**Response (200 OK):**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174111",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "in_progress",
  "current_step": 1,
  "situation_response": "I felt overwhelmed when my manager asked for the report today. I had forgotten it was due and panicked.",
  "perception_response": null,
  "affect_response": null,
  "response_response": null,
  "key_result_response": null,
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:05:00Z",
  "completed_at": null
}
```

**Business Rules:**
- Steps must be completed sequentially (can't skip)
- Can't update steps in a completed session
- Response cannot be empty

**Errors:**
- `400 Bad Request` - Invalid step number or empty response
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Session belongs to another user
- `404 Not Found` - Session doesn't exist

---

### Complete SPARK Session

#### POST `/api/v1/spark/sessions/{session_id}/complete`

Mark a SPARK session as completed (automatically happens when step 5 is filled).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `session_id` (UUID) - The session ID

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174111",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "current_step": 5,
  "situation_response": "I felt overwhelmed when...",
  "perception_response": "I thought I would...",
  "affect_response": "I felt anxious and...",
  "response_response": "I reminded myself that...",
  "key_result_response": "I learned that forgetting things is human...",
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:30:00Z",
  "completed_at": "2025-01-15T11:30:00Z"
}
```

**Business Rules:**
- All 5 steps must be completed before marking session as complete

**Errors:**
- `400 Bad Request` - Not all steps completed
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Session belongs to another user
- `404 Not Found` - Session doesn't exist

---

### List User Sessions

#### GET `/api/v1/spark/sessions`

Get all SPARK sessions for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (integer, optional) - Maximum sessions to return (default: 50)

**Response (200 OK):**
```json
{
  "sessions": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174111",
      "status": "completed",
      "current_step": 5,
      "created_at": "2025-01-15T11:00:00Z",
      "completed_at": "2025-01-15T11:30:00Z"
    },
    {
      "id": "789e0123-e89b-12d3-a456-426614174222",
      "status": "in_progress",
      "current_step": 2,
      "created_at": "2025-01-14T09:00:00Z",
      "completed_at": null
    }
  ],
  "total": 2
}
```

**Errors:**
- `401 Unauthorized` - Invalid token

---

## WAVE Module (`/api/v1/wave`)

**Status:** Coming in V2

Emotional acceptance framework for ADHD users.

---

## POPCORN Module (`/api/v1/popcorn`)

**Status:** Coming in V2

Idea capture and task management system optimized for ADHD workflows.

---

## Error Response Format

All errors follow this structure:

```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## Rate Limiting

**Current:** No rate limiting
**V2:** 100 requests per minute per IP

---

## Pagination

For endpoints returning lists (currently only `/api/v1/spark/sessions`):

**Query Parameters:**
- `limit` - Number of items (default: 50, max: 100)
- `offset` - Skip N items (default: 0)

**V2 will include:**
- Cursor-based pagination for better performance
- Total count in responses

---

## Webhooks (V2)

Coming soon - Subscribe to events like:
- `session.completed`
- `user.registered`
- `analytics.milestone_reached`

---

## SDK & Client Libraries

**Coming Soon:**
- Python SDK
- JavaScript/TypeScript SDK
- React hooks library

---

## Support

- API Issues: Create a GitHub issue
- Questions: Contact support team

---

**Last Updated:** January 2025
**API Version:** v1.0.0
