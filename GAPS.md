# NHS Renal Decision Aid - Development Gaps Analysis

**Generated:** 2026-01-20
**Last Updated:** 2026-01-20
**Status:** Comprehensive audit of all development gaps and required work

---

## Executive Summary

This project is an NHS Multilingual Renal Patient Decision Support Tool with a React frontend and Express backend. While the basic structure and several pages are implemented, there are **critical gaps** that prevent the application from being production-ready:

1. **i18n/Localization has gaps** - Multiple hardcoded English strings throughout components
2. **Zero test coverage** - No unit tests, integration tests, or E2E tests exist
3. **Backend is minimal** - In-memory storage only, no persistent database
4. **Missing translation keys** across all 6 non-English languages
5. **Incomplete accessibility** - TODO placeholder for accessibility settings modal
6. **Hardcoded UI text** - Summary, Values, and Model Viewer pages have hardcoded strings

---

## Critical Priority Gaps

### 1. i18n/Localization - Hardcoded Strings (CRITICAL)

**Impact:** Users selecting non-English languages will see English text for critical UI elements.

#### `apps/frontend/src/App.tsx:27`
```tsx
<p className="text-text-secondary">Loading...</p>  // HARDCODED
```
**Fix:** Replace with `{t('common.loading')}`

#### `apps/frontend/src/pages/SummaryPage.tsx`

| Line | Hardcoded String |
|------|------------------|
| 18 | `'Are you sure you want to start over? All your progress will be lost.'` (fallback) |
| 37-46 | Journey stage labels: `'Newly Diagnosed'`, `'Being Monitored'`, `'Preparing for Treatment'`, etc. |
| 50-58 | Journey stage descriptions (all hardcoded) |
| 62-66 | Value labels: `'Not important'`, `'Slightly important'`, etc. |
| 70-77 | Treatment labels: `'Haemodialysis'`, `'Peritoneal Dialysis'`, etc. |
| 80 | Date format hardcoded to `'en-GB'` locale |
| 93-94 | `'NHS Kidney Treatment Decision Aid'`, `'Your Personal Session Summary'` |
| 97-98 | `'Date: {sessionDate}'`, `'Session ID: ...'` |
| 111 | `'Ready to review'` badge text |
| 136-139 | Share title/text: `'NHS Kidney Treatment Summary'`, `'My kidney treatment decision summary'` |
| 465-466 | `'Ready for your next appointment?'`, `'Print this summary to take with you...'` |

#### `apps/frontend/src/pages/ValuesPage.tsx` - COMPLETED

**Status:** All hardcoded strings have been internationalized.

- `STATEMENT_CONFIGS` (lines 21-32) now only contains IDs and categories
- `VALUE_STATEMENTS` (lines 49-57) uses `t('values.statements.${id}.statement')` and `t('values.statements.${id}.hint')`
- `RATING_LABELS` (lines 60-67) uses `t('values.ratingLabels.${value}')`
- Slider labels (lines 318-319) use `t('values.lessImportant')` and `t('values.moreImportant')`
- All translation keys exist in `en/common.json` under the `values` section (lines 608-758)

#### `apps/frontend/src/pages/ModelViewerPage.tsx`

| Line | Hardcoded String |
|------|------------------|
| 192 | `'Loading 3D Model...'` |
| 456 | `'Continue your journey by exploring treatment options'` |

#### `apps/frontend/src/pages/ChatPage.tsx`

| Line | Hardcoded String |
|------|------------------|
| 152 | `'Privacy reminder:'` |

#### `apps/frontend/src/context/SessionContext.tsx` - COMPLETED

**Status:** All hardcoded error messages have been internationalized.

- Line 62 uses `i18next.t('session.sessionExpired')`
- Line 99 uses `i18next.t('session.createError')`
- Translation keys exist in `en/common.json` under the `session` section (lines 905-913)

#### `apps/frontend/src/components/Layout.tsx`

| Line | Issue |
|------|-------|
| 69-70 | TODO: `// TODO: Implement accessibility settings modal` with `console.log` |

---

### 2. Missing Translation Keys Across Languages (HIGH)

Comparing `en/common.json` (588 lines) vs `hi/common.json` (564 lines):

**Missing in Hindi (and likely other languages):**

| Key Path | English Value |
|----------|---------------|
| `progress.stepOfTotal` | `"Step {{current}} of {{total}}"` |
| `progress.percentComplete` | `"{{percentage}}% complete"` |
| `progress.ariaProgressLabel` | `"Progress: {{current}} of {{total}} steps completed"` |
| `session.expiringMessage` | `"Your session will expire in {{minutes}} minutes..."` |
| `footer.contact` | `"Contact"` |
| `footer.navigationLabel` | `"Footer navigation"` |
| `footer.supportingDecisions` | `"Supporting informed healthcare decisions"` |
| `footer.copyright` | `"Pears Research Services. All rights reserved."` |
| `footer.demoVersion` | `"Demo Version 1.0"` |
| `footer.disclaimer.*` | Multiple disclaimer keys |
| `header.demo` | `"Demo"` |
| `header.tagline` | `"Helping you make informed choices"` |
| `header.homeAriaLabel` | Full aria label text |
| `landing.trust.evidenceBased` | English has this, some languages missing |

