import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  changeLanguageAndWait,
  type SupportedLanguage,
} from '@/config/i18n';
import clsx from 'clsx';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'inline';
  className?: string;
}

export default function LanguageSelector({
  variant = 'dropdown',
  className = '',
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLang, setLoadingLang] = useState<SupportedLanguage | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track language in local state to ensure re-renders
  // Handle language codes with region (e.g., 'en-GB' -> 'en')
  const getValidLanguage = useCallback((lang: string): SupportedLanguage => {
    const baseLang = lang?.split('-')[0];
    if (isSupportedLanguage(baseLang)) {
      return baseLang;
    }
    return 'en';
  }, []);

  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() =>
    getValidLanguage(i18n.language)
  );

  // Sync local state with i18n language changes (including external changes)
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const validLang = getValidLanguage(lng);
      setCurrentLang(validLang);

      // Update document attributes
      document.documentElement.dir = SUPPORTED_LANGUAGES[validLang].dir;
      document.documentElement.lang = validLang;
    };

    // Listen for language changes from i18n
    i18n.on('languageChanged', handleLanguageChanged);

    // Sync on mount in case language changed before this component mounted
    const validLang = getValidLanguage(i18n.language);
    if (validLang !== currentLang) {
      setCurrentLang(validLang);
    }

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, getValidLanguage, currentLang]);

  const currentLangInfo = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.en;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = useCallback(
    async (langCode: SupportedLanguage) => {
      // Prevent multiple simultaneous language changes
      if (isLoading) return;

      // Show loading state for this language
      setIsLoading(true);
      setLoadingLang(langCode);
      setIsOpen(false);

      // Update local state optimistically for immediate UI feedback
      setCurrentLang(langCode);

      try {
        // Use the robust changeLanguageAndWait function with timeout and retry
        const success = await changeLanguageAndWait(langCode);

        if (!success) {
          // If language change failed, revert to English
          console.warn(`Language change to ${langCode} failed, reverting to English`);
          setCurrentLang('en');
        }
      } catch (error) {
        console.error('Language change error:', error);
        // Revert to English on error
        setCurrentLang('en');
      } finally {
        setIsLoading(false);
        setLoadingLang(null);
      }
    },
    [isLoading]
  );

  // Loading spinner component
  const LoadingSpinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  if (variant === 'inline') {
    return (
      <div className={clsx('flex flex-wrap gap-2', className)}>
        {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((langCode) => {
          const lang = SUPPORTED_LANGUAGES[langCode];
          const isActive = langCode === currentLang;
          const isLoadingThis = loadingLang === langCode;

          return (
            <button
              key={langCode}
              onClick={() => handleLanguageChange(langCode)}
              disabled={isLoading}
              className={clsx(
                'px-3 py-2.5 sm:py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                'min-h-[44px] touch-manipulation',
                isActive
                  ? 'bg-nhs-blue text-white'
                  : 'bg-nhs-pale-grey text-text-secondary hover:bg-nhs-mid-grey hover:text-white',
                isLoading && !isLoadingThis && 'opacity-50 cursor-not-allowed'
              )}
              aria-current={isActive ? 'true' : undefined}
              aria-busy={isLoadingThis}
            >
              {isLoadingThis && <LoadingSpinner />}
              {lang.nativeName}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={clsx('relative inline-block', className)}>
      <button
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className={clsx(
          'flex items-center justify-center gap-1 sm:gap-2 p-2 sm:px-3 sm:py-2 rounded-md border border-nhs-pale-grey bg-white',
          'hover:border-nhs-blue transition-colors focus:outline-none focus:ring-2 focus:ring-focus',
          'min-w-[44px] min-h-[44px] touch-manipulation',
          isLoading && 'opacity-75 cursor-wait'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('language.selectLanguage', 'Select language')}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <svg
            className="w-5 h-5 text-text-secondary flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
        )}
        {/* Show language name only on sm screens and up */}
        <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">{currentLangInfo.nativeName}</span>
        <svg
          className={clsx(
            'w-4 h-4 text-text-secondary transition-transform flex-shrink-0 hidden sm:block',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !isLoading && (
        <div
          className="absolute right-0 top-full mt-1 w-48 sm:w-52 bg-white rounded-md shadow-lg border border-nhs-pale-grey z-[1000] max-h-[60vh] overflow-y-auto"
          role="listbox"
          aria-label={t('language.selectLanguage', 'Select language')}
        >
          <div className="py-1">
            {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((langCode) => {
              const lang = SUPPORTED_LANGUAGES[langCode];
              const isActive = langCode === currentLang;

              return (
                <button
                  key={langCode}
                  onClick={() => handleLanguageChange(langCode)}
                  className={clsx(
                    'w-full px-4 py-3 sm:py-2.5 text-left text-sm transition-colors min-h-[44px] touch-manipulation',
                    isActive
                      ? 'bg-nhs-blue/10 text-nhs-blue font-medium'
                      : 'text-text-primary hover:bg-nhs-pale-grey active:bg-nhs-pale-grey'
                  )}
                  role="option"
                  aria-selected={isActive}
                  dir={lang.dir}
                >
                  <span className="block">{lang.nativeName}</span>
                  <span className="block text-xs text-text-muted">{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
