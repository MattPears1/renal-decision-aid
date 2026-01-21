# NHS Renal Decision Aid - API Documentation

**Version:** 2.5.0
**Last Updated:** 21 January 2026
**Base URL:** `/api`

---

## Overview

This API powers the NHS Renal Decision Aid, providing session management, AI-assisted chat, and voice services for kidney treatment information.

### OpenAI Models Used

| Service | Model | Purpose |
|---------|-------|---------|
| Chat | `gpt-4o` | Multilingual conversational AI |
| Speech-to-Text | `gpt-4o-transcribe` | Voice input transcription |
| Text-to-Speech | `gpt-4o-mini-tts` | Voice output synthesis |

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
  "timestamp": "2026-01-21T12:00:00.000Z",
  "version": "2.5.0",
  "environment": "production"
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
    { "questionId": "q1", "answer": "option_a", "timestamp": "2026-01-21T12:00:00Z" }
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
  "timestamp": "2026-01-21T12:00:00.000Z"
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

### Chat AI Capabilities

The chat assistant is configured to:
- Support 10 languages: English, Hindi, Punjabi, Bengali, Urdu, Gujarati, Tamil, Chinese (Simplified), Polish, Arabic
- Provide information about kidney disease and treatment options
- Explain transplant processes, dialysis types, and conservative care
- Be culturally sensitive and inclusive
- Encourage consultation with healthcare teams
- Filter and protect personally identifiable information (PII)

---

## Speech-to-Text (Transcribe)

Transcribe audio to text using OpenAI's gpt-4o-transcribe model.

### Transcribe Audio

```
POST /api/transcribe
```

Transcribes uploaded audio file to text.

**Content-Type:** `multipart/form-data`

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| audio | file | Yes | Audio file (webm, mp3, wav, m4a, ogg, flac, mp4) |
| language | string | No | Language hint (en, hi, pa, bn, ur, gu, ta) |

**Supported Audio Formats:**
- audio/webm
- audio/mp3
- audio/mpeg
- audio/wav
- audio/mp4
- audio/m4a
- audio/ogg
- audio/flac

**Max File Size:** 25MB

**Response (200)**
```json
{
  "text": "What are the options for dialysis?",
  "language": "en",
  "duration": 3.5,
  "timestamp": "2026-01-21T12:00:00.000Z"
}
```

**Response (400)** - Missing audio
```json
{
  "error": "Bad Request",
  "message": "Audio file is required"
}
```

**Response (400)** - File too large
```json
{
  "error": "File Too Large",
  "message": "Audio file must be less than 25MB"
}
```

**Response (503)** - Service not configured
```json
{
  "error": "Service Unavailable",
  "message": "Speech-to-text service is not configured"
}
```

---

## Text-to-Speech (Synthesize)

Convert text to speech using OpenAI's gpt-4o-mini-tts model.

### Synthesize Speech

```
POST /api/synthesize
```

Converts text to audio. Returns audio/mpeg data.

**Request Body**
```json
{
  "text": "Dialysis is a treatment that filters your blood.",
  "language": "en",
  "voice": "nova",
  "model": "gpt-4o-mini-tts",
  "speed": 1.0
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to synthesize (max 4096 characters) |
| language | string | No | Language code for voice selection |
| voice | string | No | Voice ID (alloy, nova, shimmer, echo, fable, onyx) |
| model | string | No | TTS model (gpt-4o-mini-tts, tts-1, tts-1-hd) |
| speed | number | No | Playback speed (0.25 to 4.0, default 1.0) |

**Response Headers**
```
Content-Type: audio/mpeg
Content-Length: [size]
X-Voice-Used: nova
X-Model-Used: gpt-4o-mini-tts
```

**Response Body:** Binary audio data (MP3)

**Response (400)** - Missing text
```json
{
  "error": "Bad Request",
  "message": "Text is required and must be a string"
}
```

**Response (400)** - Text too long
```json
{
  "error": "Bad Request",
  "message": "Text must be 4096 characters or less"
}
```

**Response (503)** - Service not configured
```json
{
  "error": "Service Unavailable",
  "message": "Text-to-speech service is not configured"
}
```

---

### List Available Voices

```
GET /api/synthesize/voices
```

Returns list of available TTS voices and models.

**Response (200)**
```json
{
  "voices": [
    { "id": "alloy", "name": "Alloy", "description": "Neutral, versatile - best for multilingual" },
    { "id": "nova", "name": "Nova", "description": "Warm, friendly - great for English" },
    { "id": "shimmer", "name": "Shimmer", "description": "Clear, expressive" },
    { "id": "echo", "name": "Echo", "description": "Balanced, natural" },
    { "id": "fable", "name": "Fable", "description": "Engaging, storytelling" },
    { "id": "onyx", "name": "Onyx", "description": "Deep, authoritative" }
  ],
  "languageDefaults": {
    "en": "nova",
    "hi": "alloy",
    "pa": "alloy",
    "bn": "alloy",
    "ur": "alloy",
    "gu": "alloy",
    "ta": "alloy"
  },
  "models": [
    { "id": "gpt-4o-mini-tts", "name": "GPT-4o Mini TTS", "description": "Latest, best quality" },
    { "id": "tts-1", "name": "Standard", "description": "Fast, lower latency" },
    { "id": "tts-1-hd", "name": "HD", "description": "Higher quality audio" }
  ]
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
- **Max Age:** 24 hours

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
| 503 | Service Unavailable - External service not configured |

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
- **Session Storage:** SQLite in production, memory in development (no persistent user data)
- **Session Expiry:** 15-minute automatic expiration
- **Secure Headers:** Helmet.js security headers are enabled
- **Input Validation:** All inputs are validated and size-limited
- **HTTPS:** All production traffic should use HTTPS

---

## Examples

### cURL Examples

**Create a session:**
```bash
curl -X POST http://localhost:5006/api/session \
  -H "Content-Type: application/json"
```

**Send a chat message:**
```bash
curl -X POST http://localhost:5006/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the difference between hemodialysis and peritoneal dialysis?",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Transcribe audio:**
```bash
curl -X POST http://localhost:5006/api/transcribe \
  -F "audio=@recording.webm" \
  -F "language=en"
```

**Synthesize speech:**
```bash
curl -X POST http://localhost:5006/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how can I help you today?",
    "voice": "nova"
  }' \
  --output speech.mp3
```

---

*Last Updated: 21 January 2026*
