import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@renal-decision-aid/shared-types';

export default function LanguageSelectionPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { createSession } = useSession();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        hi: 'hi-IN',
        pa: 'pa-IN',
        bn: 'bn-IN',
        ur: 'ur-PK',
        gu: 'gu-IN',
        ta: 'ta-IN',
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

    try {
      // Change i18n language
      await i18n.changeLanguage(selectedLanguage);

      // Create session with selected language
      await createSession(selectedLanguage);

      // Navigate to disclaimer
      navigate('/disclaimer');
    } catch (err) {
      console.error('Failed to set language:', err);
      setError(t('common.error', 'Something went wrong. Please try again.'));
    }
  };

  return (
    <main className="min-h-screen bg-bg-page">
      <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <header className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            {t('language.title', 'Choose Your Language')}
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            {t('language.instruction', 'Please select your preferred language. You can change this at any time.')}
          </p>
        </header>

        {/* Instruction Text */}
        <p className="text-center text-text-secondary mb-8 max-w-[700px] mx-auto">
          {t('language.changeAnytime', 'Please select the language you would like to use. You can change this at any time using the language button at the top of the screen.')}
        </p>

        {/* Error Message */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 mb-6 bg-red-50 border-l-4 border-nhs-red rounded-r-md max-w-[700px] mx-auto"
            role="alert"
            aria-live="assertive"
          >
            <ErrorIcon />
            <span className="text-nhs-red-dark">{error}</span>
          </div>
        )}

        {/* Language Grid */}
        <form aria-label={t('language.formLabel', 'Language selection')}>
          <fieldset>
            <legend className="sr-only">{t('language.legendLabel', 'Available languages - select one')}</legend>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8"
              role="radiogroup"
              aria-label={t('language.radioGroupLabel', 'Available languages')}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
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
                />
              ))}
            </div>
          </fieldset>

          {/* Help Text */}
          <div
            className="flex items-center justify-center gap-2 p-4 mb-8 bg-blue-50 rounded-md text-nhs-blue-dark max-w-[700px] mx-auto"
            aria-live="polite"
          >
            <InfoIcon />
            <span>{t('language.sessionNote', 'Your language choice will be remembered for this session')}</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-nhs-pale-grey max-w-[700px] mx-auto">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 text-nhs-blue hover:underline
                         focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded"
              aria-label={t('nav.backToHome', 'Go back to home page')}
            >
              <BackIcon />
              {t('language.backToHome', 'Back to Home')}
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center gap-2 px-8 py-3 min-w-[200px] justify-center
                         bg-nhs-green text-white font-bold rounded-md text-lg
                         transition-colors duration-150
                         hover:bg-nhs-green-dark
                         focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2
                         disabled:bg-nhs-mid-grey disabled:cursor-not-allowed"
              aria-label={t('nav.continueWithLanguage', 'Continue with selected language')}
            >
              {t('common.continue', 'Continue')}
              <ForwardIcon />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

// Language Card Component
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
}

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
}: LanguageCardProps) {
  const { t } = useTranslation();

  return (
    <label
      className={`relative flex flex-col items-center text-center p-6 min-h-[180px]
                  bg-white border-2 rounded-lg cursor-pointer
                  transition-all duration-200
                  hover:border-nhs-blue hover:shadow-md hover:-translate-y-0.5
                  focus-within:outline-none focus-within:ring-[3px] focus-within:ring-focus focus-within:ring-offset-2
                  ${isSelected
                    ? 'border-nhs-blue border-[3px] bg-blue-50'
                    : 'border-nhs-pale-grey'
                  }`}
      data-lang={code}
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

      {/* Selected Checkmark */}
      {isSelected && (
        <span
          className="absolute top-2 right-2 w-7 h-7 bg-nhs-blue rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <CheckIcon />
        </span>
      )}

      {/* Language Icon */}
      <div
        className={`w-12 h-12 mb-4 flex items-center justify-center rounded-md text-xl font-bold
                    ${isSelected ? 'bg-nhs-blue text-white' : 'bg-nhs-pale-grey text-nhs-blue'}`}
        aria-hidden="true"
      >
        {code === 'en' ? <LanguageIcon /> : code.toUpperCase()}
      </div>

      {/* Native Name */}
      <span
        className="text-2xl font-bold text-text-primary mb-1 leading-tight"
        style={{ fontFamily, direction }}
      >
        {nativeName}
      </span>

      {/* English Name */}
      <span className="text-base text-text-secondary mb-4">
        {englishName}
      </span>

      {/* Audio Preview Button */}
      <button
        type="button"
        onClick={onPlayAudio}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                    border rounded-full z-10 relative
                    transition-colors duration-150
                    focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2
                    ${isPlaying
                      ? 'bg-nhs-blue text-white border-nhs-blue'
                      : 'text-nhs-blue border-nhs-blue hover:bg-nhs-blue hover:text-white'
                    }`}
        aria-label={t('language.hearPronunciation', 'Hear {{name}} pronunciation', { name: englishName })}
      >
        <AudioIcon />
        <span>{t('language.listen', 'Listen')}</span>
      </button>
    </label>
  );
}

// Icon Components
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

function ForwardIcon() {
  return (
    <svg
      className="w-5 h-5"
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
