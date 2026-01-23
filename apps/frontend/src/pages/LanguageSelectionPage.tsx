/**
 * @fileoverview Language selection page for the NHS Renal Decision Aid.
 * Allows users to choose their preferred language from supported options
 * before starting their decision journey.
 *
 * @module pages/LanguageSelectionPage
 * @version 2.6.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 *
 * @requires react
 * @requires react-router-dom
 * @requires react-i18next
 * @requires @/context/SessionContext
 * @requires @renal-decision-aid/shared-types
 * @requires @/config/i18n
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@renal-decision-aid/shared-types';
import { changeLanguageAndWait } from '@/config/i18n';

/**
 * Language selection page component.
 * Displays language options with audio preview capability and handles
 * language selection, session creation, and navigation.
 *
 * @component
 * @returns {JSX.Element} The rendered language selection page
 *
 * @example
 * // Usage in router
 * <Route path="/language" element={<LanguageSelectionPage />} />
 */
export default function LanguageSelectionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectLanguage = useCallback((langCode: SupportedLanguage) => {
    setSelectedLanguage(langCode);
    setError(null);
  }, []);

  const handlePlayAudio = useCallback((langCode: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Stop any currently playing audio
    if (playingAudio) {
      window.speechSynthesis?.cancel();
    }

    setPlayingAudio(langCode);

    // Use Web Speech API for audio preview
    if ('speechSynthesis' in window) {
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
      const text = lang?.nativeName || 'Hello';
      const utterance = new SpeechSynthesisUtterance(text);

      // Map language codes to speech synthesis language codes
      const langMap: Record<string, string> = {
        en: 'en-GB',
        zh: 'zh-CN',
        hi: 'hi-IN',
        pa: 'pa-IN',
        bn: 'bn-IN',
        ur: 'ur-PK',
        gu: 'gu-IN',
        ta: 'ta-IN',
        pl: 'pl-PL',
        ar: 'ar-SA',
        pt: 'pt-PT',
        fr: 'fr-FR',
        so: 'so-SO',
        tr: 'tr-TR',
        vi: 'vi-VN',
      };

      utterance.lang = langMap[langCode] || 'en-GB';
      utterance.rate = 0.8;

      utterance.onend = () => setPlayingAudio(null);
      utterance.onerror = () => setPlayingAudio(null);

      window.speechSynthesis.speak(utterance);

      // Auto-stop after 3 seconds
      setTimeout(() => {
        if (playingAudio === langCode) {
          window.speechSynthesis?.cancel();
          setPlayingAudio(null);
        }
      }, 3000);
    } else {
      // Simulate audio playback if Web Speech API not available
      setTimeout(() => setPlayingAudio(null), 2000);
    }
  }, [playingAudio]);

  const handleContinue = async () => {
    if (!selectedLanguage) {
      setError(t('language.error', 'Please select a language to continue'));
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await changeLanguageAndWait(selectedLanguage);

      if (!success) {
        console.warn(`Language change to ${selectedLanguage} may not have fully loaded`);
      }

      navigate('/who-is-this-for', { state: { language: selectedLanguage } });
    } catch (err) {
      console.error('Failed to set language:', err);
      setError(t('common.error', 'Something went wrong. Please try again.'));
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-page">
      {/* Progress indicator */}
      <div className="bg-white border-b border-nhs-pale-grey">
        <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-3">
          <div
            className="h-1.5 bg-nhs-pale-grey rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={15}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('language.progressLabel', 'Setup progress: 15%')}
          >
            <div className="h-full w-[15%] bg-gradient-to-r from-nhs-blue to-nhs-aqua-green rounded-full transition-all duration-500" />
          </div>
          <p className="text-center text-xs text-text-secondary mt-2">
            {t('language.progressText', 'Step 1 of 4: Select Language')}
          </p>
        </div>
      </div>

      <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Page Header with animation */}
        <header
          className={`text-center mb-6 sm:mb-8 md:mb-10 transform transition-all duration-500 ease-out
                     ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        >
          {/* Globe icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-nhs-blue/10 rounded-full mb-4 sm:mb-6">
            <GlobeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-nhs-blue" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('language.title', 'Choose Your Language')}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto px-2">
            {t('language.instruction', 'Please select your preferred language. You can change this at any time.')}
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <div
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 mb-4 sm:mb-6 bg-red-50 border-l-4 border-nhs-red rounded-r-md max-w-[700px] mx-auto text-sm sm:text-base animate-fade-in"
            role="alert"
            aria-live="assertive"
          >
            <ErrorIcon />
            <span className="text-nhs-red-dark">{error}</span>
          </div>
        )}

        {/* Language Grid with staggered animation */}
        <form aria-label={t('language.formLabel', 'Language selection')}>
          <fieldset>
            <legend className="sr-only">{t('language.legendLabel', 'Available languages - select one')}</legend>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-[900px] mx-auto
                         transform transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              role="radiogroup"
              aria-label={t('language.radioGroupLabel', 'Available languages')}
            >
              {SUPPORTED_LANGUAGES.map((lang, index) => (
                <LanguageCard
                  key={lang.code}
                  code={lang.code}
                  nativeName={lang.nativeName}
                  englishName={lang.name}
                  direction={lang.direction}
                  fontFamily={lang.fontFamily}
                  isSelected={selectedLanguage === lang.code}
                  isPlaying={playingAudio === lang.code}
                  onSelect={() => handleSelectLanguage(lang.code)}
                  onPlayAudio={(e) => handlePlayAudio(lang.code, e)}
                  index={index}
                />
              ))}
            </div>
          </fieldset>

          {/* Help Text - Enhanced styling */}
          <div
            className={`flex items-center justify-center gap-2 sm:gap-3 p-4 mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-nhs-pale-grey/50
                       rounded-lg border border-nhs-blue/10 text-nhs-blue-dark max-w-[700px] mx-auto text-sm sm:text-base
                       transform transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            aria-live="polite"
          >
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-nhs-blue/10 rounded-full flex items-center justify-center">
              <InfoIcon />
            </div>
            <span>{t('language.sessionNote', 'Your language choice will be remembered for this session')}</span>
          </div>

          {/* Navigation Buttons */}
          <div
            className={`flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-6 border-t border-nhs-pale-grey max-w-[700px] mx-auto
                       transform transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 min-h-[48px] text-nhs-blue
                         transition-all duration-200 hover:bg-nhs-blue/5 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 text-base font-medium"
              aria-label={t('nav.backToHome', 'Go back to home page')}
            >
              <BackIcon />
              {t('language.backToHome', 'Back to Home')}
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={isLoading || !selectedLanguage}
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 min-h-[52px] w-full sm:w-auto sm:min-w-[200px] justify-center
                         bg-nhs-green text-white font-bold rounded-lg text-base sm:text-lg
                         transition-all duration-200 ease-out
                         hover:bg-nhs-green-dark hover:shadow-lg hover:scale-[1.02]
                         focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2
                         disabled:bg-nhs-mid-grey disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                         active:scale-[0.98]"
              aria-label={t('nav.continueWithLanguage', 'Continue with selected language')}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>{t('common.loading', 'Loading...')}</span>
                </>
              ) : (
                <>
                  <span>{t('common.continue', 'Continue')}</span>
                  <ForwardIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/**
 * Props for the LanguageCard component.
 * @interface LanguageCardProps
 * @property {string} code - Language code (e.g., 'en', 'hi')
 * @property {string} nativeName - Language name in native script
 * @property {string} englishName - Language name in English
 * @property {'ltr' | 'rtl'} direction - Text direction
 * @property {string} fontFamily - CSS font family for the language
 * @property {boolean} isSelected - Whether this language is currently selected
 * @property {boolean} isPlaying - Whether audio preview is playing
 * @property {Function} onSelect - Callback when language is selected
 * @property {Function} onPlayAudio - Callback to play audio preview
 * @property {number} [index] - Card index for staggered animations
 */
interface LanguageCardProps {
  code: string;
  nativeName: string;
  englishName: string;
  direction: 'ltr' | 'rtl';
  fontFamily: string;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPlayAudio: (e: React.MouseEvent) => void;
  index?: number;
}

/**
 * Language card component displaying a single language option.
 * Includes native name, English name, selection indicator, and audio preview button.
 *
 * @component
 * @param {LanguageCardProps} props - Component props
 * @returns {JSX.Element} Rendered language card
 */
function LanguageCard({
  code,
  nativeName,
  englishName,
  direction,
  fontFamily,
  isSelected,
  isPlaying,
  onSelect,
  onPlayAudio,
  index = 0,
}: LanguageCardProps) {
  const { t } = useTranslation();

  return (
    <label
      className={`group relative flex flex-col items-center text-center p-4 sm:p-5 min-h-[140px] sm:min-h-[160px]
                  bg-white border-2 rounded-xl cursor-pointer
                  transition-all duration-300 ease-out
                  hover:shadow-lg hover:-translate-y-1
                  focus-within:outline-none focus-within:ring-[3px] focus-within:ring-focus focus-within:ring-offset-2
                  ${isSelected
                    ? 'border-nhs-blue border-[3px] bg-gradient-to-b from-blue-50 to-white shadow-md'
                    : 'border-nhs-pale-grey hover:border-nhs-blue/50'
                  }`}
      data-lang={code}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Hidden Radio Input */}
      <input
        type="radio"
        name="language"
        value={code}
        checked={isSelected}
        onChange={onSelect}
        className="absolute opacity-0 w-full h-full cursor-pointer m-0 top-0 left-0"
        aria-label={t('language.selectLanguageAriaLabel', 'Select {{name}} as your preferred language', { name: englishName })}
      />

      {/* Selected Checkmark with animation */}
      <span
        className={`absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center
                   transition-all duration-300 ${isSelected ? 'bg-nhs-blue scale-100 opacity-100' : 'bg-nhs-pale-grey scale-75 opacity-0'}`}
        aria-hidden="true"
      >
        <CheckIcon />
      </span>

      {/* Language Icon with hover effect */}
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 mb-3 flex items-center justify-center rounded-lg text-base sm:text-lg font-bold
                    transition-all duration-300
                    ${isSelected
                      ? 'bg-nhs-blue text-white shadow-md scale-105'
                      : 'bg-nhs-pale-grey/70 text-nhs-blue group-hover:bg-nhs-blue/10'
                    }`}
        aria-hidden="true"
      >
        {code === 'en' ? <LanguageIcon /> : code.toUpperCase()}
      </div>

      {/* Native Name */}
      <span
        className="text-lg sm:text-xl font-bold text-text-primary mb-0.5 leading-tight"
        style={{ fontFamily, direction }}
      >
        {nativeName}
      </span>

      {/* English Name */}
      <span className="text-xs sm:text-sm text-text-secondary mb-2 sm:mb-3">
        {englishName}
      </span>

      {/* Audio Preview Button */}
      <button
        type="button"
        onClick={onPlayAudio}
        className={`inline-flex items-center gap-2 px-4 py-2 min-h-[44px] text-xs sm:text-sm font-medium
                    border rounded-full z-10 relative touch-manipulation
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2
                    ${isPlaying
                      ? 'bg-nhs-blue text-white border-nhs-blue scale-105'
                      : 'text-nhs-blue border-nhs-blue/50 hover:bg-nhs-blue hover:text-white hover:border-nhs-blue'
                    }`}
        aria-label={t('language.hearPronunciation', 'Hear {{name}} pronunciation', { name: englishName })}
      >
        <AudioIcon />
        <span>{isPlaying ? t('language.playing', 'Playing...') : t('language.listen', 'Listen')}</span>
      </button>
    </label>
  );
}

// ============================================================================
// Icon Components
// ============================================================================

/** Globe icon for language selection header. */
function GlobeIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/** Error icon component for displaying error states. */
function ErrorIcon() {
  return (
    <svg
      className="w-6 h-6 text-nhs-red flex-shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-5 h-5 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function ForwardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