**Urdu has additional inconsistency:**
- `landing.trust.nhsApproved` exists in Urdu but not in English (`evidenceBased` used instead)

**Action required:** Audit all 6 non-English translation files and add missing keys.

---

### 3. Zero Test Coverage (CRITICAL)

**Finding:** No test files exist in the project. All `.test.` files found are in `node_modules/`.

**Required tests:**
- Unit tests for all components (12 pages, 8 reusable components)
- Integration tests for API endpoints
- E2E tests for user flows (questionnaire, chat, summary)
- Accessibility tests for WCAG 2.2 AA compliance

**Setup needed:**
- Vitest/Jest configuration for frontend
- React Testing Library
- Cypress/Playwright for E2E
- Axe-core for accessibility testing
- Supertest for backend API testing

---

## High Priority Gaps

### 4. Backend Limitations

#### No Persistent Database
- `apps/backend/src/services/sessionStore.ts` uses in-memory `Map<string, Session>`
- Sessions lost on server restart
- No user data persistence
- 15-minute session expiration with 5-minute cleanup interval

**Current state:**
```typescript
// apps/backend/src/services/sessionStore.ts - In-memory only
private sessions = new Map<string, SessionData>();
```

**Required:** Implement PostgreSQL, MongoDB, or Redis for session persistence.

#### Limited API Endpoints

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/health` | ✅ Implemented | Basic health check |
| `POST /api/session` | ✅ Implemented | Create session |
| `GET /api/session/:id` | ✅ Implemented | Get session data |
| `PUT /api/session/:id` | ✅ Implemented | Update session |
| `DELETE /api/session/:id` | ✅ Implemented | End session |
| `POST /api/chat` | ✅ Implemented | With PII filter, OpenAI integration |
| `/api/analytics` | ❌ Missing | No anonymous analytics endpoint |
| `/api/feedback` | ❌ Missing | No user feedback collection |
| `/api/export` | ❌ Missing | No PDF/summary export functionality |
| `/api/treatments` | ❌ Missing | Treatment data served from frontend only |

---

### 5. Accessibility Gaps (WCAG 2.2 AA)

| Issue | Location | WCAG Criterion | Severity |
|-------|----------|----------------|----------|
| Hardcoded `aria-label="Breadcrumb"` | Multiple pages (ComparePage:264, ChatPage:123, ModelViewerPage:226, TreatmentDetailPage:340, TreatmentOverviewPage:116) | 1.3.1 Info and Relationships | Medium |
| Hardcoded `aria-label="Page navigation"` | ComparePage:544, TreatmentDetailPage:663, TreatmentOverviewPage:286 | 1.3.1 | Medium |
| Hardcoded `aria-label="Frequently asked questions"` | TreatmentDetailPage:540 | 1.3.1 | Medium |
| Accessibility settings modal not implemented | Layout.tsx:69-70 | 1.4.4 Resize Text, 1.4.3 Contrast | High |
| Console.log instead of actual functionality | Layout.tsx:70 | N/A | High |
| Date format hardcoded to 'en-GB' | SummaryPage.tsx:80 | 3.1.1 Language of Page | Low |

**Accessibility features already present (234 occurrences across 19 files):**
- ARIA roles, labels, and attributes
- Skip to content link
- Keyboard navigation support
- Focus management
- Screen reader support

---

### 6. Unimplemented Features / TODOs

| Location | TODO/Issue |
|----------|------------|
| `apps/frontend/src/components/Layout.tsx:69` | `// TODO: Implement accessibility settings modal` |

---

## Medium Priority Gaps

### 7. Missing Error States and Loading States

| Page/Component | Missing State |
|----------------|---------------|
| `App.tsx` PageLoader | Uses hardcoded "Loading..." |
| `ChatPage.tsx` | Network error handling has basic fallback |
| `TreatmentDetailPage.tsx` | Invalid treatment type returns to overview (no 404 UI) |
| `HubPage.tsx` | Session not found redirects to home (no error message) |
| All pages | No offline mode handling/detection |
| API calls | No loading skeleton components |

### 8. Code Quality Issues

| Issue | Files Affected |
|-------|---------------|
| Large files exceeding 900 line limit | TreatmentDetailPage.tsx (688), SummaryPage.tsx (682), QuestionnairePage.tsx (640) |
| Console statements in production code | SessionContext.tsx:99,114; LanguageSelectionPage.tsx:84; Layout.tsx:70 |
| Missing comprehensive type definitions | Some `any` types in components |

---

## Low Priority Gaps

### 9. Documentation Gaps

