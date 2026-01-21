import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  showSteps?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Color variant for the progress bar */
  variant?: 'default' | 'gradient' | 'success';
  /** Whether to show a pulsing animation on the current step */
  animated?: boolean;
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  showSteps = false,
  className = '',
  size = 'md',
  variant = 'default',
  animated = false,
}: ProgressBarProps) {
  const { t } = useTranslation();
  const percentage = Math.round((current / total) * 100);

  // Responsive heights - larger on mobile for better visibility (elderly users)
  const heights = {
    sm: 'h-2 sm:h-1.5',
    md: 'h-3 sm:h-2.5',
    lg: 'h-4 sm:h-3',
  };

  // Fill color variants
  const fillColors = {
    default: 'bg-nhs-blue',
    gradient: 'bg-gradient-to-r from-nhs-blue to-nhs-aqua-green',
    success: percentage === 100 ? 'bg-nhs-green' : 'bg-nhs-blue',
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Label - larger text for readability */}
      {showLabel && (
        <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-3 gap-2">
          <span className="text-sm sm:text-base text-text-secondary font-medium">
            {showSteps
              ? t('progress.stepOfTotal', { current, total })
              : t('progress.percentComplete', { percentage })}
          </span>
          <span
            className={clsx(
              'text-sm sm:text-base font-bold px-2 py-0.5 rounded-full',
              percentage === 100
                ? 'bg-nhs-green/10 text-nhs-green'
                : 'bg-nhs-blue/10 text-nhs-blue'
            )}
          >
            {percentage}%
          </span>
        </div>
      )}

      {/* Progress Track - enhanced visibility */}
      <div
        className={clsx(
          'w-full bg-nhs-pale-grey rounded-full overflow-hidden shadow-inner',
          heights[size]
        )}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={t('progress.ariaProgressLabel', { current, total })}
        aria-describedby={showLabel ? undefined : `progress-${current}-${total}`}
      >
        {/* Progress Fill with animation support */}
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            fillColors[variant],
            animated && percentage < 100 && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="h-full w-full bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* Hidden description for screen readers when no label */}
      {!showLabel && (
        <span id={`progress-${current}-${total}`} className="sr-only">
          {t('progress.ariaProgressLabel', { current, total })}
        </span>
      )}

      {/* Step Indicators - larger and more visible */}
      {showSteps && total <= 10 && (
        <div
          className={clsx(
            'flex justify-between mt-3 sm:mt-4 px-1',
            total > 6 ? 'hidden sm:flex' : 'flex'
          )}
          role="list"
          aria-label={t('progress.stepsLabel', 'Progress steps')}
        >
          {Array.from({ length: total }, (_, i) => {
            const isCompleted = i < current;
            const isCurrent = i === current - 1;
            const isPending = i >= current;

            return (
              <div
                key={i}
                role="listitem"
                className={clsx(
                  'rounded-full transition-all duration-300',
                  // Size - larger for better touch/visibility
                  'w-3 h-3 sm:w-2.5 sm:h-2.5',
                  // Colors
                  isCompleted && 'bg-nhs-blue',
                  isCurrent && 'bg-nhs-blue ring-2 ring-nhs-blue/30 ring-offset-1',
                  isPending && !isCurrent && 'bg-nhs-pale-grey',
                  // Animation for current step
                  isCurrent && animated && 'animate-pulse'
                )}
                aria-label={
                  isCompleted
                    ? t('progress.stepCompleted', { step: i + 1 })
                    : isCurrent
                    ? t('progress.stepCurrent', { step: i + 1 })
                    : t('progress.stepPending', { step: i + 1 })
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
