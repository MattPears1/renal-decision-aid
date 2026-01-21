# NHS Renal Transplant Decision Aid

**Version:** 2.5.0
**Last Updated:** 21 January 2026
**Status:** Production Ready

A multilingual patient decision support tool for kidney disease patients, designed for the UK NHS.

---

## Overview

This application helps patients with chronic kidney disease (CKD) understand their treatment options and make informed decisions. It specifically addresses the needs of diverse UK communities, particularly South Asian populations who face 3-5x higher rates of kidney disease but have limited access to translated educational resources.

### Features

- **10 Languages**: English, Hindi, Punjabi, Bengali, Urdu, Gujarati, Tamil, Chinese (Simplified), Polish, Arabic
- **AI-Powered Chat**: GPT-4o conversational Q&A with multilingual support
- **Voice Interface**: Speech-to-text and text-to-speech using OpenAI APIs
- **Interactive Decision Support**: Personalized journey based on questionnaire responses
- **Treatment Comparison**: Side-by-side comparison of dialysis, transplant, and conservative care
- **3D Kidney Visualization**: Interactive anatomical model using React Three Fiber
- **Accessibility**: WCAG 2.2 AA compliant, designed for older adults
- **Privacy-First**: Session-only data with 15-minute expiry, aggressive PII protection

### Supported Languages

| Language | Code | Direction | Script |
|----------|------|-----------|--------|
| English | en | LTR | Latin |
| Hindi | hi | LTR | Devanagari |
| Punjabi | pa | LTR | Gurmukhi |
| Bengali | bn | LTR | Bengali |
| Urdu | ur | RTL | Nastaliq |
| Gujarati | gu | LTR | Gujarati |
| Tamil | ta | LTR | Tamil |
| Chinese (Simplified) | zh | LTR | Han |
| Polish | pl | LTR | Latin |
| Arabic | ar | RTL | Arabic |

### Privacy

- **Session-only**: No data stored beyond 15-minute session
- **No database**: Sessions stored in memory (dev) or SQLite (prod) with automatic expiry
- **PII Protection**: Aggressive screening prevents personal information from reaching AI

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS 3 |
| Backend | Node.js 20, Express 4, TypeScript 5 |
| Database | SQLite (better-sqlite3) for session persistence |
| i18n | i18next with HTTP backend |
| 3D | React Three Fiber, @react-three/drei |
| AI | OpenAI API (gpt-4o, gpt-4o-transcribe, gpt-4o-mini-tts) |
| Testing | Vitest, React Testing Library, axe-core |
| Hosting | Heroku |

---

## Project Structure

```
Renal_Transplant_Decision_Tool/
├── apps/
│   ├── frontend/          # React SPA application
│   │   └── src/
│   │       ├── components/  # Reusable UI components
│   │       ├── pages/       # Route page components
│   │       ├── hooks/       # Custom React hooks
│   │       ├── context/     # React context providers
│   │       ├── services/    # API clients
│   │       ├── locales/     # i18n translation files (10 languages)
│   │       └── config/      # App configuration
│   └── backend/           # Express API server
│       └── src/
│           ├── routes/      # API route handlers
│           ├── middleware/  # Express middleware (PII filter, rate limiter)
│           ├── services/    # Business logic (session store, logger)
│           └── db/          # Database layer (SQLite)
├── packages/
│   └── shared-types/      # Shared TypeScript interfaces
├── docs/                  # Implementation documentation
├── _planning/             # Planning files (git-ignored)
├── CODE_MAP.md            # Detailed code architecture
├── API.md                 # API documentation
├── CONTRIBUTING.md        # Development guidelines
├── CLAUDE.md              # AI agent instructions
└── GAPS.md                # Development gaps analysis
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+ (or pnpm 8+)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/USERNAME/renal-decision-aid.git
cd renal-decision-aid

# Install dependencies
npm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit .env and add your OPENAI_API_KEY
```

### Development

```bash
# Start both frontend and backend dev servers
npm run dev

# Or start individually
npm run dev:frontend    # Vite dev server on port 3006
npm run dev:backend     # Express server on port 5006
```

### Environment Variables

Create `apps/backend/.env`:

```bash
PORT=5006
NODE_ENV=development
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o
SESSION_SECRET=your_secret_here
SESSION_STORAGE=memory
LOG_LEVEL=debug
```

---

## Available Scripts

```bash
npm run dev           # Start all dev servers
npm run dev:frontend  # Start frontend only
npm run dev:backend   # Start backend only
npm run build         # Build all packages
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier
npm run test          # Run all tests
npm run clean         # Remove node_modules
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/session` | POST | Create session |
| `/api/session/:id` | GET | Get session |
| `/api/session/:id` | PUT | Update session |
| `/api/session/:id` | DELETE | Delete session |
| `/api/chat` | POST | AI chat message |
| `/api/transcribe` | POST | Speech-to-text |
| `/api/synthesize` | POST | Text-to-speech |

See [API.md](./API.md) for complete API documentation.

---

## Documentation

| Document | Description |
|----------|-------------|
| [CODE_MAP.md](./CODE_MAP.md) | Detailed code architecture and directory structure |
| [API.md](./API.md) | Complete API documentation |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development rules and guidelines |
| [CLAUDE.md](./CLAUDE.md) | AI agent-specific instructions |
| [GAPS.md](./GAPS.md) | Development gaps analysis |

---

## Key Development Rules

- Maximum 900 lines per file
- All user-facing text must use i18n translation keys
- All components must be WCAG 2.2 AA accessible
- Never kill all Node processes (use `npx kill-port <port>` instead)

---

## Deployment

```bash
# Deploy to Heroku
git push heroku main
```

The application is configured with:
- `heroku-postbuild` script for building frontend and backend
- SQLite session storage (persists across restarts)
- Automatic HTTPS via Heroku

---

## Testing

```bash
# Run all tests
npm test

# Tests include:
# - Frontend: Vitest + React Testing Library
# - Backend: Vitest + Supertest
# - Accessibility: axe-core automated checks
```

Current test coverage: 65+ tests passing across 6 test files.

---

## License

This project is proprietary and intended for NHS use only.

---

## Contact

For questions about this project, contact the development team.

---

*Last Updated: 21 January 2026*