| Document | Status |
|----------|--------|
| `README.md` | Exists but needs update |
| `CONTRIBUTING.md` | Exists, comprehensive |
| `CLAUDE.md` | Exists, AI agent instructions |
| API documentation | ❌ Missing (no OpenAPI/Swagger) |
| Component Storybook | ❌ Missing |
| Deployment guide | ❌ Missing |
| User documentation | ❌ Missing |

### 10. DevOps/CI Gaps

- No GitHub Actions workflow for CI/CD
- No pre-commit hooks configured (no husky/lint-staged)
- No automated linting on PR
- No deployment pipeline
- Heroku `Procfile` exists but no other deployment configs

### 11. Missing Environment Configuration

| Item | Status |
|------|--------|
| `.env.example` | ✅ Exists for backend |
| `.env.example` for frontend | ❌ Missing |
| Production environment configs | ❌ Missing |
| Docker configuration | ❌ Missing |

---

## Recommended Priority Order

### Phase 1: Critical i18n Fixes (Immediate)
1. ✅ Fix `App.tsx:27` hardcoded "Loading..."
2. ✅ Fix `SummaryPage.tsx` hardcoded strings (15+ instances)
3. ✅ Fix `ValuesPage.tsx` hardcoded VALUE_STATEMENTS and RATING_LABELS - **VERIFIED COMPLETE**
4. ✅ Fix `ModelViewerPage.tsx:192,456` hardcoded strings
5. ✅ Fix `ChatPage.tsx:152` hardcoded string
6. ✅ Fix `SessionContext.tsx` hardcoded error messages
7. ✅ Add missing translation keys to all 6 non-English language files

### Phase 2: Testing Foundation
1. Set up Vitest with React Testing Library
2. Write tests for critical paths (language selection, questionnaire, chat)
3. Add accessibility testing with axe-core
4. Add backend API tests with supertest

### Phase 3: Accessibility & UX
1. Implement accessibility settings modal (Layout.tsx:69)
2. Replace all hardcoded aria-labels with i18n keys
3. Add proper loading states and skeletons
4. Add offline mode detection

### Phase 4: Backend Completion
1. Add database persistence (PostgreSQL/MongoDB)
2. Implement missing API endpoints (analytics, feedback, export)
3. Add proper error handling and logging

### Phase 5: Polish & DevOps
1. Remove console.log statements
2. Split large components
3. Documentation (API docs, deployment guide)
4. CI/CD pipeline with GitHub Actions

---

## File Reference Index

| File | Lines | Issues |
|------|-------|--------|
| `apps/frontend/src/App.tsx` | ~144 | 1 hardcoded string |
| `apps/frontend/src/pages/SummaryPage.tsx` | 682 | 15+ hardcoded strings |
| `apps/frontend/src/pages/ValuesPage.tsx` | 596 | **COMPLETE** - All strings internationalized |
| `apps/frontend/src/pages/ModelViewerPage.tsx` | 490 | 2 hardcoded strings |
| `apps/frontend/src/pages/ChatPage.tsx` | 477 | 1 hardcoded string |
| `apps/frontend/src/context/SessionContext.tsx` | 270 | **COMPLETE** - All strings internationalized, console.errors (info only) |
| `apps/frontend/src/components/Layout.tsx` | ~100 | 1 TODO, 1 console.log |
| `apps/frontend/src/pages/ComparePage.tsx` | 579 | 2 hardcoded aria-labels |
| `apps/frontend/src/pages/TreatmentDetailPage.tsx` | 688 | 3 hardcoded aria-labels |
| `apps/frontend/src/pages/TreatmentOverviewPage.tsx` | 312 | 2 hardcoded aria-labels |

---

## Translation File Checklist

| Language | File | Size | Status | Missing Keys (est.) |
|----------|------|------|--------|---------------------|
| English | `en/common.json` | 588 lines | ✅ Baseline | - |
| Hindi | `hi/common.json` | 564 lines | ⚠️ Partial | ~24 keys |
| Punjabi | `pa/common.json` | TBD | Needs audit | TBD |
| Bengali | `bn/common.json` | TBD | Needs audit | TBD |
| Urdu | `ur/common.json` | 564 lines | ⚠️ Partial | ~24 keys + inconsistent keys |
| Gujarati | `gu/common.json` | TBD | Needs audit | TBD |
| Tamil | `ta/common.json` | TBD | Needs audit | TBD |

**Note:** All hardcoded strings need i18n keys added to ALL 7 language files.

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total hardcoded strings found | ~40+ |
| Missing translation keys (per language) | ~24 |
| Hardcoded aria-labels | 10 |
| TODO comments | 1 |
| Console statements in code | 4 |
| Test files | 0 |
| Files exceeding 900 line limit | 0 (max is 688) |
| API endpoints implemented | 5 |
| API endpoints missing | 3 |

---

*This document should be updated as gaps are addressed.*
