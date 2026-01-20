import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_FONTS,
  isSupportedLanguage,
  getLanguageDirection,
  getLanguageFont,
  type SupportedLanguage,
} from '../config/i18n';

/**
 * Language information interface
 */
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  fontFamily: string;
}

/**
 * Return type for the useLanguage hook
 */
export interface UseLanguageReturn {
  /** Current language code */
  currentLanguage: SupportedLanguage;
  /** Current language display name (English) */
  languageName: string;
  /** Current language native name */
  nativeName: string;
  /** Text direction for current language */
  direction: 'ltr' | 'rtl';
  /** Whether current language is RTL */
  isRTL: boolean;
  /** Font family for current language */
  fontFamily: string;
  /** Change the current language */
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  /** List of all supported languages */
  supportedLanguages: LanguageInfo[];
  /** Check if a language is supported */
  isLanguageSupported: (lang: string) => boolean;
  /** Get language info by code */
  getLanguageInfo: (lang: string) => LanguageInfo | null;
}

/**
 * Custom hook for managing language settings in the NHS Renal Decision Aid
 *
 * Provides:
 * - Current language information (code, name, direction, font)
 * - Language change functionality
 * - List of supported languages
 * - RTL support utilities
 *
 * @example
 * ```tsx
 * function LanguageSelector() {
 *   const {
 *     currentLanguage,
 *     nativeName,
 *     direction,
 *     changeLanguage,
 *     supportedLanguages
 *   } = useLanguage();
 *
 *   return (
 *     <div dir={direction}>
 *       <select
 *         value={currentLanguage}
 *         onChange={(e) => changeLanguage(e.target.value as SupportedLanguage)}
 *       >
 *         {supportedLanguages.map((lang) => (
 *           <option key={lang.code} value={lang.code}>
 *             {lang.nativeName}
 *           </option>
 *         ))}
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLanguage(): UseLanguageReturn {
  const { i18n } = useTranslation();

  // Get current language, defaulting to 'en' if not supported
  const currentLanguage = useMemo<SupportedLanguage>(() => {
    const lang = i18n.language;
    // Handle language codes with region (e.g., 'en-GB' -> 'en')
    const baseLang = lang?.split('-')[0];
    if (isSupportedLanguage(baseLang)) {
      return baseLang;
    }
    return 'en';
  }, [i18n.language]);

  // Get language metadata
  const languageData = SUPPORTED_LANGUAGES[currentLanguage];
  const languageName = languageData.name;
  const nativeName = languageData.nativeName;
  const direction = getLanguageDirection(currentLanguage);
  const isRTL = direction === 'rtl';
  const fontFamily = getLanguageFont(currentLanguage);

  // Change language function
  const changeLanguage = useCallback(
    async (lang: SupportedLanguage): Promise<void> => {
      if (!isSupportedLanguage(lang)) {
        console.warn(`Language '${lang}' is not supported. Falling back to English.`);
        await i18n.changeLanguage('en');
        return;
      }

      await i18n.changeLanguage(lang);

      // Update document direction for RTL support
      const newDirection = getLanguageDirection(lang);
      document.documentElement.dir = newDirection;
      document.documentElement.lang = lang;

      // Update font family on body
      document.body.style.fontFamily = getLanguageFont(lang);
    },
    [i18n]
  );

  // Get list of supported languages
  const supportedLanguages = useMemo<LanguageInfo[]>(() => {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, data]) => ({
      code: code as SupportedLanguage,
      name: data.name,
      nativeName: data.nativeName,
      direction: data.dir,
      fontFamily: LANGUAGE_FONTS[code as SupportedLanguage],
    }));
  }, []);

  // Check if a language is supported
  const isLanguageSupported = useCallback((lang: string): boolean => {
    const baseLang = lang?.split('-')[0];
    return isSupportedLanguage(baseLang);
  }, []);

  // Get language info by code
  const getLanguageInfo = useCallback((lang: string): LanguageInfo | null => {
    const baseLang = lang?.split('-')[0];
    if (!isSupportedLanguage(baseLang)) {
      return null;
    }
    const data = SUPPORTED_LANGUAGES[baseLang];
    return {
      code: baseLang,
      name: data.name,
      nativeName: data.nativeName,
      direction: data.dir,
      fontFamily: LANGUAGE_FONTS[baseLang],
    };
  }, []);

  return {
    currentLanguage,
    languageName,
    nativeName,
    direction,
    isRTL,
    fontFamily,
    changeLanguage,
    supportedLanguages,
    isLanguageSupported,
    getLanguageInfo,
  };
}

export default useLanguage;
