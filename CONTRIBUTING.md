# Contributing to NHS Renal Decision Aid

This document outlines the development rules and best practices for this project.

## Code Rules

| Rule | Limit | Rationale |
|------|-------|-----------|
| **Max file length** | 900 lines | Easier to maintain, review, and test |
| **Max function length** | 30 lines | Single responsibility principle |
| **Max line length** | 120 characters | Readable on most screens |
| **Max component props** | 7 props | Too many props = split the component |

### When to Refactor

If a file exceeds 900 lines:
1. Identify logical groupings of code
2. Extract into separate modules
3. Use barrel exports (`index.ts`) for clean imports
4. Update tests to match new structure

## File Organization

### DO

- Keep all planning/research/design files in `_planning/` (git-ignored)
- Keep implementation documentation in `docs/`
- One React component per file
- Co-locate tests with source files (`Component.tsx` + `Component.test.tsx`)
- Use barrel exports for modules

### DON'T

- Don't put `.md` planning files in code directories
- Don't put code in `_planning/`
- Don't create files over 900 lines
- Don't mix concerns in single files

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `TreatmentCard.tsx` |
| Hooks | camelCase with `use` prefix | `useSession.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types/Interfaces | PascalCase | `PatientSession.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_SESSION_TIME` |
| CSS classes | kebab-case | `treatment-card` |
| Directories | kebab-case | `shared-types` |

## Git Commit Messages

Use conventional commits:

```
feat: add language selection page
fix: correct PII detection for NHS numbers
docs: update API documentation
refactor: extract questionnaire logic into hook
test: add unit tests for session service
chore: update dependencies
```

## Security Rules

1. **Never commit secrets** - Use environment variables
2. **Never commit `.env` files** - Only `.env.example` templates
3. **No API keys in code** - Load from `process.env`
4. **No patient data in logs** - PII must be scrubbed

## Directory Structure

```
Renal_Transplant_Decision_Tool/
├── _planning/              # Git-ignored planning files
├── apps/
│   ├── frontend/           # React application
│   │   └── src/
│   │       ├── components/ # Reusable UI components
│   │       ├── pages/      # Route pages
│   │       ├── hooks/      # Custom React hooks
│   │       ├── context/    # React context providers
│   │       ├── services/   # API clients
│   │       ├── locales/    # i18n translation files
│   │       ├── types/      # TypeScript types
│   │       └── config/     # App configuration
│   └── backend/            # Express API server
│       └── src/
│           ├── routes/     # API route handlers
│           ├── middleware/ # Express middleware
│           ├── services/   # Business logic
│           └── utils/      # Utility functions
├── packages/
│   └── shared-types/       # Shared TypeScript interfaces
└── docs/                   # Implementation documentation
```

## Development Workflow

1. **Create a branch** from `main`
2. **Make changes** following the rules above
3. **Run linting** - `pnpm lint`
4. **Run tests** - `pnpm test`
5. **Create PR** with clear description
6. **Get review** before merging

## Accessibility Requirements

All UI components must:
- Have WCAG 2.2 AA compliance
- Include proper ARIA labels
- Support keyboard navigation
- Have minimum 4.5:1 contrast ratio
- Use 48px+ touch targets on mobile

## Internationalization

All user-facing text must:
- Use i18next translation keys (never hardcode strings)
- Support all 7 languages: English, Hindi, Punjabi, Bengali, Urdu, Gujarati, Tamil
- Allow for 40% text expansion (translations may be longer)
