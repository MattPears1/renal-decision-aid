import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface StickyProgressIndicatorProps {
  /** Current step (1-indexed) */
  current: number;
  /** Total number of steps */
  total: number;
  /** Array of step labels (optional) */
  steps?: string[];
  /** Whether to show step count text */
  showStepCount?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * StickyProgressIndicator Component
 *
 * A fixed progress bar at the top of the screen showing journey completion.
 * Designed for elderly users with clear visual feedback and accessible labels.
 */
export default function StickyProgressIndicator({
  current,
  total,
  steps,
  showStepCount = true,
  className,
}: StickyProgressIndicatorProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const percentage = Math.round((current / total) * 100);

  // Show progress bar after slight scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={clsx(
        'fixed top-0 left-0 right-0 z-[400]',
        'transition-all duration-300 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full',
        className
      )}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={t('progress.ariaProgressLabel', { current, total })}
    >
      {/* Progress bar track */}
      <div className="h-1.5 sm:h-2 bg-nhs-pale-grey">
        {/* Progress bar fill */}
        <div
          className="h-full bg-gradient-to-r from-nhs-blue to-nhs-aqua-green transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Optional step count indicator */}
      {showStepCount && (
        <div
          className={clsx(
            'bg-white/95 backdrop-blur-sm border-b border-nhs-pale-grey',
            'px-4 py-2',
            'flex items-center justify-between',
            'text-xs sm:text-sm'
          )}
        >
          <div className="flex items-center gap-2">
            {/* Step indicator dots */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: total }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-2 h-2 rounded-full transition-colors duration-300',
                    i < current
                      ? 'bg-nhs-blue'
                      : i === current - 1
                      ? 'bg-nhs-blue ring-2 ring-nhs-blue/30'
                      : 'bg-nhs-pale-grey'
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Current step label */}
            {steps && steps[current - 1] && (
              <span className="text-text-secondary font-medium">
                {steps[current - 1]}
              </span>
            )}
          </div>

          {/* Progress text */}
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">
              {t('progress.stepOfTotal', { current, total })}
            </span>
            <span className="font-bold text-nhs-blue">{percentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
