# NHS Renal Decision Aid

A multilingual patient decision support tool for kidney disease patients, designed for the UK NHS.

## Overview

This application helps patients with chronic kidney disease (CKD) understand their treatment options and make informed decisions. It specifically addresses the needs of South Asian communities who face 3-5x higher rates of kidney disease but have limited access to translated educational resources.

### Features

- **7 Languages**: English, Hindi, Punjabi, Bengali, Urdu, Gujarati, Tamil
- **Interactive Decision Support**: Personalized journey based on questionnaire responses
- **Treatment Comparison**: Side-by-side comparison of dialysis, transplant, and conservative care
- **3D Kidney Visualization**: Interactive anatomical model
- **AI Assistant**: Conversational Q&A with aggressive PII protection
- **Accessibility**: WCAG 2.2 AA compliant, designed for older adults

### Privacy

- **Session-only**: No data stored beyond 15-minute session
- **No database**: Memory-based sessions only
- **PII Protection**: Aggressive screening prevents personal information from reaching AI

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS 3 |
| Backend | Node.js 20, Express 4, TypeScript 5 |
| i18n | i18next with ICU MessageFormat |
| 3D | React Three Fiber |
| AI | OpenAI GPT API (with PII screening) |
| Hosting | Heroku |

## Project Structure

```
renal-decision-aid/
├── apps/
│   ├── frontend/          # React application
│   └── backend/           # Express API server
├── packages/
│   └── shared-types/      # Shared TypeScript interfaces
├── docs/                  # Implementation documentation
└── _planning/             # Planning files (git-ignored)
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/USERNAME/renal-decision-aid.git
cd renal-decision-aid

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Environment Variables

Create `.env` files based on `.env.example`:

```bash
# apps/backend/.env
PORT=5006
NODE_ENV=development
OPENAI_API_KEY=your_key_here
SESSION_SECRET=your_secret_here
```

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development rules and guidelines.

See [CLAUDE.md](./CLAUDE.md) for AI agent-specific instructions (process management, etc.).

### Key Rules

- Maximum 900 lines per file
- All user-facing text must use i18n keys
- All components must be accessible (WCAG 2.2 AA)

### Scripts

```bash
pnpm dev           # Start all dev servers
pnpm build         # Build all packages
pnpm lint          # Run ESLint
pnpm test          # Run all tests
pnpm format        # Format code with Prettier
```

## Deployment

```bash
# Deploy to Heroku
git push heroku main
```

## License

This project is proprietary and intended for NHS use only.

## Contact

For questions about this project, contact the development team.
