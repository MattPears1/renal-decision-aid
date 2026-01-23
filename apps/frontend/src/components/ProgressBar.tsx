/**
 * @fileoverview Progress bar component for the NHS Renal Decision Aid.
 * Displays visual progress through multi-step flows with enhanced animations.
 * @module components/ProgressBar
 * @version 2.6.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 */

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

/**
 * Props for the ProgressBar component.
 * @interface ProgressBarProps
 * @property {number} current - Current step/value
 * @property {number} total - Total steps/maximum value
 * @property {boolean} [showLabel=true] - Whether to show percentage label
 * @property {boolean} [showSteps=false] - Whether to show step indicators
 * @property {string} [className=''] - Additional CSS classes
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Size variant
 * @property {'default' | 'gradient' | 'success' | 'journey'} [variant='default'] - Color variant
 * @property {boolean} [animated=false] - Whether to show pulse animation
 * @property {string[]} [stepLabels] - Optional labels for each step
 * @property {boolean} [showMilestones=false] - Whether to show milestone markers
 */
interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  showSteps?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Color variant for the progress bar */
  variant?: 'default' | 'gradient' | 'success' | 'journey';
  /** Whether to show a pulsing animation on the current step */
  animated?: boolean;
  /** Optional labels for each step */
  stepLabels?: string[];
  /** Whether to show milestone markers at 25%, 50%, 75%, 100% */
  showMilestones?: boolean;
}

/**
 * Progress bar component for displaying completion status.
 *
 * Features:
 * - Configurable size (sm, md, lg)
 * - Multiple color variants including journey gradient
 * - Optional percentage label with enhanced styling
 * - Optional step indicators (up to 10) with labels
 * - Animation support with smooth transitions
 * - Milestone markers for visual progress checkpoints
 * - ARIA progressbar role for accessibility
 * - Responsive sizing for mobile
 *
 * @component
 * @param {ProgressBarProps} props - Component props
 * @returns {JSX.Element} The rendered progress bar
 *
 * @example
 * <ProgressBar current={3} total={5} showSteps={true} variant="journey" showMilestones />
 */
export default function ProgressBar({
  current,
  total,
  showLabel = true,
  showSteps = false,
  className = '',
  size = 'md',
  variant = 'default',
  animated = false,
  stepLabels,
  showMilestones = false,
}: ProgressBarProps) {
  const { t } = useTranslation();
  const percentage = Math.round((current / total) * 100);

  // Animate the progress bar on mount
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Responsive heights - larger on mobile for better visibility (elderly users)
  const heights = {
    sm: 'h-2 sm:h-1.5',
    md: 'h-3 sm:h-2.5',
    lg: 'h-5 sm:h-4',
  };

  // Fill color variants
  const fillColors = {
    default: 'bg-nhs-blue',
    gradient: 'bg-gradient-to-r from-nhs-blue to-nhs-aqua-green',
    success: percentage === 100 ? 'bg-nhs-green' : 'bg-nhs-blue',
    journey: 'bg-gradient-to-r from-nhs-blue via-nhs-aqua-green to-nhs-green',
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Label - enhanced with better visual hierarchy */}
      {showLabel && (
        <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-3 gap-2">
          <span className="text-sm sm:text-base text-text-secondary font-medium">
            {showSteps
              ? t('progress.stepOfTotal', { current, total })
              : t('progress.percentComplete', { percentage })}
          </span>
          <span
            className={clsx(
              'text-sm sm:text-base font-bold px-3 py-1 rounded-full transition-all duration-300',
              percentage === 100
                ? 'bg-nhs-green/15 text-nhs-green ring-1 ring-nhs-green/30'
                : percentage >= 75
                ? 'bg-nhs-aqua-green/15 text-nhs-aqua-green ring-1 ring-nhs-aqua-green/30'
                : 'bg-nhs-blue/10 text-nhs-blue'
            )}
          >
            {percentage}%
          </span>
        </div>
      )}

      {/* Progress Track - enhanced with milestone markers */}
      <div className="relative">
        <div
          className={clsx(
            'w-full bg-nhs-pale-grey/80 rounded-full overflow-hidden shadow-inner',
            heights[size]
          )}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={t('progress.ariaProgressLabel', { current, total })}
          aria-describedby={showLabel ? undefined : `progress-${current}-${total}`}
        >
          {/* Progress Fill with smooth animation */}
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden',
              fillColors[variant],
              animated && percentage < 100 && 'animate-pulse'
            )}
            style={{ width: `${displayPercentage}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/5" />
            {variant === 'journey' && (
              <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
          </div>
        </div>

        {/* Milestone markers */}
        {showMilestones && (
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none" aria-hidden="true">
            {[25, 50, 75, 100].map((milestone) => (
              <div
                key={milestone}
                className={clsx(
                  'absolute top-1/2 -translate-y-1/2 w-0.5 transition-colors duration-300',
                  heights[size],
                  percentage >= milestone ? 'bg-white/40' : 'bg-nhs-mid-grey/30'
                )}
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hidden description for screen readers when no label */}
      {!showLabel && (
        <span id={`progress-${current}-${total}`} className="sr-only">
          {t('progress.ariaProgressLabel', { current, total })}
        </span>
      )}

      {/* Step Indicators - enhanced with optional labels */}
      {showSteps && total <= 10 && (
        <div
          className={clsx(
            'flex justify-between mt-4 sm:mt-5 px-1',
            total > 6 && !stepLabels ? 'hidden sm:flex' : 'flex'
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
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={clsx(
                    'rounded-full transition-all duration-300 flex items-center justify-center',
                    // Size - larger for better touch/visibility
                    stepLabels ? 'w-8 h-8 sm:w-7 sm:h-7' : 'w-3.5 h-3.5 sm:w-3 sm:h-3',
                    // Colors with enhanced states
                    isCompleted && 'bg-nhs-blue text-white shadow-sm',
                    isCurrent && 'bg-nhs-blue text-white ring-4 ring-nhs-blue/20 shadow-md',
                    isPending && !isCurrent && 'bg-nhs-pale-grey text-text-muted',
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
                >
                  {stepLabels && (
                    isCompleted ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )
                  )}
                </div>
                {stepLabels && stepLabels[i] && (
                  <span
                    className={clsx(
                      'text-[10px] sm:text-xs font-medium text-center leading-tight max-w-[60px] sm:max-w-[80px]',
                      isCompleted || isCurrent ? 'text-nhs-blue' : 'text-text-muted'
                    )}
                  >
                    {stepLabels[i]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
