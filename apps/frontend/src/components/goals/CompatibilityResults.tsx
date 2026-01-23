/**
 * @fileoverview Compatibility results component for the Life Goals feature.
 * Shows treatment compatibility results with visual scores, explanations,
 * and discussion prompts based on the user's selected goals.
 *
 * @module components/goals/CompatibilityResults
 * @version 1.0.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CompatibilityBar from './CompatibilityBar';
import {
  type GoalTreatmentType,
  TREATMENT_DISPLAY,
  calculateCompatibility,
  getTopExplanations,
  getDiscussionPrompts,
} from '../../data/goalCompatibility';

/**
 * Props for the CompatibilityResults component.
 */
interface CompatibilityResultsProps {
  /** IDs of selected goals */
  selectedGoalIds: string[];
  /** Callback to go back to goal selection */
  onBack: () => void;
}

/**
 * Treatment result with computed score.
 */
interface TreatmentResult {
  type: GoalTreatmentType;
  labelKey: string;
  score: number;
  strengths: string[];
  challenges: string[];
}

/**
 * All treatment types in display order.
 */
const ALL_TREATMENTS: GoalTreatmentType[] = [
  'transplant-living',
  'transplant-deceased',
  'home-hd',
  'unit-hd',
  'apd',
  'capd',
  'conservative',
];

/**
 * Shows treatment compatibility results with visual scores.
 * Calculates and displays how well each treatment aligns with the user's goals.
 */
export default function CompatibilityResults({
  selectedGoalIds,
  onBack,
}: CompatibilityResultsProps) {
  const { t } = useTranslation();
  const [expandedTreatment, setExpandedTreatment] = useState<GoalTreatmentType | null>(null);

  // Calculate compatibility for all treatments
  const results: TreatmentResult[] = useMemo(() => {
    return ALL_TREATMENTS
      .map((type) => {
        const score = calculateCompatibility(selectedGoalIds, type);
        const { strengths, challenges } = getTopExplanations(selectedGoalIds, type);
        return {
          type,
          labelKey: TREATMENT_DISPLAY[type].labelKey,
          score,
          strengths,
          challenges,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [selectedGoalIds]);

  // Get discussion prompts
  const discussionPrompts = useMemo(
    () => getDiscussionPrompts(selectedGoalIds),
    [selectedGoalIds]
  );

  const bestScore = results[0]?.score || 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Results header */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-18 sm:h-18 mx-auto mb-4 bg-gradient-to-br from-nhs-green/20 to-nhs-green/10 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 sm:w-9 sm:h-9 text-nhs-green" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('lifeGoals.results.title')}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto">
            {t('lifeGoals.results.description', {
              count: selectedGoalIds.length,
            })}
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6 p-3 sm:p-4 bg-nhs-pale-grey/30 rounded-xl">
          <div className="text-center">
            <span className="block text-2xl sm:text-3xl font-bold text-nhs-blue">
              {selectedGoalIds.length}
            </span>
            <span className="text-xs sm:text-sm text-text-muted">
              {t('lifeGoals.results.goalsSelected')}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-2xl sm:text-3xl font-bold text-nhs-green">
              {bestScore}%
            </span>
            <span className="text-xs sm:text-sm text-text-muted">
              {t('lifeGoals.results.bestMatchScore')}
            </span>
          </div>
        </div>
      </div>

      {/* Treatment compatibility bars */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
          {t('lifeGoals.results.treatmentScores')}
        </h3>

        <div className="space-y-3 sm:space-y-4">
          {results.map((result, index) => (
            <CompatibilityBar
              key={result.type}
              treatmentLabelKey={result.labelKey}
              score={result.score}
              isBestMatch={index === 0 && result.score > 0}
              strengths={result.strengths}
              challenges={result.challenges}
              isExpanded={expandedTreatment === result.type}
              onToggleExpand={() =>
                setExpandedTreatment(
                  expandedTreatment === result.type ? null : result.type
                )
              }
            />
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-nhs-warm-yellow/10 rounded-xl border border-nhs-warm-yellow/20">
          <p className="text-xs sm:text-sm text-text-secondary">
            <strong>{t('lifeGoals.results.note')}:</strong>{' '}
            {t('lifeGoals.results.disclaimer')}
          </p>
        </div>
      </div>

      {/* Discussion prompts */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
          {t('lifeGoals.results.discussTitle')}
        </h3>

        <p className="text-sm sm:text-base text-text-secondary mb-4">
          {t('lifeGoals.results.discussIntro')}
        </p>

        <ul className="space-y-2 sm:space-y-3">
          {discussionPrompts.map((promptKey, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 sm:p-4 bg-nhs-blue/5 rounded-xl border border-nhs-blue/10"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-nhs-blue text-white flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <span className="text-sm sm:text-base text-text-primary">
                {t(promptKey)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey">
        <h3 className="text-base sm:text-lg font-bold text-text-primary mb-4 sm:mb-6 text-center">
          {t('lifeGoals.results.nextSteps')}
        </h3>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="px-4 sm:px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white active:scale-95 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation"
          >
            {t('lifeGoals.results.editGoals')}
          </button>
          <Link
            to="/compare"
            className="px-4 sm:px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white active:scale-95 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation text-center no-underline inline-flex items-center justify-center"
          >
            {t('lifeGoals.results.compareTreatments')}
          </Link>
          <Link
            to="/summary"
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation text-center no-underline inline-flex items-center justify-center"
          >
            {t('lifeGoals.results.viewSummary')}
          </Link>
        </div>

        {/* Back to Hub */}
        <div className="text-center pt-4 sm:pt-6 border-t border-nhs-pale-grey">
          <Link
            to="/hub"
            className="inline-flex items-center gap-2 text-nhs-blue font-medium hover:bg-nhs-blue/5 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 no-underline"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            {t('nav.backToHub')}
          </Link>
        </div>
      </div>
    </div>
  );
}
