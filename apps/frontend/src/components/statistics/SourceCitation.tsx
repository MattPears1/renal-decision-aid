/**
 * @fileoverview Source citation component.
 * Displays data source references for the statistics shown,
 * crediting UKRR, NHSBT, and NICE as data sources.
 *
 * @module components/statistics/SourceCitation
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

import { useTranslation } from 'react-i18next';
import { DATA_SOURCES } from '@/data/ukRenalStatistics';

interface SourceCitationProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Citation component showing data sources for the statistics.
 * Lists all major data sources with their descriptions.
 *
 * @component
 * @param {SourceCitationProps} props - Component props
 * @returns {JSX.Element} The rendered citations
 */
export default function SourceCitation({ className = '' }: SourceCitationProps) {
  const { t } = useTranslation();

  return (
    <div className={`bg-bg-surface rounded-xl border border-nhs-pale-grey p-4 sm:p-5 ${className}`}>
      <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
        <BookIcon className="w-4 h-4 text-text-secondary" />
        {t('statistics.sources.title', 'Data sources')}
      </h3>
      <ul className="space-y-2.5" role="list">
        {DATA_SOURCES.map((source) => (
          <li key={source.id} className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-nhs-blue mt-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {t(source.nameKey, source.id)} ({source.year})
              </p>
              <p className="text-xs text-text-muted leading-relaxed">
                {t(source.descriptionKey, '')}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-text-muted mt-3 pt-3 border-t border-nhs-pale-grey leading-relaxed">
        {t('statistics.sources.disclaimer', 'Statistics are derived from published reports and may be subject to rounding. They represent population-level data and should not be used for individual clinical decisions without professional guidance.')}
      </p>
    </div>
  );
}

function BookIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
