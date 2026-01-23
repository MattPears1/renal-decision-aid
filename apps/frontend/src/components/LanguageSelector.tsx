/**
 * @fileoverview Language selector component for the NHS Renal Decision Aid.
 * Provides dropdown and inline variants for switching between supported languages.
 * @module components/LanguageSelector
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  changeLanguageAndWait,
  type SupportedLanguage,
} from '@/config/i18n';
import clsx from 'clsx';

/**
 * Props for the LanguageSelector component.
 * @interface LanguageSelectorProps
 * @property {'dropdown' | 'inline'} [variant='dropdown'] - Display variant
 * @property {string} [className=''] - Additional CSS classes
 */
interface LanguageSelectorProps {
  variant?: 'dropdown' | 'inline';
  className?: string;
}

/**
 * Language selector component for switching interface language.
 *
 * Features:
 * - Dropdown variant: Compact button with expandable list
 * - Inline variant: Button group for direct selection
 * - Loading states during language change
 * - Automatic document direction (RTL/LTR) updates
 * - Click outside to close dropdown
 * - Native language names for accessibility
 *
 * @component
 * @param {LanguageSelectorProps} props - Component props
 * @returns {JSX.Element} The rendered language selector
 *
 * @example
 * // Dropdown variant (default)
 * <LanguageSelector variant="dropdown" />
 *
 * @example
 * // Inline button group
 * <LanguageSelector variant="inline" />
 */
export default function LanguageSelector({
  variant = 'dropdown',
  className = '',
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLang, setLoadingLang] = useState<SupportedLanguage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingLanguage, setPendingLanguage] = useState<SupportedLanguage | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);

  /**
   * Gets a valid supported language from a language code.
   * Handles region suffixes (e.g., 'en-GB' -> 'en').
   * @param {string} lang - The language code to validate
   * @returns {SupportedLanguage} A valid supported language code
   */
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
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    const allLangs = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[];
    if (!searchQuery.trim()) return allLangs;

    const query = searchQuery.toLowerCase();
    return allLangs.filter((code) => {
      const lang = SUPPORTED_LANGUAGES[code];
      return (
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        code.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  /**
   * Requests a language change - shows confirmation dialog.
   * @param {SupportedLanguage} langCode - The language code to switch to
   */
  const requestLanguageChange = useCallback(
    (langCode: SupportedLanguage) => {
      if (isLoading || langCode === currentLang) return;
      setPendingLanguage(langCode);
      setShowConfirmDialog(true);
      setIsOpen(false);
      setSearchQuery('');
    },
    [isLoading, currentLang]
  );

  /**
   * Cancels the pending language change.
   */
  const cancelLanguageChange = useCallback(() => {
    setPendingLanguage(null);
    setShowConfirmDialog(false);
  }, []);

  /**
   * Confirms and executes the language change with loading state and error recovery.
   */
  const confirmLanguageChange = useCallback(async () => {
    if (!pendingLanguage || isLoading) return;

    const langCode = pendingLanguage;
    setShowConfirmDialog(false);
    setPendingLanguage(null);

    // Show loading state for this language
    setIsLoading(true);
    setLoadingLang(langCode);

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
  }, [pendingLanguage, isLoading]);

  // Handle escape key to close confirmation dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showConfirmDialog) {
        cancelLanguageChange();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfirmDialog, cancelLanguageChange]);

  // Focus trap for confirmation dialog
  useEffect(() => {
    if (showConfirmDialog && confirmDialogRef.current) {
      const firstButton = confirmDialogRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, [showConfirmDialog]);

  /**
   * Loading spinner component for language change state.
   * @returns {JSX.Element} An animated spinner element
   */
  const LoadingSpinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  // Confirmation Dialog Component
  const ConfirmationDialog = () => {
    if (!showConfirmDialog || !pendingLanguage) return null;

    const pendingLangInfo = SUPPORTED_LANGUAGES[pendingLanguage];

    return (
      <div
        className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50"
        onClick={(e) => {
          if (e.target === e.currentTarget) cancelLanguageChange();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div
          ref={confirmDialogRef}
          className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold text-text-primary mb-3"
          >
            {t('language.confirmChange', 'Change Language?')}
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            {t(
              'language.confirmChangeMessage',
              'Are you sure you want to change the language to {{language}}? All text will be updated.',
              { language: pendingLangInfo.nativeName }
            )}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelLanguageChange}
              className="px-4 py-2 text-sm font-medium text-text-primary bg-nhs-pale-grey rounded-md hover:bg-nhs-dark-grey hover:text-white transition-colors min-h-[44px]"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={confirmLanguageChange}
              className="px-4 py-2 text-sm font-medium text-white bg-nhs-blue rounded-md hover:bg-nhs-blue-dark transition-colors min-h-[44px]"
            >
              {t('common.confirm', 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (variant === 'inline') {
    return (
      <>
        <ConfirmationDialog />
        <div className={clsx('flex flex-wrap gap-2', className)}>
          {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((langCode) => {
            const lang = SUPPORTED_LANGUAGES[langCode];
            const isActive = langCode === currentLang;
            const isLoadingThis = loadingLang === langCode;

            return (
              <button
                key={langCode}
                onClick={() => requestLanguageChange(langCode)}
                disabled={isLoading}
                className={clsx(
                  'px-3 py-2.5 sm:py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                  'min-h-[44px] touch-manipulation',
                  isActive
                    ? 'bg-nhs-blue text-white'
                    : 'bg-nhs-pale-grey text-text-primary hover:bg-nhs-dark-grey hover:text-white',
                  isLoading && !isLoadingThis && 'opacity-60 cursor-not-allowed'
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
      </>
    );
  }

  return (
    <>
      <ConfirmationDialog />
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
          className="absolute right-0 top-full mt-1 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-nhs-pale-grey z-[1000] max-h-[70vh] flex flex-col"
          role="listbox"
          aria-label={t('language.selectLanguage', 'Select language')}
        >
          {/* Search input */}
          <div className="p-2 border-b border-nhs-pale-grey sticky top-0 bg-white rounded-t-lg">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('language.searchLanguages', 'Search languages...')}
                className="w-full pl-8 pr-3 py-2 text-sm border border-nhs-pale-grey rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-nhs-blue"
                aria-label={t('language.searchLanguages', 'Search languages')}
              />
            </div>
            <div className="mt-1.5 text-xs text-text-muted text-center">
              {filteredLanguages.length} {t('language.languagesAvailable', 'languages available')}
            </div>
          </div>

          {/* Language list */}
          <div className="overflow-y-auto flex-1 py-1">
            {filteredLanguages.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted text-center">
                {t('language.noResults', 'No languages found')}
              </div>
            ) : (
              filteredLanguages.map((langCode) => {
                const lang = SUPPORTED_LANGUAGES[langCode];
                const isActive = langCode === currentLang;

                return (
                  <button
                    key={langCode}
                    onClick={() => requestLanguageChange(langCode)}
                    className={clsx(
                      'w-full px-4 py-2.5 text-left text-sm transition-colors min-h-[44px] touch-manipulation flex items-center gap-3',
                      isActive
                        ? 'bg-nhs-blue/10 text-nhs-blue font-medium'
                        : 'text-text-primary hover:bg-nhs-pale-grey active:bg-nhs-pale-grey'
                    )}
                    role="option"
                    aria-selected={isActive}
                    dir={lang.dir}
                  >
                    {isActive && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <div className={clsx(!isActive && 'ml-7')}>
                      <span className="block font-medium">{lang.nativeName}</span>
                      <span className="block text-xs text-text-muted">{lang.name}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
