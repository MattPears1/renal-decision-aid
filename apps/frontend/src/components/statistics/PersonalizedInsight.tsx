/**
 * @fileoverview Personalized insight card component.
 * Displays contextual insights based on the user's profile,
 * such as age-related or disease-related information.
 *
 * @module components/statistics/PersonalizedInsight
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

import { useTranslation } from 'react-i18next';
import type { PersonalizedInsight as InsightType } from '@/data/statisticsMatching';

interface PersonalizedInsightProps {
  /** The insight data to display */
  insight: InsightType;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card component displaying a single personalized statistical insight.
 *
 * @component
 * @param {PersonalizedInsightProps} props - Component props
 * @returns {JSX.Element} The rendered insight card
 */
export default function PersonalizedInsight({
  insight,
  className = '',
}: PersonalizedInsightProps) {
  const { t } = useTranslation();

  const typeStyles = {
    info: {
      bg: 'bg-nhs-blue/5',
      border: 'border-nhs-blue/20',
      iconBg: 'bg-nhs-blue/10',
      iconColor: 'text-nhs-blue',
      icon: <InfoIcon />,
    },
    positive: {
      bg: 'bg-nhs-green/5',
      border: 'border-nhs-green/20',
      iconBg: 'bg-nhs-green/10',
      iconColor: 'text-nhs-green',
      icon: <PositiveIcon />,
    },
    context: {
      bg: 'bg-nhs-purple/5',
      border: 'border-nhs-purple/20',
      iconBg: 'bg-nhs-purple/10',
      iconColor: 'text-nhs-purple',
      icon: <ContextIcon />,
    },
  };

  const style = typeStyles[insight.type];

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-xl p-4 ${className}`}
      role="article"
      aria-labelledby={`insight-${insight.id}-title`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-9 h-9 ${style.iconBg} rounded-lg flex items-center justify-center`}>
          <span className={`w-5 h-5 ${style.iconColor}`}>
            {style.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4
            id={`insight-${insight.id}-title`}
            className="font-semibold text-text-primary text-sm mb-1"
          >
            {t(insight.titleKey, insight.id)}
          </h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t(insight.descriptionKey, '')}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Displays a list of personalized insights.
 */
interface PersonalizedInsightListProps {
  insights: InsightType[];
  className?: string;
}

export function PersonalizedInsightList({
  insights,
  className = '',
}: PersonalizedInsightListProps) {
  const { t } = useTranslation();

  if (insights.length === 0) return null;

  // Sort by relevance
  const sorted = [...insights].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.relevance] - order[b.relevance];
  });

  return (
    <div className={className}>
      <h3 className="font-bold text-text-primary text-base sm:text-lg mb-3 flex items-center gap-2">
        <LightbulbIcon className="w-5 h-5 text-nhs-warm-yellow" />
        {t('statistics.insights.title', 'Personalised insights')}
      </h3>
      <div className="space-y-3">
        {sorted.map((insight) => (
          <PersonalizedInsight key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

// Icon components
function InfoIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function PositiveIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ContextIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function LightbulbIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
    </svg>
  );
}
