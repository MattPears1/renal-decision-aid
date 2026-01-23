/**
 * @fileoverview Voice control components for the NHS Renal Decision Aid.
 * Provides microphone, speaker, and audio visualization components.
 * @module components/VoiceControls
 * @version 2.5.0
 * @since 2.0.0
 * @lastModified 21 January 2026
 */

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import type { RecordingState, VoiceRecordingError } from '@/hooks/useVoiceRecording';
import type { SpeechState, TextToSpeechError } from '@/hooks/useTextToSpeech';

// ============================================================================
// MICROPHONE BUTTON COMPONENT
// ============================================================================

/**
 * Props for the MicrophoneButton component.
 * @interface MicrophoneButtonProps
 * @property {RecordingState} recordingState - Current recording state
 * @property {boolean} isSupported - Whether voice recording is supported
 * @property {() => void} onClick - Click handler to toggle recording
 * @property {number} [audioLevel] - Audio level for visualization (0-1)
 * @property {number} [duration] - Recording duration in seconds
 * @property {VoiceRecordingError | null} [error] - Current error
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Size variant
 * @property {string} [className=''] - Additional CSS classes
 */
export interface MicrophoneButtonProps {
  /** Current recording state */
  recordingState: RecordingState;
  /** Whether voice recording is supported */
  isSupported: boolean;
  /** Click handler to toggle recording */
  onClick: () => void;
  /** Audio level for visualization (0-1) */
  audioLevel?: number;
  /** Recording duration in seconds */
  duration?: number;
  /** Current error */
  error?: VoiceRecordingError | null;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Microphone button component for voice recording.
 *
 * Features:
 * - Visual states for recording, processing, error
 * - Audio level ring visualization
 * - Recording duration display
 * - Accessible labels and ARIA attributes
 *
 * @component
 * @param {MicrophoneButtonProps} props - Component props
 * @returns {JSX.Element} The rendered microphone button
 */
export function MicrophoneButton({
  recordingState,
  isSupported,
  onClick,
  audioLevel = 0,
  duration = 0,
  error,
  size = 'md',
  className = '',
}: MicrophoneButtonProps) {
  const { t } = useTranslation();

  const isRecording = recordingState === 'recording';
  const isProcessing = recordingState === 'processing';
  const isRequesting = recordingState === 'requesting';
  const hasError = recordingState === 'error';
  const isDisabled = !isSupported || isProcessing || isRequesting;

  // Size classes - enhanced for better touch targets
  const sizeClasses = {
    sm: 'w-9 h-9 min-w-[36px] min-h-[36px]',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px]',
    lg: 'w-14 h-14 min-w-[56px] min-h-[56px]',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get button label
  const getLabel = () => {
    if (!isSupported) return t('chat.voice.notSupported', 'Voice input not supported');
    if (isProcessing) return t('chat.voice.processing', 'Processing...');
    if (isRequesting) return t('chat.voice.requesting', 'Requesting permission...');
    if (isRecording) return t('chat.voice.stopRecording', 'Stop recording');
    if (hasError) return error?.message || t('chat.voice.error', 'Error');
    return t('chat.voice.startRecording', 'Start voice input');
  };

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={getLabel()}
        aria-pressed={isRecording}
        className={`
          relative flex items-center justify-center rounded-full transition-all duration-200 touch-manipulation
          focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2
          ${sizeClasses[size]}
          ${isRecording
            ? 'bg-nhs-red text-white hover:bg-nhs-red/90 animate-recording-pulse shadow-lg shadow-nhs-red/30'
            : hasError
              ? 'bg-nhs-red/10 text-nhs-red hover:bg-nhs-red/20 border border-nhs-red/30'
              : 'bg-nhs-blue/10 text-nhs-blue hover:bg-nhs-blue/20 hover:scale-105 active:scale-95'
          }
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Audio level ring visualization - enhanced */}
        {isRecording && (
          <>
            <span
              className="absolute inset-0 rounded-full border-2 border-nhs-red"
              style={{
                transform: `scale(${1 + audioLevel * 0.4})`,
                opacity: Math.max(0.2, audioLevel * 0.8),
                transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
              }}
              aria-hidden="true"
            />
            <span
              className="absolute inset-0 rounded-full border border-nhs-red/50"
              style={{
                transform: `scale(${1.2 + audioLevel * 0.3})`,
                opacity: Math.max(0.1, audioLevel * 0.5),
                transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
              }}
              aria-hidden="true"
            />
          </>
        )}

        {/* Icon */}
        {isProcessing || isRequesting ? (
          <LoadingSpinner className={iconSizes[size]} />
        ) : isRecording ? (
          <StopIcon className={iconSizes[size]} />
        ) : (
          <MicIcon className={iconSizes[size]} />
        )}
      </button>

      {/* Recording duration badge - enhanced */}
      {isRecording && duration > 0 && (
        <span className="text-xs font-mono font-semibold text-nhs-red bg-nhs-red/10 px-2 py-0.5 rounded-full" aria-live="polite">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// SPEAKER BUTTON COMPONENT
// ============================================================================

/**
 * Props for the SpeakerButton component.
 * @interface SpeakerButtonProps
 * @property {SpeechState} speechState - Current speech state
 * @property {() => void} onClick - Click handler for play/pause/stop
 * @property {number} [progress] - Playback progress (0-1)
 * @property {TextToSpeechError | null} [error] - Current error
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Size variant
 * @property {string} [className=''] - Additional CSS classes
 */
export interface SpeakerButtonProps {
  /** Current speech state */
  speechState: SpeechState;
  /** Click handler - primary action (play/pause/stop) */
  onClick: () => void;
  /** Playback progress (0-1) */
  progress?: number;
  /** Current error */
  error?: TextToSpeechError | null;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Speaker button component for text-to-speech playback.
 *
 * Features:
 * - Visual states for playing, paused, loading, error
 * - Progress ring visualization
 * - Accessible labels and ARIA attributes
 *
 * @component
 * @param {SpeakerButtonProps} props - Component props
 * @returns {JSX.Element} The rendered speaker button
 */
export function SpeakerButton({
  speechState,
  onClick,
  progress = 0,
  error,
  size = 'md',
  className = '',
}: SpeakerButtonProps) {
  const { t } = useTranslation();

  const isPlaying = speechState === 'playing';
  const isPaused = speechState === 'paused';
  const isLoading = speechState === 'loading';
  const hasError = speechState === 'error';
  const isActive = isPlaying || isPaused || isLoading;

  // Size classes - enhanced for better touch targets
  const sizeClasses = {
    sm: 'w-8 h-8 min-w-[32px] min-h-[32px]',
    md: 'w-10 h-10 min-w-[40px] min-h-[40px]',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px]',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Get button label
  const getLabel = () => {
    if (isLoading) return t('chat.voice.loading', 'Loading audio...');
    if (isPlaying) return t('chat.voice.pauseResponse', 'Pause');
    if (isPaused) return t('chat.voice.resumeResponse', 'Resume');
    if (hasError) return error?.message || t('chat.voice.error', 'Error');
    return t('chat.voice.playResponse', 'Play response');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-label={getLabel()}
      aria-pressed={isPlaying}
      className={`
        relative flex items-center justify-center rounded-full transition-all duration-200 touch-manipulation
        focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1
        ${sizeClasses[size]}
        ${isPlaying
          ? 'bg-nhs-green text-white hover:bg-nhs-green/90 shadow-md shadow-nhs-green/20'
          : isPaused
            ? 'bg-nhs-blue text-white hover:bg-nhs-blue/90 shadow-md shadow-nhs-blue/20'
            : hasError
              ? 'bg-nhs-red/10 text-nhs-red hover:bg-nhs-red/20 border border-nhs-red/30'
              : 'bg-nhs-pale-grey text-nhs-dark-grey hover:bg-nhs-mid-grey/30 hover:scale-105 active:scale-95'
        }
        ${isLoading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Progress ring - enhanced with smoother animation */}
      {isActive && !hasError && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={`${progress * 100} 100`}
            strokeLinecap="round"
            className="transition-all duration-150 ease-linear"
          />
        </svg>
      )}

      {/* Icon */}
      {isLoading ? (
        <LoadingSpinner className={iconSizes[size]} />
      ) : isPlaying ? (
        <PauseIcon className={iconSizes[size]} />
      ) : isPaused ? (
        <PlayIcon className={iconSizes[size]} />
      ) : (
        <SpeakerIcon className={iconSizes[size]} />
      )}
    </button>
  );
}

