/**
 * @fileoverview Treatment choice chart component.
 * Displays a horizontal bar chart showing what percentage of patients
 * chose each treatment modality, using accessible visual design.
 *
 * @module components/statistics/TreatmentChoiceChart
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

import { useTranslation } from 'react-i18next';
import type { ModalityBreakdown } from '@/data/ukRenalStatistics';

interface TreatmentChoiceChartProps {
  /** The breakdown percentages to display */
  breakdown: ModalityBreakdown;
  /** Whether the data is personalized */
  isPersonalized: boolean;
  /** Description of personalization basis */
  personalizationBasisKey: string;
  /** Additional CSS classes */
  className?: string;
}

interface BarData {
  id: string;
  labelKey: string;
  percentage: number;
  color: string;
  bgColor: string;
  inTenPeople: string;
}

/**
 * Horizontal bar chart showing treatment choice percentages.
 * Uses patient-friendly language like "About X in every 10 people..."
 *
 * @component
 * @param {TreatmentChoiceChartProps} props - Component props
 * @returns {JSX.Element} The rendered bar chart
 */
export default function TreatmentChoiceChart({
  breakdown,
  isPersonalized,
  personalizationBasisKey,
  className = '',
}: TreatmentChoiceChartProps) {
  const { t } = useTranslation();

  const bars: BarData[] = [
    {
      id: 'transplant',
      labelKey: 'statistics.modalities.transplant',
      percentage: breakdown.transplant,
      color: 'bg-nhs-green',
      bgColor: 'bg-nhs-green/10',
      inTenPeople: getInTenPeople(breakdown.transplant),
    },
    {
      id: 'haemodialysis',
      labelKey: 'statistics.modalities.haemodialysis',
      percentage: breakdown.haemodialysis,
      color: 'bg-nhs-blue',
      bgColor: 'bg-nhs-blue/10',
      inTenPeople: getInTenPeople(breakdown.haemodialysis),
    },
    {
      id: 'peritoneal-dialysis',
      labelKey: 'statistics.modalities.peritonealDialysis',
      percentage: breakdown.peritonealDialysis,
      color: 'bg-[#00A499]',
      bgColor: 'bg-[#00A499]/10',
      inTenPeople: getInTenPeople(breakdown.peritonealDialysis),
    },
  ];

  // Add conservative if present
  if (breakdown.conservative && breakdown.conservative > 0) {
    bars.push({
      id: 'conservative',
      labelKey: 'statistics.modalities.conservative',
      percentage: breakdown.conservative,
      color: 'bg-nhs-purple',
      bgColor: 'bg-nhs-purple/10',
      inTenPeople: getInTenPeople(breakdown.conservative),
    });
  }

  // Sort by percentage descending
  bars.sort((a, b) => b.percentage - a.percentage);

  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-nhs-blue/5 to-nhs-green/5 border-b border-nhs-pale-grey">
        <h3 className="font-bold text-text-primary text-base sm:text-lg flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-nhs-blue" />
          {t('statistics.chart.title', 'Treatment choices')}
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          {isPersonalized
            ? t(personalizationBasisKey, 'Based on people in a similar situation to you')
            : t('statistics.chart.overallBasis', 'Based on all UK kidney patients on treatment')
          }
        </p>
      </div>

      {/* Chart content */}
      <div className="p-4 sm:p-5">
        <div className="space-y-5" role="list" aria-label={t('statistics.chart.ariaLabel', 'Treatment choice percentages')}>
          {bars.map((bar, index) => (
            <div
              key={bar.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              role="listitem"
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${bar.color}`} aria-hidden="true" />
                  <span className="font-medium text-text-primary text-sm sm:text-base">
                    {t(bar.labelKey, bar.id)}
                  </span>
                </div>
                <span className="text-lg font-bold text-text-primary">
                  {bar.percentage}%
                </span>
              </div>

              {/* Bar */}
              <div
                className="h-5 sm:h-6 bg-nhs-pale-grey/50 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={bar.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t(bar.labelKey, bar.id)}
              >
                <div
                  className={`h-full ${bar.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${bar.percentage}%` }}
                />
              </div>

              {/* Friendly description */}
              <p className="text-xs sm:text-sm text-text-secondary mt-1.5 pl-5">
                {t('statistics.chart.inTenPeople', 'About {{number}} in every 10 people', { number: bar.inTenPeople })}
              </p>
            </div>
          ))}
        </div>

        {/* Legend note */}
        <div className="mt-5 pt-4 border-t border-nhs-pale-grey">
          <p className="text-xs text-text-muted leading-relaxed">
            {t('statistics.chart.note', 'These percentages show the current treatment choices of all patients receiving kidney replacement therapy in the UK. New patients starting treatment may have a different pattern.')}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Converts a percentage to an approximate "X in 10 people" description.
 */
function getInTenPeople(percentage: number): string {
  const inTen = Math.round(percentage / 10);
  if (inTen === 0 && percentage > 0) return '1';
  return String(inTen);
}

function ChartIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}
