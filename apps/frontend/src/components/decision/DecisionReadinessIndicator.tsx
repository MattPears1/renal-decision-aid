/**
 * @fileoverview Decision Readiness Indicator component for the NHS Renal Decision Aid.
 * Shows users how prepared they are to make an informed treatment decision based on
 * their exploration progress, values clarity, and engagement with the tool.
 *
 * @module components/decision/DecisionReadinessIndicator
 * @version 1.0.0
 * @since 2.6.0
 * @lastModified 23 January 2026
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';

/**
 * Readiness level configuration
 */
interface ReadinessLevel {
  level: 'starting' | 'exploring' | 'preparing' | 'ready';
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const READINESS_LEVELS: ReadinessLevel[] = [
  { level: 'starting', minScore: 0, maxScore: 25, color: 'text-nhs-blue', bgColor: 'bg-nhs-blue/10', borderColor: 'border-nhs-blue/30' },
  { level: 'exploring', minScore: 26, maxScore: 50, color: 'text-nhs-aqua-green', bgColor: 'bg-nhs-aqua-green/10', borderColor: 'border-nhs-aqua-green/30' },
  { level: 'preparing', minScore: 51, maxScore: 75, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { level: 'ready', minScore: 76, maxScore: 100, color: 'text-nhs-green', bgColor: 'bg-nhs-green/10', borderColor: 'border-nhs-green/30' },
];

/**
 * Checklist item for readiness assessment
 */
interface ChecklistItem {
  id: string;
  labelKey: string;
  descriptionKey: string;
  isComplete: boolean;
  link: string;
  weight: number;
}

interface DecisionReadinessIndicatorProps {
  /** Display variant */
  variant?: 'full' | 'compact' | 'inline';
  /** Show the checklist items */
  showChecklist?: boolean;
  /** Show encouragement message */
  showEncouragement?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Decision Readiness Indicator component.
 *
 * Helps users understand how prepared they are to make an informed treatment decision
 * by tracking their progress through the tool and providing actionable next steps.
 *
 * @component
 * @param {DecisionReadinessIndicatorProps} props - Component props
 * @returns {JSX.Element} The rendered readiness indicator
 */
export default function DecisionReadinessIndicator({
  variant = 'full',
  showChecklist = true,
  showEncouragement = true,
  className = '',
}: DecisionReadinessIndicatorProps) {
  const { t } = useTranslation();
  const { session } = useSession();

  // Calculate readiness score and checklist
  const { score, checklist, readinessLevel } = useMemo(() => {
    const items: ChecklistItem[] = [
      {
        id: 'treatments-explored',
        labelKey: 'decision.readiness.checklist.treatmentsExplored',
        descriptionKey: 'decision.readiness.checklist.treatmentsExploredDesc',
        isComplete: (session?.viewedTreatments?.length || 0) >= 2,
        link: '/treatments',
        weight: 25,
      },
      {
        id: 'all-treatments',
        labelKey: 'decision.readiness.checklist.allTreatments',
        descriptionKey: 'decision.readiness.checklist.allTreatmentsDesc',
        isComplete: (session?.viewedTreatments?.length || 0) >= 4,
        link: '/treatments',
        weight: 15,
      },
      {
        id: 'values-completed',
        labelKey: 'decision.readiness.checklist.valuesCompleted',
        descriptionKey: 'decision.readiness.checklist.valuesCompletedDesc',
        isComplete: (session?.valueRatings?.length || 0) >= 5,
        link: '/values',
        weight: 25,
      },
      {
        id: 'comparison-viewed',
        labelKey: 'decision.readiness.checklist.comparisonViewed',
        descriptionKey: 'decision.readiness.checklist.comparisonViewedDesc',
        isComplete: (session?.viewedTreatments?.length || 0) >= 2,
        link: '/compare',
        weight: 15,
      },
      {
        id: 'questions-prepared',
        labelKey: 'decision.readiness.checklist.questionsPrepared',
        descriptionKey: 'decision.readiness.checklist.questionsPreparedDesc',
        isComplete: (session?.chatHistory?.length || 0) > 0,
        link: '/chat',
        weight: 10,
      },
      {
        id: 'journey-identified',
        labelKey: 'decision.readiness.checklist.journeyIdentified',
        descriptionKey: 'decision.readiness.checklist.journeyIdentifiedDesc',
        isComplete: !!session?.journeyStage,
        link: '/journey',
        weight: 10,
      },
    ];

    const totalScore = items.reduce((acc, item) => acc + (item.isComplete ? item.weight : 0), 0);
    const level = READINESS_LEVELS.find((l) => totalScore >= l.minScore && totalScore <= l.maxScore) || READINESS_LEVELS[0];

    return {
      score: totalScore,
      checklist: items,
      readinessLevel: level,
    };
  }, [session]);

  // Get encouragement message based on readiness level
  const encouragementMessage = useMemo(() => {
    switch (readinessLevel.level) {
      case 'starting':
        return t('decision.readiness.encouragement.starting', 'You are at the beginning of your exploration. Take your time to learn about each treatment option.');
      case 'exploring':
        return t('decision.readiness.encouragement.exploring', 'Good progress! Continue exploring to build a clearer picture of your options.');
      case 'preparing':
        return t('decision.readiness.encouragement.preparing', 'You are well on your way. Consider completing the values exercise to clarify your priorities.');
      case 'ready':
        return t('decision.readiness.encouragement.ready', 'You have explored thoroughly. You are well-prepared to discuss options with your kidney team.');
      default:
        return '';
    }
  }, [readinessLevel.level, t]);

  // Inline variant - minimal display
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`w-3 h-3 rounded-full ${readinessLevel.bgColor} ${readinessLevel.borderColor} border-2`} />
        <span className={`text-sm font-medium ${readinessLevel.color}`}>
          {t(`decision.readiness.level.${readinessLevel.level}`, readinessLevel.level)}
        </span>
        <span className="text-sm text-text-muted">({score}%)</span>
      </div>
    );
  }

