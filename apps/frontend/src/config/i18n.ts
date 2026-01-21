import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend, { HttpBackendOptions } from 'i18next-http-backend';

/**
 * Supported languages for the NHS Renal Decision Aid
 * Includes major South Asian languages commonly spoken in UK communities
 */
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  ur: { name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Font families optimized for each language script
 */
export const LANGUAGE_FONTS: Record<SupportedLanguage, string> = {
  en: '"NHS Regular", "Frutiger", "Arial", sans-serif',
  hi: '"Noto Sans Devanagari", "Mangal", sans-serif',
  pa: '"Noto Sans Gurmukhi", "Raavi", sans-serif',
  bn: '"Noto Sans Bengali", "Vrinda", sans-serif',
  ur: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Urdu Typesetting", sans-serif',
  gu: '"Noto Sans Gujarati", "Shruti", sans-serif',
  ta: '"Noto Sans Tamil", "Latha", sans-serif',
};

/**
 * Default namespace for translations
 */
export const DEFAULT_NS = 'common';

/**
 * All available namespaces
 */
export const NAMESPACES = ['common'] as const;

/**
 * Storage key for language preference
 */
const LANGUAGE_STORAGE_KEY = 'nhs-renal-aid-language';

/**
 * Get the initial language - defaults to English unless user has a saved preference
 */
function getInitialLanguage(): string {
  // Check localStorage for saved preference
  const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLang && savedLang in SUPPORTED_LANGUAGES) {
    return savedLang;
  }
  // Default to English for first-time visitors
  return 'en';
}

/**
 * i18next configuration for NHS Renal Decision Aid
 *
 * Features:
 * - English as default language for first-time visitors
 * - User language preference saved to localStorage
 * - Lazy loading of translation files via HTTP backend
 * - Support for 7 languages including RTL (Urdu)
 * - NHS-appropriate medical terminology
 */
i18n
  // Load translations using HTTP backend (lazy loading)
  .use(HttpBackend)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Explicitly set initial language (English default, or user's saved preference)
    lng: getInitialLanguage(),

    // Fallback language when translation is missing
    fallbackLng: 'en',

    // Supported languages
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),

    // Default namespace
    defaultNS: DEFAULT_NS,

    // Available namespaces
    ns: NAMESPACES,

    // Debug mode (disable in production)
    debug: import.meta.env.DEV,

    // Interpolation settings
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },

    // Backend configuration for loading translation files
    backend: {
      // Path to translation files - use relative path for better mobile compatibility
      loadPath: '/locales/{{lng}}/{{ns}}.json',

      // Request timeout for mobile networks (10 seconds)
      requestOptions: {
        cache: 'no-store', // Prevent mobile browser caching issues
      },

      // Custom request function with timeout and retry for mobile reliability
      request: async (
        _options: HttpBackendOptions,
        url: string,
        _payload: unknown,
        callback: (err: Error | null, data: { status: number; data: string } | null) => void
      ) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const attemptFetch = async (retries = 2): Promise<void> => {
          try {
            const response = await fetch(url, {
              signal: controller.signal,
              cache: 'no-store',
              headers: {
                'Accept': 'application/json',
              },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.text();
            callback(null, { status: response.status, data });
          } catch (error) {
            if (retries > 0 && !(error instanceof DOMException && error.name === 'AbortError')) {
              // Retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
              return attemptFetch(retries - 1);
            }
            clearTimeout(timeoutId);
            callback(error as Error, null);
          }
        };

        attemptFetch();
      },
    } as HttpBackendOptions,

    // React-specific options
    react: {
      // Disable Suspense for better mobile compatibility
      // This prevents the app from crashing if translation loading fails
      useSuspense: false,

      // Bind i18n store to React lifecycle
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },

    // Load languages on init to improve mobile experience
    load: 'currentOnly',

    // Preload the fallback language
    preload: ['en'],
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  // Update document lang attribute immediately when language changes
  document.documentElement.lang = lng;
  const dir = SUPPORTED_LANGUAGES[lng as SupportedLanguage]?.dir || 'ltr';
  document.documentElement.dir = dir;
});

/**
 * Change language and ensure translations are fully loaded
 * This function waits for both the language change and the translation files to load
 * Includes error handling and timeout for mobile reliability
 */
export async function changeLanguageAndWait(lng: SupportedLanguage): Promise<boolean> {
  try {
    // Create a timeout promise for mobile reliability
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Language change timeout')), 20000);
    });

    // Race between language change and timeout
    await Promise.race([
      (async () => {
        // First change the language
        await i18n.changeLanguage(lng);

        // Ensure the namespace is loaded for the new language
        if (!i18n.hasResourceBundle(lng, DEFAULT_NS)) {
          await i18n.loadNamespaces(DEFAULT_NS);
        }
      })(),
      timeoutPromise,
    ]);

    // Small delay to ensure React has time to re-render with new translations
    await new Promise(resolve => setTimeout(resolve, 100));

    return true;
  } catch (error) {
    console.error(`Failed to change language to ${lng}:`, error);

    // If we failed to load the new language, try to fall back to English
    if (lng !== 'en') {
      try {
        await i18n.changeLanguage('en');
        console.warn(`Fell back to English after failing to load ${lng}`);
      } catch {
        // English should always be available
      }
    }

    return false;
  }
}

// Add error handler for failed backend requests
i18n.on('failedLoading', (lng, ns, msg) => {
  console.warn(`Failed to load translations for ${lng}/${ns}: ${msg}`);
});

/**
 * Check if a language code is supported
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return lang in SUPPORTED_LANGUAGES;
}

/**
 * Get language direction (ltr or rtl)
 */
export function getLanguageDirection(lang: string): 'ltr' | 'rtl' {
  if (isSupportedLanguage(lang)) {
    return SUPPORTED_LANGUAGES[lang].dir;
  }
  return 'ltr';
}

/**
 * Get font family for a language
 */
export function getLanguageFont(lang: string): string {
  if (isSupportedLanguage(lang)) {
    return LANGUAGE_FONTS[lang];
  }
  return LANGUAGE_FONTS.en;
}

export default i18n;
