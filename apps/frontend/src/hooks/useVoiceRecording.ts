import { useState, useCallback, useRef, useEffect } from 'react';

export type RecordingState = 'idle' | 'requesting' | 'recording' | 'processing' | 'error';

export interface VoiceRecordingError {
  code: 'PERMISSION_DENIED' | 'NOT_SUPPORTED' | 'NO_AUDIO' | 'TRANSCRIPTION_FAILED' | 'UNKNOWN';
  message: string;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export interface UseVoiceRecordingOptions {
  /** API endpoint for transcription */
  transcribeEndpoint?: string;
  /** Language hint for transcription */
  language?: string;
  /** Maximum recording duration in seconds */
  maxDuration?: number;
  /** Callback when transcription is successful */
  onTranscription?: (result: TranscriptionResult) => void;
  /** Callback when an error occurs */
  onError?: (error: VoiceRecordingError) => void;
}

export interface UseVoiceRecordingReturn {
  /** Current recording state */
  state: RecordingState;
  /** Whether the browser supports voice recording */
  isSupported: boolean;
  /** Whether microphone permission has been granted */
  hasPermission: boolean | null;
  /** Start recording */
  startRecording: () => Promise<void>;
  /** Stop recording and transcribe */
  stopRecording: () => Promise<TranscriptionResult | null>;
  /** Cancel recording without transcribing */
  cancelRecording: () => void;
  /** Current error if any */
  error: VoiceRecordingError | null;
  /** Audio level (0-1) for visualization */
  audioLevel: number;
  /** Recording duration in seconds */
  duration: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006';

/**
 * Custom hook for voice recording and transcription
 *
 * Features:
 * - MediaRecorder API for audio capture
 * - Audio level monitoring for visualization
 * - Automatic transcription via OpenAI Whisper
 * - Permission handling
 * - Error management
 */
export function useVoiceRecording(options: UseVoiceRecordingOptions = {}): UseVoiceRecordingReturn {
  const {
    transcribeEndpoint = `${API_BASE}/api/transcribe`,
    language,
    maxDuration = 120, // 2 minutes max
    onTranscription,
    onError,
  } = options;

  const [state, setState] = useState<RecordingState>('idle');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<VoiceRecordingError | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check if browser supports voice recording
  const isSupported = typeof window !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices &&
    'MediaRecorder' in window;

  // Clean up function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    audioChunksRef.current = [];
    setAudioLevel(0);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Monitor audio levels for visualization
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = Math.min(1, average / 128); // Normalize to 0-1

    setAudioLevel(normalizedLevel);
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const err: VoiceRecordingError = {
        code: 'NOT_SUPPORTED',
        message: 'Voice recording is not supported in this browser',
      };
      setError(err);
      onError?.(err);
      return;
    }

    setError(null);
    setState('requesting');

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setHasPermission(true);
      streamRef.current = stream;

      // Set up audio analysis for level monitoring
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setState('recording');
      startTimeRef.current = Date.now();

      // Start monitoring audio levels
      monitorAudioLevel();

      // Start duration timer
      durationIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

    } catch (err) {
      cleanup();

      let voiceError: VoiceRecordingError;

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setHasPermission(false);
          voiceError = {
            code: 'PERMISSION_DENIED',
            message: 'Microphone permission was denied. Please allow access to use voice input.',
          };
        } else if (err.name === 'NotFoundError') {
          voiceError = {
            code: 'NO_AUDIO',
            message: 'No microphone was found. Please connect a microphone and try again.',
          };
        } else {
          voiceError = {
            code: 'UNKNOWN',
            message: `Recording failed: ${err.message}`,
          };
        }
      } else {
        voiceError = {
          code: 'UNKNOWN',
          message: 'An unexpected error occurred while starting recording.',
        };
      }

      setError(voiceError);
      setState('error');
      onError?.(voiceError);
    }
  }, [isSupported, maxDuration, monitorAudioLevel, cleanup, onError]);

  // Stop recording and transcribe
  const stopRecording = useCallback(async (): Promise<TranscriptionResult | null> => {
    if (!mediaRecorderRef.current || state !== 'recording') {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = async () => {
        setState('processing');

        // Stop monitoring
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        // Check if we have audio data
        if (audioChunksRef.current.length === 0) {
          const err: VoiceRecordingError = {
            code: 'NO_AUDIO',
            message: 'No audio was recorded. Please try again.',
          };
          setError(err);
          setState('error');
          onError?.(err);
          cleanup();
          resolve(null);
          return;
        }

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        // Transcribe the audio
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          if (language) {
            formData.append('language', language);
          }

          const response = await fetch(transcribeEndpoint, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Transcription failed');
          }

          const result: TranscriptionResult = await response.json();

          setState('idle');
          setDuration(0);
          cleanup();
          onTranscription?.(result);
          resolve(result);

        } catch (err) {
          const voiceError: VoiceRecordingError = {
            code: 'TRANSCRIPTION_FAILED',
            message: err instanceof Error ? err.message : 'Failed to transcribe audio',
          };
          setError(voiceError);
          setState('error');
          onError?.(voiceError);
          cleanup();
          resolve(null);
        }
      };

      // Stop the media recorder
      mediaRecorder.stop();

      // Stop the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    });
  }, [state, language, transcribeEndpoint, cleanup, onTranscription, onError]);

  // Cancel recording without transcribing
  const cancelRecording = useCallback(() => {
    cleanup();
    setState('idle');
    setDuration(0);
    setError(null);
  }, [cleanup]);

  return {
    state,
    isSupported,
    hasPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    audioLevel,
    duration,
  };
}

export default useVoiceRecording;
