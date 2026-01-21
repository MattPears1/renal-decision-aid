import '@testing-library/jest-dom';
import { vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';
import React from 'react';

expect.extend(matchers);

// Mock Web Speech API
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string;
  rate: number;
  onend: (() => void) | null;
  onerror: (() => void) | null;

  constructor(text: string = '') {
    this.text = text;
    this.lang = 'en-GB';
    this.rate = 1;
    this.onend = null;
    this.onerror = null;
  }
}

vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
vi.stubGlobal('speechSynthesis', {
  speak: vi.fn(),
  cancel: vi.fn(),
});

// Mock i18next core
const mockI18n = {
  language: 'en',
  changeLanguage: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  off: vi.fn(),
  hasResourceBundle: vi.fn().mockReturnValue(true),
  loadNamespaces: vi.fn().mockResolvedValue(undefined),
  use: vi.fn().mockReturnThis(),
  init: vi.fn().mockResolvedValue(undefined),
};

vi.mock('i18next', () => ({
  default: mockI18n,
}));

vi.mock('i18next-http-backend', () => ({
  default: vi.fn(),
  HttpBackendOptions: {},
}));

// Mock the i18n config module
vi.mock('@/config/i18n', () => ({
  default: mockI18n,
  changeLanguageAndWait: vi.fn().mockResolvedValue(true),
  SUPPORTED_LANGUAGES: {
    en: { name: 'English', nativeName: 'English', dir: 'ltr' },
    hi: { name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
    pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
    bn: { name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
    ur: { name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
    gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
    ta: { name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  },
  DEFAULT_NS: 'common',
  NAMESPACES: ['common'],
  LANGUAGE_FONTS: {
    en: '"NHS Regular", "Frutiger", "Arial", sans-serif',
    hi: '"Noto Sans Devanagari", "Mangal", sans-serif',
    pa: '"Noto Sans Gurmukhi", "Raavi", sans-serif',
    bn: '"Noto Sans Bengali", "Vrinda", sans-serif',
    ur: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Urdu Typesetting", sans-serif',
    gu: '"Noto Sans Gujarati", "Shruti", sans-serif',
    ta: '"Noto Sans Tamil", "Latha", sans-serif',
  },
  isSupportedLanguage: (lang: string) => ['en', 'hi', 'pa', 'bn', 'ur', 'gu', 'ta'].includes(lang),
  getLanguageDirection: (lang: string) => (lang === 'ur' ? 'rtl' : 'ltr'),
  getLanguageFont: (lang: string) => '"NHS Regular", "Frutiger", "Arial", sans-serif',
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: mockI18n,
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}));
