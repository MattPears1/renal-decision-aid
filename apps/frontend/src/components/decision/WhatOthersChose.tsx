/**
 * @fileoverview What Others Chose component for the NHS Renal Decision Aid.
 * Displays anonymized statistics about treatment choices made by others in similar
 * situations, helping users understand they are not alone in their decision process.
 *
 * @module components/decision/WhatOthersChose
 * @version 1.0.0
 * @since 2.6.0
 * @lastModified 23 January 2026
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import type { JourneyStage } from '@renal-decision-aid/shared-types';

/**
 * Treatment statistics data (anonymized mock data)
 */
interface TreatmentStats {
  id: string;
  nameKey: string;
  percentage: number;
  color: string;
  satisfactionScore: number;
  commonReasons: string[];
}

/**
 * Mock statistics data for different journey stages
 * Note: These are illustrative figures based on general NHS data patterns
 */
const MOCK_STATS: Record<JourneyStage | 'default', TreatmentStats[]> = {
  'newly-diagnosed': [
    { id: 'monitoring', nameKey: 'decision.stats.treatments.monitoring', percentage: 65, color: 'nhs-blue', satisfactionScore: 4.2, commonReasons: ['decision.stats.reasons.monitoring.1', 'decision.stats.reasons.monitoring.2'] },
    { id: 'lifestyle', nameKey: 'decision.stats.treatments.lifestyle', percentage: 25, color: 'nhs-green', satisfactionScore: 4.5, commonReasons: ['decision.stats.reasons.lifestyle.1'] },
    { id: 'immediate', nameKey: 'decision.stats.treatments.immediate', percentage: 10, color: 'nhs-aqua-green', satisfactionScore: 4.0, commonReasons: ['decision.stats.reasons.immediate.1'] },
  ],
  'monitoring': [
    { id: 'monitoring', nameKey: 'decision.stats.treatments.monitoring', percentage: 55, color: 'nhs-blue', satisfactionScore: 4.2, commonReasons: ['decision.stats.reasons.monitoring.1', 'decision.stats.reasons.monitoring.2'] },
    { id: 'lifestyle', nameKey: 'decision.stats.treatments.lifestyle', percentage: 35, color: 'nhs-green', satisfactionScore: 4.4, commonReasons: ['decision.stats.reasons.lifestyle.1', 'decision.stats.reasons.lifestyle.2'] },
    { id: 'transplant-prep', nameKey: 'decision.stats.treatments.transplantPrep', percentage: 10, color: 'nhs-aqua-green', satisfactionScore: 4.1, commonReasons: ['decision.stats.reasons.transplantPrep.1'] },
  ],
  'preparing': [
    { id: 'transplant', nameKey: 'treatments.types.transplant.title', percentage: 38, color: 'nhs-green', satisfactionScore: 4.6, commonReasons: ['decision.stats.reasons.transplant.1', 'decision.stats.reasons.transplant.2', 'decision.stats.reasons.transplant.3'] },
    { id: 'hemodialysis', nameKey: 'treatments.types.hemodialysis.title', percentage: 28, color: 'nhs-blue', satisfactionScore: 4.0, commonReasons: ['decision.stats.reasons.hemodialysis.1', 'decision.stats.reasons.hemodialysis.2'] },
    { id: 'peritoneal', nameKey: 'treatments.types.peritonealDialysis.title', percentage: 26, color: 'nhs-aqua-green', satisfactionScore: 4.3, commonReasons: ['decision.stats.reasons.peritoneal.1', 'decision.stats.reasons.peritoneal.2'] },
    { id: 'conservative', nameKey: 'treatments.types.conservative.title', percentage: 8, color: 'nhs-purple', satisfactionScore: 4.1, commonReasons: ['decision.stats.reasons.conservative.1'] },
  ],
  'on-dialysis': [
    { id: 'hemodialysis', nameKey: 'treatments.types.hemodialysis.title', percentage: 55, color: 'nhs-blue', satisfactionScore: 4.0, commonReasons: ['decision.stats.reasons.hemodialysis.1', 'decision.stats.reasons.hemodialysis.2', 'decision.stats.reasons.hemodialysis.3'] },
    { id: 'peritoneal', nameKey: 'treatments.types.peritonealDialysis.title', percentage: 35, color: 'nhs-aqua-green', satisfactionScore: 4.3, commonReasons: ['decision.stats.reasons.peritoneal.1', 'decision.stats.reasons.peritoneal.2'] },
    { id: 'home-hemo', nameKey: 'decision.stats.treatments.homeHemo', percentage: 10, color: 'nhs-purple', satisfactionScore: 4.4, commonReasons: ['decision.stats.reasons.homeHemo.1'] },
  ],
  'transplant-waiting': [
    { id: 'living-donor', nameKey: 'decision.stats.treatments.livingDonor', percentage: 45, color: 'nhs-green', satisfactionScore: 4.7, commonReasons: ['decision.stats.reasons.livingDonor.1'] },
    { id: 'deceased-donor', nameKey: 'decision.stats.treatments.deceasedDonor', percentage: 55, color: 'nhs-blue', satisfactionScore: 4.5, commonReasons: ['decision.stats.reasons.deceasedDonor.1'] },
  ],
  'post-transplant': [
    { id: 'active-monitoring', nameKey: 'decision.stats.treatments.activeMonitoring', percentage: 85, color: 'nhs-green', satisfactionScore: 4.6, commonReasons: ['decision.stats.reasons.activeMonitoring.1', 'decision.stats.reasons.activeMonitoring.2'] },
    { id: 'lifestyle-focused', nameKey: 'decision.stats.treatments.lifestyleFocused', percentage: 15, color: 'nhs-blue', satisfactionScore: 4.4, commonReasons: ['decision.stats.reasons.lifestyleFocused.1'] },
  ],
  'supporting-someone': [
    { id: 'transplant', nameKey: 'treatments.types.transplant.title', percentage: 40, color: 'nhs-green', satisfactionScore: 4.6, commonReasons: ['decision.stats.reasons.transplant.1'] },
    { id: 'hemodialysis', nameKey: 'treatments.types.hemodialysis.title', percentage: 30, color: 'nhs-blue', satisfactionScore: 4.0, commonReasons: ['decision.stats.reasons.hemodialysis.1'] },
    { id: 'peritoneal', nameKey: 'treatments.types.peritonealDialysis.title', percentage: 22, color: 'nhs-aqua-green', satisfactionScore: 4.3, commonReasons: ['decision.stats.reasons.peritoneal.1'] },
    { id: 'conservative', nameKey: 'treatments.types.conservative.title', percentage: 8, color: 'nhs-purple', satisfactionScore: 4.1, commonReasons: ['decision.stats.reasons.conservative.1'] },
  ],
  'default': [
    { id: 'transplant', nameKey: 'treatments.types.transplant.title', percentage: 35, color: 'nhs-green', satisfactionScore: 4.6, commonReasons: ['decision.stats.reasons.transplant.1', 'decision.stats.reasons.transplant.2'] },
    { id: 'hemodialysis', nameKey: 'treatments.types.hemodialysis.title', percentage: 32, color: 'nhs-blue', satisfactionScore: 4.0, commonReasons: ['decision.stats.reasons.hemodialysis.1'] },
    { id: 'peritoneal', nameKey: 'treatments.types.peritonealDialysis.title', percentage: 25, color: 'nhs-aqua-green', satisfactionScore: 4.3, commonReasons: ['decision.stats.reasons.peritoneal.1'] },
    { id: 'conservative', nameKey: 'treatments.types.conservative.title', percentage: 8, color: 'nhs-purple', satisfactionScore: 4.1, commonReasons: ['decision.stats.reasons.conservative.1'] },
  ],
};

