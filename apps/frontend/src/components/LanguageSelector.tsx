import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/config/i18n';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language as SupportedLanguage;
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

  const handleLanguageChange = async (langCode: SupportedLanguage) => {
    await i18n.changeLanguage(langCode);
    setIsOpen(false);

    // Update document direction for RTL languages
    document.documentElement.dir = SUPPORTED_LANGUAGES[langCode].dir;
    document.documentElement.lang = langCode;
  };

  if (variant === 'inline') {
    return (
      <div className={clsx('flex flex-wrap gap-2', className)}>
        {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((langCode) => {
          const lang = SUPPORTED_LANGUAGES[langCode];
          const isActive = langCode === currentLang;

          return (
            <button
              key={langCode}
              onClick={() => handleLanguageChange(langCode)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-nhs-blue text-white'
                  : 'bg-nhs-pale-grey text-text-secondary hover:bg-nhs-mid-grey hover:text-white'
              )}
              aria-current={isActive ? 'true' : undefined}
            >
              {lang.nativeName}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-nhs-pale-grey hover:border-nhs-blue transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('language.selectLanguage', 'Select language')}
      >
        <svg
          className="w-5 h-5 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span className="text-sm font-medium">{currentLangInfo.nativeName}</span>
        <svg
          className={clsx(
            'w-4 h-4 text-text-secondary transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-nhs-pale-grey z-50"
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
                    'w-full px-4 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-nhs-blue/10 text-nhs-blue font-medium'
                      : 'text-text-primary hover:bg-nhs-pale-grey'
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
