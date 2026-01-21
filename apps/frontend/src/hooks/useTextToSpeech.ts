import { useState, useCallback, useRef, useEffect } from 'react';

export type SpeechState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface TextToSpeechError {
  code: 'SYNTHESIS_FAILED' | 'PLAYBACK_FAILED' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
}

export interface UseTextToSpeechOptions {
  /** API endpoint for text-to-speech */
  synthesizeEndpoint?: string;
  /** Target language code */
  language?: string;
  /** Voice to use (alloy, nova, shimmer, echo, fable, onyx) */
  voice?: string;
  /** Model to use (tts-1 or tts-1-hd) */
  model?: 'tts-1' | 'tts-1-hd';
  /** Playback speed (0.25 to 4.0) */
  speed?: number;
  /** Callback when speech starts */
  onStart?: () => void;
  /** Callback when speech ends */
  onEnd?: () => void;
  /** Callback when an error occurs */
  onError?: (error: TextToSpeechError) => void;
}

export interface UseTextToSpeechReturn {
  /** Current speech state */
  state: SpeechState;
  /** Speak the provided text */
  speak: (text: string) => Promise<void>;
  /** Pause playback */
  pause: () => void;
  /** Resume playback */
  resume: () => void;
  /** Stop playback */
  stop: () => void;
  /** Toggle between playing and paused */
  toggle: () => void;
  /** Current error if any */
  error: TextToSpeechError | null;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Current playback progress (0-1) */
  progress: number;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006';

/**
 * Custom hook for text-to-speech synthesis and playback
 *
 * Features:
 * - OpenAI TTS API integration
 * - Multiple voice options
 * - Playback controls (play, pause, stop)
 * - Progress tracking
 * - Audio caching
 */
export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const {
    synthesizeEndpoint = `${API_BASE}/api/synthesize`,
    language,
    voice,
    model = 'tts-1',
    speed = 1.0,
    onStart,
    onEnd,
    onError,
  } = options;

  const [state, setState] = useState<SpeechState>('idle');
  const [error, setError] = useState<TextToSpeechError | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check if currently playing
  const isPlaying = state === 'playing';

  // Clean up audio resources
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
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

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Update progress during playback
  const updateProgress = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    if (audio.duration && !isNaN(audio.duration)) {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
      setProgress(audio.currentTime / audio.duration);
    }

    if (state === 'playing') {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [state]);

  // Speak the provided text
  const speak = useCallback(async (text: string): Promise<void> => {
    // Stop any current playback
    cleanup();

    if (!text || text.trim().length === 0) {
      return;
    }

    setError(null);
    setState('loading');
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    try {
      // Call the TTS API
      const response = await fetch(synthesizeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          language,
          voice,
          model,
          speed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Speech synthesis failed');
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.onplay = () => {
        setState('playing');
        onStart?.();
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      };

      audio.onpause = () => {
        if (audio.currentTime < audio.duration) {
          setState('paused');
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      audio.onended = () => {
        setState('idle');
        setProgress(1);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        onEnd?.();
      };

      audio.onerror = () => {
        const playbackError: TextToSpeechError = {
          code: 'PLAYBACK_FAILED',
          message: 'Failed to play audio',
        };
        setError(playbackError);
        setState('error');
        onError?.(playbackError);
      };

      // Start playback
      await audio.play();

    } catch (err) {
      let ttsError: TextToSpeechError;

      if (err instanceof TypeError && err.message.includes('fetch')) {
        ttsError = {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to the speech service. Please check your connection.',
        };
      } else {
        ttsError = {
          code: 'SYNTHESIS_FAILED',
          message: err instanceof Error ? err.message : 'Speech synthesis failed',
        };
      }

      setError(ttsError);
      setState('error');
      onError?.(ttsError);
    }
  }, [synthesizeEndpoint, language, voice, model, speed, cleanup, updateProgress, onStart, onEnd, onError]);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current && state === 'playing') {
      audioRef.current.pause();
    }
  }, [state]);

  // Resume playback
  const resume = useCallback(() => {
    if (audioRef.current && state === 'paused') {
      audioRef.current.play();
    }
  }, [state]);

  // Stop playback
  const stop = useCallback(() => {
    cleanup();
    setState('idle');
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [cleanup]);

  // Toggle between playing and paused
  const toggle = useCallback(() => {
    if (state === 'playing') {
      pause();
    } else if (state === 'paused') {
      resume();
    }
  }, [state, pause, resume]);

  return {
    state,
    speak,
    pause,
    resume,
    stop,
    toggle,
    error,
    isPlaying,
    progress,
    currentTime,
    duration,
  };
}

export default useTextToSpeech;
