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

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">
            {showSteps
              ? t('progress.stepOfTotal', { current, total })
              : t('progress.percentComplete', { percentage })}
          </span>
          {showSteps && (
            <span className="text-sm font-medium text-nhs-blue">{percentage}%</span>
          )}
        </div>
      )}

      {/* Progress Track */}
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

      {/* Step Indicators */}
      {showSteps && total <= 10 && (
        <div className="flex justify-between mt-2">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors duration-300',
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
