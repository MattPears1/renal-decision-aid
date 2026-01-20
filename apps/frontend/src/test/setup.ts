import '@testing-library/jest-dom';
import { vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';
import React from 'react';

expect.extend(matchers);

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}));
