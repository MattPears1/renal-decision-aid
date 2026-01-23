import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type ListenState = 'idle' | 'loading' | 'playing';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006';

export default function ListenToPageButton() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<ListenState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const handleStop = useCallback(() => {
    cleanup();
    setState('idle');
  }, [cleanup]);

  const handleListen = useCallback(async () => {
    if (state === 'playing' || state === 'loading') {
      handleStop();
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const pageText = mainContent.innerText?.trim();
    if (!pageText) return;

    setState('loading');

    try {
      const response = await fetch(`${API_BASE}/api/synthesize/page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pageText,
          language: i18n.language,
        }),
      });

      if (!response.ok) {
        throw new Error('Synthesis failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setState('idle');
        cleanup();
      };

      audio.onerror = () => {
        setState('idle');
        cleanup();
      };

      await audio.play();
      setState('playing');
    } catch {
      setState('idle');
      cleanup();
    }
  }, [state, i18n.language, handleStop, cleanup]);

  const isActive = state === 'playing' || state === 'loading';

  return (
    <button
      type="button"
      onClick={handleListen}
      disabled={state === 'loading'}
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
                 }
                 ${state === 'loading' ? 'opacity-75 cursor-wait' : ''}`}
      aria-label={isActive ? t('privacy.stopReading') : t('accessibility.listenToPage')}
      title={isActive ? t('privacy.stopReading') : t('accessibility.listenToPage')}
    >
      {state === 'loading' ? (
        <svg className="w-5 h-5 flex-shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : isActive ? (
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