  // Compact variant - progress bar and level
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-nhs-pale-grey p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">
            {t('decision.readiness.title', 'Decision Readiness')}
          </h3>
          <span className={`text-sm font-bold ${readinessLevel.color}`}>
            {t(`decision.readiness.level.${readinessLevel.level}`, readinessLevel.level)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 bg-nhs-pale-grey rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
              readinessLevel.level === 'ready'
                ? 'bg-gradient-to-r from-nhs-green to-nhs-green-dark'
                : readinessLevel.level === 'preparing'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : readinessLevel.level === 'exploring'
                ? 'bg-gradient-to-r from-nhs-aqua-green to-nhs-green'
                : 'bg-gradient-to-r from-nhs-blue to-nhs-aqua-green'
            }`}
            style={{ width: `${score}%` }}
          />
          {/* Level markers */}
          <div className="absolute inset-0 flex">
            <div className="w-1/4 border-r border-white/50" />
            <div className="w-1/4 border-r border-white/50" />
            <div className="w-1/4 border-r border-white/50" />
          </div>
        </div>

        <div className="flex justify-between mt-2 text-[10px] text-text-muted">
          <span>{t('decision.readiness.level.starting', 'Starting')}</span>
          <span>{t('decision.readiness.level.exploring', 'Exploring')}</span>
          <span>{t('decision.readiness.level.preparing', 'Preparing')}</span>
          <span>{t('decision.readiness.level.ready', 'Ready')}</span>
        </div>
      </div>
    );
  }

  // Full variant - complete display with checklist
  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className={`p-5 sm:p-6 border-b ${readinessLevel.bgColor} ${readinessLevel.borderColor}`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* Circular progress */}
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/50"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                strokeLinecap="round"
                className={readinessLevel.color}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${readinessLevel.color}`}>{score}%</span>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {t('decision.readiness.title', 'Decision Readiness')}
            </h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${readinessLevel.bgColor} ${readinessLevel.color} ${readinessLevel.borderColor} border`}>
              <ReadinessIcon level={readinessLevel.level} />
              {t(`decision.readiness.level.${readinessLevel.level}`, readinessLevel.level)}
            </div>
          </div>
        </div>

        {showEncouragement && (
          <p className="mt-4 text-sm text-text-secondary leading-relaxed">
            {encouragementMessage}
          </p>
        )}
      </div>

      {/* Checklist */}
      {showChecklist && (
        <div className="p-5 sm:p-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            {t('decision.readiness.checklistTitle', 'Your Exploration Checklist')}
          </h3>

          <div className="space-y-3">
            {checklist.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className={`group flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  item.isComplete
                    ? 'bg-nhs-green/5 border-nhs-green/30'
                    : 'bg-white border-nhs-pale-grey hover:border-nhs-blue/50 hover:bg-nhs-blue/5'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.isComplete
                      ? 'bg-nhs-green text-white'
                      : 'bg-nhs-pale-grey text-text-muted group-hover:bg-nhs-blue/20 group-hover:text-nhs-blue'
                  }`}
                >
                  {item.isComplete ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{item.weight}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${item.isComplete ? 'text-nhs-green' : 'text-text-primary'}`}>
                    {t(item.labelKey, item.id)}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {t(item.descriptionKey, '')}
                  </p>
                </div>

                {!item.isComplete && (
                  <svg
                    className="w-5 h-5 text-text-muted group-hover:text-nhs-blue group-hover:translate-x-1 transition-all flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Action footer */}
      {score >= 50 && (
        <div className="p-4 bg-gradient-to-r from-nhs-green/10 to-nhs-aqua-green/10 border-t border-nhs-green/20">
          <Link
            to="/summary"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
          >
            <SummaryIcon className="w-5 h-5" />
            {t('decision.readiness.viewSummary', 'View Your Summary')}
          </Link>
        </div>
      )}
    </div>
  );
}

// Icon Components
function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SummaryIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ReadinessIcon({ level }: { level: string }) {
  switch (level) {
    case 'starting':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'exploring':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case 'preparing':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'ready':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    default:
      return null;
  }
}
