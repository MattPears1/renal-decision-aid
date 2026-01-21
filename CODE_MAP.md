# NHS Renal Transplant Decision Aid - Code Map

**Project:** NHS Renal Transplant Decision Aid
**Version:** 2.5.0
**Last Updated:** 21 January 2026
**Tech Stack:** React 18, TypeScript 5, Vite 5, Express 4, OpenAI APIs

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Key Features](#key-features)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [API Reference](#api-reference)
8. [Configuration](#configuration)

---

## Project Overview

The NHS Renal Transplant Decision Aid is a multilingual patient decision support tool designed for kidney disease patients in the UK NHS. It addresses the needs of diverse communities, particularly South Asian populations who face 3-5x higher rates of kidney disease but have limited access to translated educational resources.

### Core Capabilities

- **Multilingual Support**: 10 languages including English, Hindi, Punjabi, Bengali, Urdu, Gujarati, Tamil, Chinese (Simplified), Polish, and Arabic
- **AI-Powered Chat**: GPT-4o integration for conversational Q&A about kidney treatments
- **Voice Interface**: Speech-to-text (gpt-4o-transcribe) and text-to-speech (gpt-4o-mini-tts) for accessibility
- **3D Visualization**: Interactive kidney model using React Three Fiber
- **Treatment Comparison**: Side-by-side comparison of dialysis, transplant, and conservative care options
- **Privacy-First**: Session-only data with 15-minute expiry, aggressive PII filtering

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS 3 |
| Backend | Node.js 20, Express 4, TypeScript 5 |
| Database | SQLite (better-sqlite3) for session persistence |
| i18n | i18next with HTTP backend, ICU MessageFormat |
| 3D | React Three Fiber, @react-three/drei |
| AI | OpenAI API (gpt-4o chat, gpt-4o-transcribe STT, gpt-4o-mini-tts TTS) |
| Hosting | Heroku |
| Testing | Vitest, React Testing Library, axe-core |

---

## Directory Structure

```
Renal_Transplant_Decision_Tool/
├── apps/
│   ├── frontend/                    # React SPA application
│   │   ├── src/
│   │   │   ├── components/          # Reusable UI components
│   │   │   │   ├── ui/              # Base UI primitives (Button, Card, Skeleton)
│   │   │   │   ├── AccessibilityModal.tsx
│   │   │   │   ├── BackToTop.tsx
│   │   │   │   ├── LanguageSelector.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── LearningProgress.tsx
│   │   │   │   ├── NHSFooter.tsx
│   │   │   │   ├── NHSHeader.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── ScenarioExplorer.tsx
│   │   │   │   ├── SessionTimer.tsx
│   │   │   │   ├── StickyProgressIndicator.tsx
│   │   │   │   ├── TreatmentTimeline.tsx
│   │   │   │   └── VoiceControls.tsx
│   │   │   ├── config/              # App configuration
│   │   │   │   └── i18n.ts          # i18next setup (10 languages)
│   │   │   ├── context/             # React context providers
│   │   │   │   └── SessionContext.tsx
│   │   │   ├── data/                # Static data files
│   │   │   │   ├── questionnaire.ts
│   │   │   │   └── treatments.ts
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   │   ├── useLanguage.ts
│   │   │   │   ├── useTextToSpeech.ts
│   │   │   │   └── useVoiceRecording.ts
│   │   │   ├── locales/             # i18n translation files
│   │   │   │   ├── ar/common.json   # Arabic
│   │   │   │   ├── bn/common.json   # Bengali
│   │   │   │   ├── en/common.json   # English
│   │   │   │   ├── gu/common.json   # Gujarati
│   │   │   │   ├── hi/common.json   # Hindi
│   │   │   │   ├── pa/common.json   # Punjabi
│   │   │   │   ├── pl/common.json   # Polish
│   │   │   │   ├── ta/common.json   # Tamil
│   │   │   │   ├── ur/common.json   # Urdu (RTL)
│   │   │   │   └── zh/common.json   # Chinese (Simplified)
│   │   │   ├── pages/               # Route page components
│   │   │   │   ├── ChatPage.tsx
│   │   │   │   ├── ComparePage.tsx
│   │   │   │   ├── HubPage.tsx
│   │   │   │   ├── JourneyStagePage.tsx
│   │   │   │   ├── LandingPage.tsx
│   │   │   │   ├── LanguageSelectionPage.tsx
│   │   │   │   ├── ModelViewerPage.tsx
│   │   │   │   ├── PrivacyDisclaimerPage.tsx
│   │   │   │   ├── QuestionnairePage.tsx
│   │   │   │   ├── SummaryPage.tsx
│   │   │   │   ├── TreatmentDetailPage.tsx
│   │   │   │   ├── TreatmentOverviewPage.tsx
│   │   │   │   └── ValuesPage.tsx
│   │   │   ├── services/            # API client services
│   │   │   │   └── api.ts
│   │   │   ├── test/                # Test setup and utilities
│   │   │   │   ├── accessibility.test.tsx
│   │   │   │   └── setup.ts
│   │   │   ├── App.tsx              # Root application component
│   │   │   └── main.tsx             # Application entry point
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── backend/                     # Express API server
│       └── src/
│           ├── db/                  # Database layer
│           │   └── database.ts      # SQLite setup (better-sqlite3)
│           ├── middleware/          # Express middleware
│           │   ├── piiFilter.ts     # PII detection and redaction
│           │   └── rateLimiter.ts   # Rate limiting middleware
│           ├── routes/              # API route handlers
│           │   ├── chat.ts          # POST /api/chat
│           │   ├── index.ts         # Route aggregator
│           │   ├── session.ts       # Session CRUD endpoints
│           │   ├── session.test.ts  # Session route tests
│           │   ├── synthesize.ts    # POST /api/synthesize (TTS)
│           │   └── transcribe.ts    # POST /api/transcribe (STT)
│           ├── services/            # Business logic services
│           │   ├── logger.ts        # Structured logging (winston-style)
│           │   └── sessionStore.ts  # Multi-backend session storage
│           └── index.ts             # Server entry point
│
├── packages/
│   └── shared-types/                # Shared TypeScript interfaces
│       ├── src/
│       │   └── index.ts             # Type definitions
│       ├── package.json
│       └── tsconfig.json
│
├── _planning/                       # Planning files (git-ignored)
│   ├── design/                      # Design specifications
│   │   ├── assets/                  # Design assets (NHS logo, etc.)
│   │   ├── flows/                   # User flow documentation
│   │   ├── inventory/               # Component/page inventories
│   │   ├── mocks/                   # HTML mockups with specs
│   │   └── shared/                  # Shared CSS (reset, styles)
│   ├── docs/                        # Planning documentation
│   │   ├── nhs-renal-agent-prompt.md
│   │   ├── nhs-renal-decision-aid-development-plan.md
│   │   ├── nhs-renal-timeline-developer-guide.md
│   │   └── nhs-renal-wireframes-visual-specs.md
│   └── research/                    # Research documents
│       └── Phase_1_Research/        # Initial research phase
│
├── docs/                            # Implementation documentation
├── .github/                         # GitHub Actions CI/CD
│   └── workflows/
│       └── ci.yml                   # Lint, test, build pipeline
│
├── API.md                           # API documentation
├── CLAUDE.md                        # AI agent instructions
├── CODE_MAP.md                      # This file
├── CONTRIBUTING.md                  # Development guidelines
├── GAPS.md                          # Development gaps analysis
├── README.md                        # Project overview
├── package.json                     # Root package.json (workspaces)
├── pnpm-workspace.yaml              # PNPM workspace config
└── tsconfig.json                    # Root TypeScript config
```

---

## Frontend Architecture

### Pages (Route Components)

| Page | Route | Description |
|------|-------|-------------|
| `LandingPage` | `/` | Welcome page with start button |
| `LanguageSelectionPage` | `/language` | Language picker (10 languages) |
| `PrivacyDisclaimerPage` | `/disclaimer` | Privacy notice and consent |
| `JourneyStagePage` | `/journey` | Select current stage in kidney journey |
| `QuestionnairePage` | `/questions` | Personalization questionnaire |
| `HubPage` | `/hub` | Personalized learning hub/dashboard |
| `TreatmentOverviewPage` | `/treatments` | Overview of all treatment options |
| `TreatmentDetailPage` | `/treatments/:type` | Detailed info for specific treatment |
| `ComparePage` | `/compare` | Side-by-side treatment comparison matrix |
| `ValuesPage` | `/values` | Values clarification exercise |
| `ModelViewerPage` | `/model` | Interactive 3D kidney model |
| `ChatPage` | `/chat` | AI chat assistant |
| `SummaryPage` | `/summary` | Session summary with print/share options |

### Components

| Component | Purpose |
|-----------|---------|
| `Layout` | Main layout wrapper with header, footer, navigation |
| `NHSHeader` | NHS-branded header with logo and accessibility button |
| `NHSFooter` | NHS-compliant footer with links |
| `AccessibilityModal` | Text size, contrast, motion, line spacing settings |
| `LanguageSelector` | Dropdown language picker |
| `SessionTimer` | Visual countdown timer with extend option |
| `ProgressBar` | Step progress indicator |
| `StickyProgressIndicator` | Floating progress for long pages |
| `VoiceControls` | Microphone and speaker controls |
| `TreatmentTimeline` | Visual treatment journey timeline |
| `LearningProgress` | Track user's learning completion |
| `ScenarioExplorer` | Interactive treatment scenarios |
| `BackToTop` | Scroll-to-top button |
| `ui/Button` | NHS-styled button component |
| `ui/Card` | Content card component |
| `ui/Skeleton` | Loading skeleton placeholders |

### Hooks

| Hook | Purpose |
|------|---------|
| `useSession` | Access session context (from SessionContext) |
| `useSessionTimer` | Format and manage session countdown |
| `useLanguage` | Language switching utilities |
| `useVoiceRecording` | MediaRecorder + Whisper transcription |
| `useTextToSpeech` | OpenAI TTS playback with controls |

### Context

| Context | Purpose |
|---------|---------|
| `SessionContext` | Global session state management |

**Session State Structure:**
```typescript
interface Session {
  id: string;
  language: SupportedLanguage;
  journeyStage?: JourneyStage;
  questionnaireAnswers: QuestionnaireAnswer[];
  valueRatings: ValueRating[];
  viewedTreatments: TreatmentType[];
  chatHistory: ChatMessage[];
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
}
```

### i18n Configuration

**Supported Languages (10):**

| Code | Language | Direction | Script |
|------|----------|-----------|--------|
| `en` | English | LTR | Latin |
| `hi` | Hindi | LTR | Devanagari |
| `pa` | Punjabi | LTR | Gurmukhi |
| `bn` | Bengali | LTR | Bengali |
| `ur` | Urdu | RTL | Nastaliq |
| `gu` | Gujarati | LTR | Gujarati |
| `ta` | Tamil | LTR | Tamil |
| `zh` | Chinese (Simplified) | LTR | Han |
| `pl` | Polish | LTR | Latin |
| `ar` | Arabic | RTL | Arabic |

**Features:**
- HTTP backend for lazy loading translations
- Automatic fallback to English
- Language preference saved to localStorage
- RTL support for Urdu and Arabic
- Language-specific font families via Noto fonts

---

## Backend Architecture

### Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check endpoint |
| `/api/session` | POST | Create new session |
| `/api/session/:id` | GET | Get session data |
| `/api/session/:id` | PUT | Update session data |
| `/api/session/:id` | DELETE | End/delete session |
| `/api/chat` | POST | Send message, get AI response |
| `/api/transcribe` | POST | Speech-to-text (audio file upload) |
| `/api/synthesize` | POST | Text-to-speech (returns audio) |
| `/api/synthesize/voices` | GET | List available TTS voices |

### Services

| Service | Purpose |
|---------|---------|
| `sessionStore` | Multi-backend session storage (Memory, File, SQLite, Redis) |
| `logger` | Structured logging with request tracking |

### Middleware

| Middleware | Purpose |
|------------|---------|
| `piiFilter` | Detect and redact PII from chat messages |
| `rateLimiter` | Rate limiting per endpoint (global, session, chat) |

### Session Storage Backends

The session store supports multiple storage backends:

1. **MemoryBackend** - In-memory (development default)
2. **FileBackend** - JSON file persistence (Heroku ephemeral)
3. **SQLiteBackend** - SQLite database (production default)
4. **RedisBackend** - Redis (optional, for distributed systems)

**Selection Priority:**
- `SESSION_STORAGE=sqlite` -> SQLite
- `SESSION_STORAGE=redis` + `REDIS_URL` -> Redis
- `SESSION_STORAGE=file` -> File
- `SESSION_STORAGE=memory` -> Memory
- Production default -> SQLite
- Development default -> Memory

---

## Key Features

### 1. Language Support (10 Languages)

```
English, Hindi, Punjabi, Bengali, Urdu, Gujarati, Tamil,
Chinese (Simplified), Polish, Arabic
```

- Full translation coverage for all UI text
- RTL support for Urdu and Arabic
- Language-specific fonts (Noto family)
- Locale-aware date/number formatting

### 2. OpenAI Integration

| Model | Use Case | Endpoint |
|-------|----------|----------|
| `gpt-4o` | Chat conversations | POST /api/chat |
| `gpt-4o-transcribe` | Speech-to-text | POST /api/transcribe |
| `gpt-4o-mini-tts` | Text-to-speech | POST /api/synthesize |

**Chat System Prompt Features:**
- Kidney disease treatment expertise
- 10-language multilingual support
- Cultural sensitivity
- NHS guidelines compliance
- PII protection

### 3. 3D Kidney Model Viewer

- React Three Fiber for 3D rendering
- Interactive rotation and zoom
- Anatomical labels and hotspots
- Performance-optimized for mobile

### 4. Voice Input/Output

**Voice Recording (STT):**
- MediaRecorder API
- Audio level monitoring
- Automatic stop after 2 minutes
- Whisper API transcription

**Text-to-Speech (TTS):**
- OpenAI TTS voices (alloy, nova, shimmer, echo, fable, onyx)
- Playback controls (play, pause, stop)
- Progress tracking
- Language-optimized voice selection

### 5. Treatment Comparison

Four treatment options with detailed comparison:
- Kidney Transplant (living/deceased donor)
- Haemodialysis (in-centre/home)
- Peritoneal Dialysis (CAPD/APD)
- Conservative Care

Comparison criteria:
- Time commitment
- Lifestyle impact
- Travel freedom
- Diet restrictions
- Support requirements

### 6. Session Management

- 15-minute session expiry
- Automatic extension on activity
- Visual countdown timer
- Warning at 5 minutes remaining
- No persistent user data storage

---

## Data Flow Diagrams

### User Journey Flow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Landing   │───>│   Language   │───>│   Privacy    │
│    Page     │    │  Selection   │    │  Disclaimer  │
└─────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              v
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Personal   │<───│  Journey     │<───│   Create     │
│    Hub      │    │   Stage      │    │   Session    │
└─────────────┘    └──────────────┘    └──────────────┘
      │
      ├──────────────────────────────────────────────┐
      │                                              │
      v                                              v
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Treatment  │───>│  Treatment   │    │    Values    │
│  Overview   │    │   Detail     │    │   Exercise   │
└─────────────┘    └──────────────┘    └──────────────┘
      │                                              │
      v                                              │
┌─────────────┐    ┌──────────────┐                  │
│   Compare   │    │  3D Model    │                  │
│   Matrix    │    │   Viewer     │                  │
└─────────────┘    └──────────────┘                  │
      │                   │                          │
      └─────────┬─────────┴──────────────────────────┘
                │
                v
┌─────────────────────────────────────────────────────┐
│                    AI Chat                          │
│  (accessible from any page via navigation)          │
└─────────────────────────────────────────────────────┘
                │
                v
┌─────────────────────────────────────────────────────┐
│                 Session Summary                     │
│  (print/share capability)                           │
└─────────────────────────────────────────────────────┘
```

### API Request Flow

```
┌──────────────┐
│   Frontend   │
│  (React App) │
└──────┬───────┘
       │
       │ HTTP Request
       v
┌──────────────────────────────────────────────────────┐
│                    Express Server                     │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Helmet   │─>│     CORS     │─>│ Rate Limiter │ │
│  │ (security) │  │   (origin)   │  │  (throttle)  │ │
│  └────────────┘  └──────────────┘  └──────────────┘ │
│                         │                            │
│                         v                            │
│  ┌────────────────────────────────────────────────┐ │
│  │              Route Handlers                     │ │
│  │  /session  /chat  /transcribe  /synthesize     │ │
│  └────────────────────────────────────────────────┘ │
│         │              │              │              │
│         v              v              v              │
│  ┌────────────┐  ┌──────────┐  ┌──────────────┐    │
│  │  Session   │  │  OpenAI  │  │  PII Filter  │    │
│  │   Store    │  │   API    │  │  (redact)    │    │
│  │ (SQLite)   │  │          │  │              │    │
│  └────────────┘  └──────────┘  └──────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Session State Flow

```
┌───────────────────────────────────────────────────────────────┐
│                      SessionContext                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     Session State                        │ │
│  │  • id              • valueRatings                       │ │
│  │  • language        • viewedTreatments                   │ │
│  │  • journeyStage    • chatHistory                        │ │
│  │  • questionnaireAnswers                                 │ │
│  │  • createdAt / expiresAt / lastActivityAt               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                                  │
│     ┌──────────────────────┼──────────────────────┐          │
│     │                      │                      │          │
│     v                      v                      v          │
│ ┌─────────┐         ┌───────────┐         ┌───────────┐     │
│ │  Pages  │         │   Timer   │         │    API    │     │
│ │ (read/  │         │  (auto-   │         │ (sync to  │     │
│ │ update) │         │  extend)  │         │  server)  │     │
│ └─────────┘         └───────────┘         └───────────┘     │
└───────────────────────────────────────────────────────────────┘
```

---

## API Reference

See [API.md](./API.md) for complete API documentation.

### Quick Reference

```
GET  /api/health              # Health check
POST /api/session             # Create session
GET  /api/session/:id         # Get session
PUT  /api/session/:id         # Update session
DEL  /api/session/:id         # Delete session
POST /api/chat                # Chat with AI
POST /api/transcribe          # Speech to text
POST /api/synthesize          # Text to speech
GET  /api/synthesize/voices   # List TTS voices
```

---

## Configuration

### Environment Variables

**Backend (`apps/backend/.env`):**

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5006 |
| `NODE_ENV` | Environment | development |
| `OPENAI_API_KEY` | OpenAI API key | (required) |
| `OPENAI_MODEL` | Chat model | gpt-4o |
| `SESSION_STORAGE` | Storage backend | auto |
| `SESSION_SECRET` | Session encryption | (required) |
| `CORS_ORIGIN` | Allowed origins | localhost:3006 |
| `LOG_LEVEL` | Logging level | debug |
| `REDIS_URL` | Redis URL (optional) | - |

**Frontend (`apps/frontend/.env`):**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | http://localhost:5006 |

### Service Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 3006 |
| Backend (Express) | 5006 |

---

## Development Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend

# Run tests
npm test

# Build for production
npm run build
```

---

## File Size Guidelines

- Maximum 900 lines per file
- Maximum 30 lines per function
- Maximum 120 characters per line
- Maximum 7 props per component

---

*Last Updated: 21 January 2026*
