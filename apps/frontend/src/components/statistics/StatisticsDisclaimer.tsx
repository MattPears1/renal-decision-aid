/**
 * @fileoverview Statistics disclaimer component.
 * Displays an important notice that statistics are population-level data
 * and should not be interpreted as individual predictions.
 *
 * @module components/statistics/StatisticsDisclaimer
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

import { useTranslation } from 'react-i18next';

interface StatisticsDisclaimerProps {
  /** Visual variant */
  variant?: 'banner' | 'inline';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Disclaimer component informing users that statistics represent
 * population-level data, not individual predictions.
 *
 * @component
 * @param {StatisticsDisclaimerProps} props - Component props
 * @returns {JSX.Element} The rendered disclaimer
 */
export default function StatisticsDisclaimer({
  variant = 'banner',
  className = '',
}: StatisticsDisclaimerProps) {
  const { t } = useTranslation();

  if (variant === 'inline') {
    return (
      <p className={`text-sm text-text-secondary italic ${className}`}>
        {t('statistics.disclaimer.inline', 'These are population-level statistics. Your individual situation and outcomes may differ.')}
      </p>
    );
  }

  return (
    <div
      className={`bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 ${className}`}
      role="note"
      aria-labelledby="statistics-disclaimer-title"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <InfoIcon className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1">
          <h3
            id="statistics-disclaimer-title"
            className="font-semibold text-amber-900 text-sm sm:text-base mb-1"
          >
            {t('statistics.disclaimer.title', 'Important: These are general statistics')}
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed mb-2">
            {t('statistics.disclaimer.body', 'The statistics shown here are based on data from thousands of patients across the UK. They show general patterns and trends, not predictions about your individual situation.')}
          </p>
          <p className="text-sm text-amber-800 leading-relaxed">
            {t('statistics.disclaimer.advice', 'Your kidney team will help you understand what these numbers mean for you personally. Many individual factors affect outcomes that statistics cannot capture.')}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
