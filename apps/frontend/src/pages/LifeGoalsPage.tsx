/**
 * @fileoverview Life Goals Compatibility page for the NHS Renal Decision Aid.
 * Helps patients understand how different kidney treatment options align
 * with their personal life goals through an interactive selection and
 * compatibility analysis exercise.
 *
 * @module pages/LifeGoalsPage
 * @version 1.0.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 *
 * @requires react
 * @requires react-i18next
 * @requires react-router-dom
 * @requires @/components/goals/GoalCategoryCard
 * @requires @/components/goals/CompatibilityResults
 * @requires @/data/goalCompatibility
 * @requires @/context/SessionContext
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GoalCategoryCard from '../components/goals/GoalCategoryCard';
import CompatibilityResults from '../components/goals/CompatibilityResults';
import { useSession } from '../context/SessionContext';
import {
  GOAL_CATEGORIES,
  LIFE_GOALS,
  type GoalCategory,
} from '../data/goalCompatibility';

/**
 * View states for the life goals page.
 */
type ViewState = 'selection' | 'results';

/**
 * Life Goals Compatibility page component.
 * Guides users through selecting personal life goals and shows
 * how each treatment option aligns with their priorities.
 */
export default function LifeGoalsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, updateLifeGoals } = useSession();

  // State
  const [viewState, setViewState] = useState<ViewState>('selection');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    session?.lifeGoals || []
  );
  const [expandedCategory, setExpandedCategory] = useState<GoalCategory | null>(null);

  // Group goals by category
  const goalsByCategory = useMemo(() => {
    const grouped: Record<GoalCategory, typeof LIFE_GOALS> = {
      work: [],
      family: [],
      travel: [],
      hobbies: [],
      independence: [],
      religious: [],
    };
    LIFE_GOALS.forEach((goal) => {
      grouped[goal.category].push(goal);
    });
    return grouped;
  }, []);

  /**
   * Toggles a goal's selected state.
   */
  const handleToggleGoal = useCallback((goalId: string) => {
    setSelectedGoals((prev) => {
      const next = prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId];
      return next;
    });
  }, []);

  /**
   * Toggles a category's expanded state.
   */
  const handleToggleCategory = useCallback((category: GoalCategory) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  }, []);

  /**
   * Proceeds to results view and saves goals to session.
   */
  const handleViewResults = useCallback(() => {
    updateLifeGoals(selectedGoals);
    setViewState('results');
    window.scrollTo(0, 0);
  }, [selectedGoals, updateLifeGoals]);

  /**
   * Goes back to selection view.
   */
  const handleBackToSelection = useCallback(() => {
    setViewState('selection');
    window.scrollTo(0, 0);
  }, []);

  // Results view
  if (viewState === 'results') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30" id="main-content">
        <div className="max-w-container-lg mx-auto px-4 py-6 sm:py-8 md:py-12">
          <div className="max-w-[900px] mx-auto">
            <CompatibilityResults
              selectedGoalIds={selectedGoals}
              onBack={handleBackToSelection}
            />
          </div>
        </div>
      </main>
    );
  }

  // Selection view
  return (
    <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30" id="main-content">
      <div className="max-w-container-lg mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-[900px] mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 md:p-10 border border-nhs-pale-grey mb-6 sm:mb-8">
            {/* Decorative background */}
            <div className="relative">
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl sm:rounded-2xl" aria-hidden="true">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-nhs-green/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-nhs-blue/5 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                {/* Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-nhs-blue/20 to-nhs-green/10 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3 sm:mb-4 text-center tracking-tight">
                  {t('lifeGoals.title')}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-text-secondary text-center max-w-[650px] mx-auto mb-6 sm:mb-8 leading-relaxed">
                  {t('lifeGoals.introduction')}
                </p>

                {/* How it works */}
                <div className="bg-nhs-blue/5 rounded-xl p-4 sm:p-6 border border-nhs-blue/15">
                  <h2 className="text-base sm:text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    {t('lifeGoals.howItWorks.title')}
                  </h2>
                  <ol className="space-y-2 text-sm sm:text-base text-text-secondary">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                      {t('lifeGoals.howItWorks.step1')}
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                      {t('lifeGoals.howItWorks.step2')}
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-nhs-blue text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                      {t('lifeGoals.howItWorks.step3')}
                    </li>
                  </ol>
                </div>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-5 sm:mt-6 text-xs sm:text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5 bg-nhs-pale-grey/50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    {t('lifeGoals.feature.time')}
                  </span>
                  <span className="flex items-center gap-1.5 bg-nhs-pale-grey/50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    {t('lifeGoals.feature.noRightWrong')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category cards */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary px-1">
              {t('lifeGoals.selectCategories')}
            </h2>

            {GOAL_CATEGORIES.map((cat) => (
              <GoalCategoryCard
                key={cat.id}
                category={cat.id}
                titleKey={cat.titleKey}
                descriptionKey={cat.descriptionKey}
                goals={goalsByCategory[cat.id]}
                selectedGoals={selectedGoals}
                isExpanded={expandedCategory === cat.id}
                onToggleExpand={() => handleToggleCategory(cat.id)}
                onToggleGoal={handleToggleGoal}
              />
            ))}
          </div>

          {/* Selected summary and action */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 border border-nhs-pale-grey sticky bottom-4 z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <span className="text-sm sm:text-base text-text-secondary">
                  {selectedGoals.length === 0
                    ? t('lifeGoals.noGoalsSelected')
                    : t('lifeGoals.goalsSelected', { count: selectedGoals.length })}
                </span>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/hub')}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-3 text-nhs-blue font-medium border-2 border-nhs-blue rounded-xl hover:bg-nhs-blue hover:text-white active:scale-95 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation"
                >
                  {t('nav.backToHub')}
                </button>
                <button
                  onClick={handleViewResults}
                  disabled={selectedGoals.length === 0}
                  className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-3 bg-gradient-to-r from-nhs-blue to-[#003087] text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[48px] touch-manipulation"
                >
                  {t('lifeGoals.seeResults')}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