// ============================================================================
// VOICE STATUS INDICATOR
// ============================================================================

/**
 * Props for the VoiceStatusIndicator component.
 * @interface VoiceStatusIndicatorProps
 * @property {RecordingState} [recordingState] - Current recording state
 * @property {SpeechState} [speechState] - Current speech state
 * @property {string} [className=''] - Additional CSS classes
 */
export interface VoiceStatusIndicatorProps {
  /** Current recording state */
  recordingState?: RecordingState;
  /** Current speech state */
  speechState?: SpeechState;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Voice status indicator showing current recording/speech state.
 * Displays contextual text with optional pulse animation.
 *
 * @component
 * @param {VoiceStatusIndicatorProps} props - Component props
 * @returns {JSX.Element | null} The rendered indicator or null if inactive
 */
export function VoiceStatusIndicator({
  recordingState,
  speechState,
  className = '',
}: VoiceStatusIndicatorProps) {
  const { t } = useTranslation();

  // Determine what status to show
  const isRecording = recordingState === 'recording';
  const isProcessing = recordingState === 'processing';
  const isRequesting = recordingState === 'requesting';
  const isSpeaking = speechState === 'playing';
  const isLoadingAudio = speechState === 'loading';

  if (!isRecording && !isProcessing && !isRequesting && !isSpeaking && !isLoadingAudio) {
    return null;
  }

  let statusText: string;
  let statusColor: string;
  let showPulse = false;

  if (isRecording) {
    statusText = t('chat.voice.listening', 'Listening...');
    statusColor = 'text-nhs-red';
    showPulse = true;
  } else if (isProcessing) {
    statusText = t('chat.voice.processing', 'Processing...');
    statusColor = 'text-nhs-blue';
  } else if (isRequesting) {
    statusText = t('chat.voice.requesting', 'Requesting permission...');
    statusColor = 'text-nhs-blue';
  } else if (isLoadingAudio) {
    statusText = t('chat.voice.loadingAudio', 'Loading audio...');
    statusColor = 'text-nhs-blue';
  } else if (isSpeaking) {
    statusText = t('chat.voice.speaking', 'Speaking...');
    statusColor = 'text-nhs-green';
    showPulse = true;
  } else {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${statusColor} ${className}`}>
      {showPulse && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current" />
        </span>
      )}
      {!showPulse && <LoadingSpinner className="w-3.5 h-3.5" />}
      <span>{statusText}</span>
    </div>
  );
}

// ============================================================================
// AUDIO WAVEFORM VISUALIZER
// ============================================================================

/**
 * Props for the AudioWaveform component.
 * @interface AudioWaveformProps
 * @property {number} level - Audio level (0-1)
 * @property {boolean} isActive - Whether actively recording/playing
 * @property {number} [bars=5] - Number of bars to display
 * @property {number} [height=24] - Height of the waveform
 * @property {'recording' | 'playing' | 'idle'} [variant='idle'] - Color variant
 * @property {string} [className=''] - Additional CSS classes
 */
export interface AudioWaveformProps {
  /** Audio level (0-1) */
  level: number;
  /** Whether actively recording/playing */
  isActive: boolean;
  /** Number of bars to display */
  bars?: number;
  /** Height of the waveform */
  height?: number;
  /** Color variant */
  variant?: 'recording' | 'playing' | 'idle';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Audio waveform visualizer component.
 * Displays animated bars based on audio level.
 *
 * @component
 * @param {AudioWaveformProps} props - Component props
 * @returns {JSX.Element} The rendered waveform visualization
 */
export function AudioWaveform({
  level,
  isActive,
  bars = 5,
  height = 24,
  variant = 'idle',
  className = '',
}: AudioWaveformProps) {
  const [barHeights, setBarHeights] = useState<number[]>(new Array(bars).fill(0.2));

  // Animate bars based on level
  useEffect(() => {
    if (!isActive) {
      setBarHeights(new Array(bars).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setBarHeights(prev =>
        prev.map(() => {
          const base = level * 0.7;
          const randomVariation = Math.random() * 0.3;
          return Math.max(0.15, Math.min(1, base + randomVariation));
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [level, isActive, bars]);

  const colorClasses = {
    recording: 'bg-nhs-red',
    playing: 'bg-nhs-green',
    idle: 'bg-nhs-mid-grey',
  };

  return (
    <div
      className={`flex items-center justify-center gap-0.5 ${className}`}
      style={{ height }}
      role="presentation"
      aria-hidden="true"
    >
      {barHeights.map((barHeight, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-100 ${colorClasses[variant]}`}
          style={{
            height: `${barHeight * 100}%`,
            opacity: isActive ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

/** Microphone icon for recording buttons. */
function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
    </svg>
  );
}

/** Stop icon for stopping recording. */
function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  );
}

/** Speaker icon for audio playback buttons. */
function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );
}

/** Play icon for resuming playback. */
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

/** Pause icon for pausing playback. */
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  );
}

/** Loading spinner for processing states. */
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Export all components
export default {
  MicrophoneButton,
  SpeakerButton,
  VoiceStatusIndicator,
  AudioWaveform,
};
