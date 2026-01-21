import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import type { RecordingState, VoiceRecordingError } from '@/hooks/useVoiceRecording';
import type { SpeechState, TextToSpeechError } from '@/hooks/useTextToSpeech';

// ============================================
// MICROPHONE BUTTON COMPONENT
// ============================================

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

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
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
          relative flex items-center justify-center rounded-full transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2
          ${sizeClasses[size]}
          ${isRecording
            ? 'bg-nhs-red text-white hover:bg-nhs-red/90 animate-pulse'
            : hasError
              ? 'bg-nhs-red/10 text-nhs-red hover:bg-nhs-red/20'
              : 'bg-nhs-blue/10 text-nhs-blue hover:bg-nhs-blue/20'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Audio level ring visualization */}
        {isRecording && (
          <span
            className="absolute inset-0 rounded-full border-2 border-nhs-red animate-ping"
            style={{ transform: `scale(${1 + audioLevel * 0.3})`, opacity: 0.6 }}
          />
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

      {/* Recording duration badge */}
      {isRecording && duration > 0 && (
        <span className="text-xs font-mono text-nhs-red animate-pulse">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}

// ============================================
// SPEAKER BUTTON COMPONENT
// ============================================

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

  // Size classes
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
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
        relative flex items-center justify-center rounded-full transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1
        ${sizeClasses[size]}
        ${isPlaying
          ? 'bg-nhs-green text-white hover:bg-nhs-green/90'
          : isPaused
            ? 'bg-nhs-blue text-white hover:bg-nhs-blue/90'
            : hasError
              ? 'bg-nhs-red/10 text-nhs-red hover:bg-nhs-red/20'
              : 'bg-nhs-pale-grey text-nhs-dark-grey hover:bg-nhs-mid-grey/30'
        }
        ${isLoading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Progress ring */}
      {isActive && !hasError && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${progress * 100} 100`}
            strokeLinecap="round"
            className="transition-all duration-100"
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

// ============================================
// VOICE STATUS INDICATOR
// ============================================

export interface VoiceStatusIndicatorProps {
  /** Current recording state */
  recordingState?: RecordingState;
  /** Current speech state */
  speechState?: SpeechState;
  /** Additional CSS classes */
  className?: string;
}

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

// ============================================
// AUDIO WAVEFORM VISUALIZER
// ============================================

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

// ============================================
// ICON COMPONENTS
// ============================================

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  );
}

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
