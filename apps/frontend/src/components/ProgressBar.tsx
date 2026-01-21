import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  showSteps?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  showSteps = false,
  className = '',
  size = 'md',
}: ProgressBarProps) {
  const { t } = useTranslation();
  const percentage = Math.round((current / total) * 100);

  // Responsive heights - slightly larger on mobile for better visibility
  const heights = {
    sm: 'h-1.5 sm:h-1',
    md: 'h-2.5 sm:h-2',
    lg: 'h-3.5 sm:h-3',
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Label - larger text on mobile for readability */}
      {showLabel && (
        <div className="flex flex-wrap justify-between items-center mb-2 gap-1">
          <span className="text-sm sm:text-sm text-text-secondary min-w-0">
            {showSteps
              ? t('progress.stepOfTotal', { current, total })
              : t('progress.percentComplete', { percentage })}
          </span>
          {showSteps && (
            <span className="text-sm font-semibold text-nhs-blue">{percentage}%</span>
          )}
        </div>
      )}

      {/* Progress Track - slightly taller on mobile */}
      <div
        className={clsx(
          'w-full bg-nhs-pale-grey rounded-full overflow-hidden',
          heights[size]
        )}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={t('progress.ariaProgressLabel', { current, total })}
      >
        {/* Progress Fill */}
        <div
          className={clsx(
            'h-full bg-nhs-blue rounded-full transition-all duration-500 ease-out',
            heights[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Indicators - Larger touch targets on mobile, hide on very small screens if many steps */}
      {showSteps && total <= 10 && (
        <div className={clsx(
          'flex justify-between mt-2 sm:mt-2',
          total > 6 ? 'hidden xs:flex' : 'flex'
        )}>
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={clsx(
                'w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-300',
                i < current
                  ? 'bg-nhs-blue'
                  : i === current
                  ? 'bg-nhs-blue/50'
                  : 'bg-nhs-pale-grey'
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  );
}
