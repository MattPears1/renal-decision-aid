# NHS Renal Decision Aid - API Documentation

Base URL: `/api`

## Overview

This API powers the NHS Renal Decision Aid, providing session management and AI-assisted chat for kidney treatment information.

---

## Endpoints

### Health Check

```
GET /api/health
```

Returns server health status. Use this endpoint for monitoring and load balancer health checks.

**Response (200)**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## Session Management

Sessions track user progress through the decision aid. Sessions expire after 15 minutes of inactivity and are automatically extended on any activity.

### Create Session

```
POST /api/session
```

Creates a new user session.

**Rate Limit:** 10 requests per 15 minutes per IP

**Response (201)**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": 1705752000000,
  "message": "Session created successfully"
}
```

**Response (500)**
```json
{
  "error": "Session Creation Failed",
  "message": "Unable to create a new session"
}
```

---

### Get Session

```
GET /api/session/:id
```

Retrieves session data by ID. Also refreshes the session expiry.

**Parameters**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| id | string (UUID) | path | Session identifier |

**Response (200)**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": 1705752000000,
  "data": {
    "preferences": { "language": "en" },
    "questionnaireAnswers": [],
    "values": [],
    "chatHistory": [],
    "currentStep": "welcome"
  }
}
```

**Response (404)**
```json
{
  "error": "Session Not Found",
  "message": "The requested session does not exist or has expired"
}
```

---

### Update Session

```
PUT /api/session/:id
```

Updates session data. Only specified fields are updated.

**Parameters**

| Name | Type | Location | Description |
|------|------|----------|-------------|
| id | string (UUID) | path | Session identifier |

**Request Body** (all fields optional)
```json
{
  "preferences": { "language": "en", "textSize": "large" },
  "questionnaireAnswers": [
    { "questionId": "q1", "answer": "option_a", "timestamp": "2024-01-20T12:00:00Z" }
  ],
  "values": [
    { "statementId": "v1", "rating": 4 }
  ],
  "chatHistory": [],
  "currentStep": "questionnaire"
}
```

**Allowed Fields**
- `preferences` - User preferences (language, accessibility settings)
- `questionnaireAnswers` - Responses to questionnaire questions
- `values` - Value clarification ratings
- `chatHistory` - Chat conversation history
- `currentStep` - Current step in the user journey

**Response (200)**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": 1705752000000,
  "message": "Session updated successfully",
  "data": {
    "preferences": { "language": "en" },
    "questionnaireAnswers": [],
    "values": [],
    "chatHistory": [],
    "currentStep": "questionnaire"
  }
}
```

**Response (400)** - Invalid fields
```json
{
  "error": "Invalid Update",
  "message": "Invalid fields: invalidField1, invalidField2"
}
```

---

### Delete Session

```
DELETE /api/session/:id
```

Ends and deletes a session. Call this when the user completes the tool or explicitly ends their session.

**Response (200)**
```json
{
  "message": "Session ended successfully"
}
```

**Response (404)**
```json
{
  "error": "Session Not Found",
  "message": "The requested session does not exist or has already been deleted"
}
```

---

## Chat

AI-powered chat assistant for kidney treatment information and decision support.

### Send Message

```
POST /api/chat
```

Sends a message and receives an AI response. The chat assistant provides information about kidney disease treatment options (dialysis, transplant, conservative care) while encouraging users to discuss decisions with their healthcare team.

**Rate Limit:** 30 requests per minute per IP

**Request Body**
```json
{
  "message": "What is dialysis?",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's message (max 2000 characters) |
| sessionId | string | No | Session ID to persist chat history |

**Response (200)**
```json
{
  "response": "Dialysis is a treatment that helps filter waste products and excess fluid from your blood when your kidneys can no longer do this effectively...",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

**Response (400)** - Invalid request
```json
{
  "error": "Invalid Request",
  "message": "Message is required and must be a string"
}
```

```json
{
  "error": "Invalid Request",
  "message": "Message must be 2000 characters or less"
}
```

**Response (404)** - Invalid session
```json
{
  "error": "Session Not Found",
  "message": "The provided session does not exist or has expired"
}
```

**Response (429)** - Rate limited
```json
{
  "error": "Rate Limited",
  "message": "Too many requests. Please wait a moment and try again."
}
```

---

## Common Headers

### Request Headers

| Header | Description |
|--------|-------------|
| Content-Type | `application/json` for POST/PUT requests |
| X-Session-Id | Optional session identifier for tracking |
| X-Request-Id | Optional request tracking ID for debugging |

### CORS Configuration

The API supports CORS with the following settings:
- **Allowed origins:** Configured via `CORS_ORIGIN` environment variable
- **Allowed methods:** GET, POST, PUT, DELETE, OPTIONS
- **Allowed headers:** Content-Type, Authorization, X-Session-Id, X-Request-Id
- **Credentials:** Enabled

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input or validation error |
| 404 | Not Found - Resource does not exist or has expired |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

All error responses follow a consistent format:
```json
{
  "error": "Error Type",
  "message": "Human-readable error description"
}
```

---

## Rate Limiting

The API implements rate limiting to ensure fair usage and prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global (all endpoints) | 100 requests | 15 minutes |
| POST /api/session | 10 requests | 15 minutes |
| GET/PUT/DELETE /api/session/:id | 60 requests | 1 minute |
| POST /api/chat | 30 requests | 1 minute |

**Rate Limit Headers** (included in responses when approaching limits):
- `X-RateLimit-Limit` - Maximum requests allowed in window
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Unix timestamp when the limit resets

---

## Privacy and Security

- **PII Filtering:** The chat endpoint filters personally identifiable information
- **No Persistent Storage:** Sessions are stored in memory by default (configurable)
- **Secure Headers:** Helmet.js security headers are enabled
- **Input Validation:** All inputs are validated and size-limited
- **HTTPS:** All production traffic should use HTTPS
