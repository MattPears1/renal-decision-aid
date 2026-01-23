/**
 * @fileoverview Quality of life comparison component.
 * Displays visual comparison of quality of life scores across
 * different treatment modalities using accessible bar charts.
 *
 * @module components/statistics/QualityOfLifeComparison
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { QualityOfLifeData } from '@/data/ukRenalStatistics';

interface QualityOfLifeComparisonProps {
  /** Quality of life data for each modality */
  data: QualityOfLifeData[];
  /** Additional CSS classes */
  className?: string;
}

type QolMetric = 'overallScore' | 'autonomyScore' | 'treatmentBurden';

/**
 * Visual comparison of quality of life metrics across treatment types.
 * Allows toggling between overall QoL, autonomy, and treatment burden views.
 *
 * @component
 * @param {QualityOfLifeComparisonProps} props - Component props
 * @returns {JSX.Element} The rendered comparison chart
 */
export default function QualityOfLifeComparison({
  data,
  className = '',
}: QualityOfLifeComparisonProps) {
  const { t } = useTranslation();
  const [activeMetric, setActiveMetric] = useState<QolMetric>('overallScore');

  const metrics: { key: QolMetric; labelKey: string; description: string }[] = [
    {
      key: 'overallScore',
      labelKey: 'statistics.qol.metrics.overall',
      description: 'Overall quality of life',
    },
    {
      key: 'autonomyScore',
      labelKey: 'statistics.qol.metrics.autonomy',
      description: 'Independence and flexibility',
    },
    {
      key: 'treatmentBurden',
      labelKey: 'statistics.qol.metrics.burden',
      description: 'Treatment burden (lower is better)',
    },
  ];

  const modalityColors: Record<string, { bar: string; text: string }> = {
    'transplant': { bar: 'bg-nhs-green', text: 'text-nhs-green' },
    'peritoneal-dialysis': { bar: 'bg-[#00A499]', text: 'text-[#00A499]' },
    'haemodialysis': { bar: 'bg-nhs-blue', text: 'text-nhs-blue' },
    'conservative': { bar: 'bg-nhs-purple', text: 'text-nhs-purple' },
  };

  const modalityLabels: Record<string, string> = {
    'transplant': 'statistics.modalities.transplant',
    'peritoneal-dialysis': 'statistics.modalities.peritonealDialysis',
    'haemodialysis': 'statistics.modalities.haemodialysis',
    'conservative': 'statistics.modalities.conservative',
  };

  // Sort data based on metric (higher is better for overall/autonomy, lower for burden)
  const sortedData = [...data].sort((a, b) => {
    if (activeMetric === 'treatmentBurden') {
      return a[activeMetric] - b[activeMetric]; // Lower burden first
    }
    return b[activeMetric] - a[activeMetric]; // Higher score first
  });

  const isBurden = activeMetric === 'treatmentBurden';

  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-nhs-pale-grey">
        <h3 className="font-bold text-text-primary text-base sm:text-lg flex items-center gap-2 mb-1">
          <HeartIcon className="w-5 h-5 text-nhs-pink" />
          {t('statistics.qol.title', 'Quality of life comparison')}
        </h3>
        <p className="text-sm text-text-secondary">
          {t('statistics.qol.subtitle', 'How patients rate their quality of life on different treatments')}
        </p>
      </div>

      {/* Metric selector */}
      <div className="p-4 sm:p-5 border-b border-nhs-pale-grey bg-bg-surface/50">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label={t('statistics.qol.metricSelector', 'Select quality of life metric')}
        >
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setActiveMetric(metric.key)}
              role="tab"
              aria-selected={activeMetric === metric.key}
              className={`px-3 sm:px-4 py-2 min-h-[44px] text-sm font-medium rounded-lg transition-all ${
                activeMetric === metric.key
                  ? 'bg-nhs-blue text-white shadow-sm'
                  : 'bg-white text-text-secondary border border-nhs-pale-grey hover:border-nhs-blue hover:text-nhs-blue'
              }`}
            >
              {t(metric.labelKey, metric.description)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-5" role="tabpanel">
        <div className="space-y-4">
          {sortedData.map((item, index) => {
            const score = item[activeMetric];
            const maxScore = 10;
            const percentage = (score / maxScore) * 100;
            const colors = modalityColors[item.modality] || { bar: 'bg-gray-400', text: 'text-gray-600' };

            return (
              <div
                key={item.modality}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-text-primary text-sm sm:text-base">
                    {t(modalityLabels[item.modality] || item.modality, item.modality)}
                  </span>
                  <span className={`font-bold text-sm sm:text-base ${colors.text}`}>
                    {score.toFixed(1)}/10
                  </span>
                </div>

                <div
                  className="h-4 sm:h-5 bg-nhs-pale-grey/50 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-label={`${t(modalityLabels[item.modality] || item.modality, item.modality)}: ${score.toFixed(1)} out of 10`}
                >
                  <div
                    className={`h-full ${colors.bar} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="text-xs text-text-muted mt-1 pl-1">
                  {t(item.descriptionKey, '')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Context note */}
        <div className="mt-5 pt-4 border-t border-nhs-pale-grey">
          <p className="text-xs text-text-muted leading-relaxed">
            {isBurden
              ? t('statistics.qol.burdenNote', 'Treatment burden reflects the time and effort required for treatment. A lower score means less burden on daily life.')
              : t('statistics.qol.scoreNote', 'Scores are based on patient-reported outcomes from published UK studies. Higher scores indicate better quality of life. Individual experiences may vary significantly.')
            }
          </p>
        </div>
      </div>
    </div>
  );
}

function HeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
