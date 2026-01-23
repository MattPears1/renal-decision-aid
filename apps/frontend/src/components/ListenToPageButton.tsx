import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type ListenState = 'idle' | 'playing';

export default function ListenToPageButton() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<ListenState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cancel speech on unmount or route change
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setState('idle');
  }, []);

  const handleListen = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    if (state === 'playing') {
      handleStop();
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const pageText = mainContent.innerText?.trim();
    if (!pageText) return;

    const utterance = new SpeechSynthesisUtterance(pageText);
    utterance.lang = i18n.language || 'en';
    utterance.rate = 1.0;

    // Select best available female voice
    const voices = window.speechSynthesis.getVoices();
    const lang = i18n.language || 'en';
    const bestVoice = voices.find(v =>
      v.lang.startsWith(lang) && v.name.includes('Google') && v.name.includes('Female')
    ) || voices.find(v =>
      v.lang.startsWith(lang) && (v.name.includes('Zira') || v.name.includes('Hazel') || v.name.includes('Natural'))
    ) || voices.find(v =>
      v.lang.startsWith(lang) && !v.localService
    ) || voices.find(v =>
      v.lang.startsWith(lang)
    );
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setState('playing');
  }, [state, i18n.language, handleStop]);

  const isActive = state === 'playing';

  return (
    <button
      type="button"
      onClick={handleListen}
      className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center justify-center gap-2
                 min-w-[44px] min-h-[44px] px-3 py-2.5 sm:px-4
                 border-2 rounded-md
                 text-sm font-semibold shadow-md
                 transition-colors duration-fast z-[300] touch-manipulation
                 focus:outline-none focus:ring-[3px] focus:ring-focus focus:bg-focus focus:text-text-primary
                 active:scale-95
                 ${isActive
                   ? 'bg-nhs-blue border-nhs-blue text-white hover:bg-nhs-dark-blue'
                   : 'bg-bg-surface border-nhs-blue text-nhs-blue hover:bg-nhs-blue hover:text-white'
                 }`}
      aria-label={isActive ? t('privacy.stopReading') : t('accessibility.listenToPage')}
      title={isActive ? t('privacy.stopReading') : t('accessibility.listenToPage')}
    >
      {isActive ? (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
      <span className="hidden sm:inline">
        {isActive ? t('privacy.stopReading') : t('common.listenToPage')}
      </span>
    </button>
  );
}
