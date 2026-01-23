/**
 * @fileoverview Transplant waiting list information component.
 * Displays key statistics about the UK kidney transplant waiting list
 * including wait times, success rates, and living donor information.
 *
 * @module components/statistics/WaitingListInfo
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

import { useTranslation } from 'react-i18next';
import type { WaitingListData } from '@/data/ukRenalStatistics';

interface WaitingListInfoProps {
  /** Waiting list data */
  data: WaitingListData;
  /** Whether the user has a living donor available */
  hasLivingDonor?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component displaying transplant waiting list statistics.
 * Presents key facts in an accessible card layout.
 *
 * @component
 * @param {WaitingListInfoProps} props - Component props
 * @returns {JSX.Element} The rendered waiting list information
 */
export default function WaitingListInfo({
  data,
  hasLivingDonor,
  className = '',
}: WaitingListInfoProps) {
  const { t } = useTranslation();

  const stats = [
    {
      id: 'on-list',
      value: t('statistics.waitingList.onListValue', '~{{number}}', { number: data.totalOnList.toLocaleString() }),
      labelKey: 'statistics.waitingList.onList',
      icon: <PeopleIcon />,
      color: 'text-nhs-blue',
      bgColor: 'bg-nhs-blue/10',
    },
    {
      id: 'per-year',
      value: t('statistics.waitingList.perYearValue', '~{{number}}', { number: data.transplantsPerYear.toLocaleString() }),
      labelKey: 'statistics.waitingList.perYear',
      icon: <TransplantIcon />,
      color: 'text-nhs-green',
      bgColor: 'bg-nhs-green/10',
    },
    {
      id: 'wait-time',
      value: t('statistics.waitingList.waitTimeValue', '{{years}} years', { years: data.medianWaitYears }),
      labelKey: 'statistics.waitingList.medianWait',
      icon: <ClockIcon />,
      color: 'text-nhs-orange',
      bgColor: 'bg-nhs-orange/10',
    },
    {
      id: 'living-donor',
      value: t('statistics.waitingList.livingDonorValue', '~{{number}}', { number: data.livingDonorPerYear.toLocaleString() }),
      labelKey: 'statistics.waitingList.livingDonor',
      icon: <HeartIcon />,
      color: 'text-nhs-pink',
      bgColor: 'bg-nhs-pink/10',
    },
  ];

  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-nhs-pale-grey">
        <h3 className="font-bold text-text-primary text-base sm:text-lg flex items-center gap-2 mb-1">
          <WaitlistIcon className="w-5 h-5 text-nhs-blue" />
          {t('statistics.waitingList.title', 'Transplant waiting list')}
        </h3>
        <p className="text-sm text-text-secondary">
          {t('statistics.waitingList.subtitle', 'Key facts about the kidney transplant waiting list in England')}
        </p>
      </div>

      {/* Stats grid */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="p-3 sm:p-4 bg-bg-surface rounded-xl"
            >
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                <span className={`w-4 h-4 ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className={`text-lg sm:text-xl font-bold ${stat.color} mb-0.5`}>
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-text-secondary leading-snug">
                {t(stat.labelKey, stat.id)}
              </p>
            </div>
          ))}
        </div>

        {/* Graft survival */}
        <div className="mt-4 p-4 bg-nhs-green/5 rounded-xl border border-nhs-green/20">
          <h4 className="font-semibold text-text-primary text-sm mb-2">
            {t('statistics.waitingList.graftSurvival', 'Transplant success rates (5-year graft survival)')}
          </h4>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-nhs-green rounded-full" />
              <span className="text-sm text-text-secondary">
                {t('statistics.waitingList.livingDonorSurvival', 'Living donor: ~{{rate}}%', { rate: data.fiveYearGraftSurvivalLiving })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-nhs-blue rounded-full" />
              <span className="text-sm text-text-secondary">
                {t('statistics.waitingList.deceasedDonorSurvival', 'Deceased donor: ~{{rate}}%', { rate: data.fiveYearGraftSurvivalDeceased })}
              </span>
            </div>
          </div>
        </div>

        {/* Living donor context */}
        {hasLivingDonor && (
          <div className="mt-3 p-4 bg-nhs-green/5 rounded-xl border border-nhs-green/20">
            <div className="flex items-start gap-3">
              <HeartPlusIcon className="w-5 h-5 text-nhs-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">
                  {t('statistics.waitingList.livingDonorAvailable', 'You may have a living donor')}
                </p>
                <p className="text-sm text-text-secondary">
                  {t('statistics.waitingList.livingDonorAdvantage', 'Living donor transplants generally have better outcomes and shorter waiting times. About 30% of kidney transplants in the UK are from living donors.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Context note */}
        <p className="text-xs text-text-muted mt-4 leading-relaxed">
          {t('statistics.waitingList.note', 'Wait times vary by blood group, tissue type, and other matching factors. Your kidney team can give you more specific information about likely waiting times in your area.')}
        </p>
      </div>
    </div>
  );
}

// Icon components
function WaitlistIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TransplantIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function HeartPlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      <path d="M12 8v4" />
      <path d="M10 10h4" />
    </svg>
  );
}
