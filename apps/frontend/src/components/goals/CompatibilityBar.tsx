/**
 * @fileoverview Compatibility bar component for the Life Goals feature.
 * Displays a visual progress bar showing how compatible a treatment is
 * with the user's selected life goals.
 *
 * @module components/goals/CompatibilityBar
 * @version 1.0.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 */

import { useTranslation } from 'react-i18next';

/**
 * Props for the CompatibilityBar component.
 */
interface CompatibilityBarProps {
  /** Treatment label translation key */
  treatmentLabelKey: string;
  /** Compatibility score (0-100) */
  score: number;
  /** Whether this is the highest-scoring treatment */
  isBestMatch?: boolean;
  /** Strength explanation keys */
  strengths: string[];
  /** Challenge explanation keys */
  challenges: string[];
  /** Whether to show expanded explanations */
  isExpanded?: boolean;
  /** Callback when the expand button is clicked */
  onToggleExpand?: () => void;
}

/**
 * Returns the colour class based on the compatibility score.
 */
function getScoreColor(score: number): string {
  if (score >= 75) return 'from-nhs-green to-nhs-green-dark';
  if (score >= 55) return 'from-nhs-blue to-[#003087]';
  if (score >= 35) return 'from-nhs-warm-yellow to-[#b58900]';
  return 'from-[#d5281b] to-[#a3200f]';
}

/**
 * Returns the text colour class for the score label.
 */
function getScoreTextColor(score: number): string {
  if (score >= 75) return 'text-nhs-green';
  if (score >= 55) return 'text-nhs-blue';
  if (score >= 35) return 'text-nhs-warm-yellow';
  return 'text-[#d5281b]';
}

/**
 * Returns the descriptive label key based on the compatibility score.
 */
function getScoreLabelKey(score: number): string {
  if (score >= 75) return 'lifeGoals.compatibility.high';
  if (score >= 55) return 'lifeGoals.compatibility.good';
  if (score >= 35) return 'lifeGoals.compatibility.moderate';
  return 'lifeGoals.compatibility.low';
}

/**
 * A single treatment's compatibility visualization.
 * Shows a gradient progress bar with the treatment name, score, and optional explanations.
 */
export default function CompatibilityBar({
  treatmentLabelKey,
  score,
  isBestMatch = false,
  strengths,
  challenges,
  isExpanded = false,
  onToggleExpand,
}: CompatibilityBarProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isBestMatch
          ? 'border-nhs-green bg-nhs-green/5 shadow-md'
          : 'border-nhs-pale-grey bg-white hover:border-nhs-blue/30'
      }`}
    >
      <button
        onClick={onToggleExpand}
        className="w-full p-4 sm:p-5 text-left focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 rounded-xl min-h-[44px] touch-manipulation"
        aria-expanded={isExpanded}
        aria-label={`${t(treatmentLabelKey)} - ${score}% ${t(getScoreLabelKey(score))}. ${t('lifeGoals.compatibility.tapToExpand')}`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {isBestMatch && (
              <span className="text-[10px] sm:text-xs font-bold text-nhs-green bg-nhs-green/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                {t('lifeGoals.compatibility.bestMatch')}
              </span>
            )}
            <span className="text-sm sm:text-base font-semibold text-text-primary truncate">
              {t(treatmentLabelKey)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-lg sm:text-xl font-bold ${getScoreTextColor(score)}`}>
              {score}%
            </span>
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
            </svg>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 sm:h-4 bg-nhs-pale-grey rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-700 ease-out`}
            style={{ width: `${score}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${t(treatmentLabelKey)}: ${score}% ${t('lifeGoals.compatibility.compatible')}`}
          />
        </div>

        {/* Score label */}
        <div className="mt-1.5 sm:mt-2">
          <span className={`text-xs sm:text-sm font-medium ${getScoreTextColor(score)}`}>
            {t(getScoreLabelKey(score))}
          </span>
        </div>
      </button>

      {/* Expanded explanations */}
      {isExpanded && (strengths.length > 0 || challenges.length > 0) && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-nhs-pale-grey/50 pt-3 sm:pt-4 space-y-3">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-nhs-green mb-1.5 sm:mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {t('lifeGoals.compatibility.strengths')}
              </h4>
              <ul className="space-y-1">
                {strengths.map((key, i) => (
                  <li key={i} className="text-xs sm:text-sm text-text-secondary pl-5 relative">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-nhs-green" aria-hidden="true" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          {challenges.length > 0 && (
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#d5281b] mb-1.5 sm:mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {t('lifeGoals.compatibility.challenges')}
              </h4>
              <ul className="space-y-1">
                {challenges.map((key, i) => (
                  <li key={i} className="text-xs sm:text-sm text-text-secondary pl-5 relative">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#d5281b]" aria-hidden="true" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