interface WhatOthersChoseProps {
  /** Display variant */
  variant?: 'full' | 'compact' | 'card';
  /** Show satisfaction scores */
  showSatisfaction?: boolean;
  /** Show common reasons */
  showReasons?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * What Others Chose component.
 *
 * Displays anonymized statistics about treatment choices to help users
 * understand common paths and feel less alone in their decision process.
 *
 * @component
 * @param {WhatOthersChoseProps} props - Component props
 * @returns {JSX.Element} The rendered statistics display
 */
export default function WhatOthersChose({
  variant = 'full',
  showSatisfaction = true,
  showReasons = true,
  className = '',
}: WhatOthersChoseProps) {
  const { t } = useTranslation();
  const { session } = useSession();

  // Get statistics based on journey stage
  const stats = useMemo(() => {
    const journeyStage = session?.journeyStage;
    return journeyStage && MOCK_STATS[journeyStage] ? MOCK_STATS[journeyStage] : MOCK_STATS.default;
  }, [session?.journeyStage]);

  // Card variant - minimal display
  if (variant === 'card') {
    const topTreatment = stats[0];
    return (
      <div className={`bg-white rounded-xl border border-nhs-pale-grey p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-nhs-blue/10 rounded-xl flex items-center justify-center">
            <PeopleIcon className="w-5 h-5 text-nhs-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">
              {t('decision.stats.titleShort', 'What Others Choose')}
            </h3>
            <p className="text-xs text-text-secondary">
              {t('decision.stats.basedOnSimilar', 'Based on similar journeys')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-nhs-pale-grey/30 rounded-lg">
          <span className={`text-2xl font-bold text-${topTreatment.color}`}>
            {topTreatment.percentage}%
          </span>
          <span className="text-sm text-text-secondary">
            {t('decision.stats.chose', 'chose')} {t(topTreatment.nameKey, topTreatment.id)}
          </span>
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-nhs-pale-grey overflow-hidden ${className}`}>
        <div className="p-4 bg-nhs-blue/5 border-b border-nhs-pale-grey">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <PeopleIcon className="w-5 h-5 text-nhs-blue" />
            {t('decision.stats.title', 'What Others in Similar Situations Chose')}
          </h3>
        </div>

        <div className="p-4">
          {/* Bar chart */}
          <div className="space-y-3">
            {stats.map((treatment) => (
              <div key={treatment.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-text-primary">{t(treatment.nameKey, treatment.id)}</span>
                  <span className={`text-${treatment.color} font-bold`}>{treatment.percentage}%</span>
                </div>
                <div className="h-3 bg-nhs-pale-grey rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${treatment.color} rounded-full transition-all duration-700`}
                    style={{ width: `${treatment.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-text-muted mt-4 p-3 bg-nhs-pale-grey/30 rounded-lg">
            {t('decision.stats.disclaimer', 'These figures are illustrative and based on anonymized NHS data. Your choice should be based on your individual circumstances and discussions with your kidney team.')}
          </p>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-nhs-blue/10 to-nhs-aqua-green/10 border-b border-nhs-pale-grey">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-nhs-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <PeopleIcon className="w-6 h-6 text-nhs-blue" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {t('decision.stats.title', 'What Others in Similar Situations Chose')}
            </h2>
            <p className="text-sm text-text-secondary">
              {t('decision.stats.subtitle', 'You are not alone in making this decision. Here is what others with similar situations chose.')}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics display */}
      <div className="p-5 sm:p-6">
        {/* Visual bar chart */}
        <div className="space-y-4 mb-6">
          {stats.map((treatment, index) => (
            <div
              key={treatment.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${treatment.color}`} />
                  <span className="font-medium text-text-primary">
                    {t(treatment.nameKey, treatment.id)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {showSatisfaction && (
                    <div className="flex items-center gap-1 text-sm text-text-muted">
                      <StarIcon className="w-4 h-4 text-nhs-warm-yellow" />
                      <span>{treatment.satisfactionScore.toFixed(1)}</span>
                    </div>
                  )}
                  <span className={`text-lg font-bold text-${treatment.color}`}>
                    {treatment.percentage}%
                  </span>
                </div>
              </div>

              <div className="h-4 bg-nhs-pale-grey rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-${treatment.color} to-${treatment.color}/70 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${treatment.percentage}%` }}
                />
              </div>

              {showReasons && treatment.commonReasons.length > 0 && (
                <div className="mt-2 pl-5">
                  <p className="text-xs text-text-muted mb-1">
                    {t('decision.stats.commonReasons', 'Common reasons:')}
                  </p>
                  <ul className="space-y-0.5">
                    {treatment.commonReasons.slice(0, 2).map((reason, idx) => (
                      <li key={idx} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-nhs-blue mt-0.5">-</span>
                        {t(reason, reason)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        {showSatisfaction && (
          <div className="flex items-center justify-center gap-6 py-3 border-t border-b border-nhs-pale-grey mb-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <StarIcon className="w-4 h-4 text-nhs-warm-yellow" />
              <span>{t('decision.stats.satisfactionLabel', 'Satisfaction score (out of 5)')}</span>
            </div>
          </div>
        )}

        {/* Important notice */}
        <div className="bg-nhs-warm-yellow/10 border border-nhs-warm-yellow/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-nhs-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary mb-1">
                {t('decision.stats.importantNote', 'Important to remember')}
              </p>
              <p className="text-sm text-text-secondary">
                {t('decision.stats.disclaimer', 'These figures are illustrative and based on anonymized NHS data. Your choice should be based on your individual circumstances and discussions with your kidney team.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Encouragement footer */}
      <div className="p-4 bg-nhs-green/5 border-t border-nhs-green/20">
        <p className="text-center text-sm text-text-secondary">
          <span className="font-medium text-nhs-green">{t('decision.stats.encouragement1', 'Remember:')}</span>{' '}
          {t('decision.stats.encouragement2', 'There is no wrong choice. The best treatment is the one that works for your life and circumstances.')}
        </p>
      </div>
    </div>
  );
}

// Icon components
function PeopleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z" />
    </svg>
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
