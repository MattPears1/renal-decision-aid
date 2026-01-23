/**
 * @fileoverview Goal category card component for the Life Goals feature.
 * Displays a category with icon, title, description, and expand/collapse
 * functionality to reveal the goal selection interface.
 *
 * @module components/goals/GoalCategoryCard
 * @version 1.0.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 */

import { useTranslation } from 'react-i18next';
import type { GoalCategory, LifeGoal } from '../../data/goalCompatibility';
import GoalSelector from './GoalSelector';

/**
 * Props for the GoalCategoryCard component.
 */
interface GoalCategoryCardProps {
  /** Category identifier */
  category: GoalCategory;
  /** Translation key for the category title */
  titleKey: string;
  /** Translation key for the category description */
  descriptionKey: string;
  /** Goals within this category */
  goals: LifeGoal[];
  /** Currently selected goal IDs */
  selectedGoals: string[];
  /** Whether this category is expanded */
  isExpanded: boolean;
  /** Callback when expand/collapse is toggled */
  onToggleExpand: () => void;
  /** Callback when a goal is toggled */
  onToggleGoal: (goalId: string) => void;
}

/**
 * Category icon SVGs.
 */
function CategoryIcon({ category }: { category: GoalCategory }) {
  switch (category) {
    case 'work':
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
        </svg>
      );
    case 'family':
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case 'travel':
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      );
    case 'hobbies':
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93C7.06 19.43 4 16.07 4 12zm13.89 5.4c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.11 5.4z" />
        </svg>
      );
    case 'independence':
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    case 'religious':
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Returns the colour classes for each category.
 */
function getCategoryColors(category: GoalCategory): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (category) {
    case 'work':
      return { bg: 'bg-nhs-blue/10', border: 'border-nhs-blue/30', text: 'text-nhs-blue', icon: 'text-nhs-blue' };
    case 'family':
      return { bg: 'bg-nhs-pink/10', border: 'border-nhs-pink/30', text: 'text-nhs-pink', icon: 'text-nhs-pink' };
    case 'travel':
      return { bg: 'bg-nhs-green/10', border: 'border-nhs-green/30', text: 'text-nhs-green', icon: 'text-nhs-green' };
    case 'hobbies':
      return { bg: 'bg-[#7C2855]/10', border: 'border-[#7C2855]/30', text: 'text-[#7C2855]', icon: 'text-[#7C2855]' };
    case 'independence':
      return { bg: 'bg-nhs-warm-yellow/10', border: 'border-nhs-warm-yellow/30', text: 'text-nhs-warm-yellow', icon: 'text-nhs-warm-yellow' };
    case 'religious':
      return { bg: 'bg-[#330072]/10', border: 'border-[#330072]/30', text: 'text-[#330072]', icon: 'text-[#330072]' };
    default:
      return { bg: 'bg-nhs-blue/10', border: 'border-nhs-blue/30', text: 'text-nhs-blue', icon: 'text-nhs-blue' };
  }
}

/**
 * A card component for each goal category with icon, title, description,
 * and expand/collapse functionality.
 */
export default function GoalCategoryCard({
  category,
  titleKey,
  descriptionKey,
  goals,
  selectedGoals,
  isExpanded,
  onToggleExpand,
  onToggleGoal,
}: GoalCategoryCardProps) {
  const { t } = useTranslation();
  const colors = getCategoryColors(category);

  // Count selected goals in this category
  const selectedCount = goals.filter((g) => selectedGoals.includes(g.id)).length;

  return (
    <div className={`rounded-xl sm:rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
      isExpanded ? `${colors.border} shadow-md` : 'border-nhs-pale-grey hover:border-nhs-blue/20 hover:shadow-sm'
    }`}>
      {/* Header button */}
      <button
        onClick={onToggleExpand}
        className={`w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 rounded-t-xl sm:rounded-t-2xl min-h-[64px] touch-manipulation ${
          isExpanded ? colors.bg : 'bg-white hover:bg-nhs-pale-grey/30'
        }`}
        aria-expanded={isExpanded}
        aria-controls={`goals-${category}`}
      >
        {/* Icon */}
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.icon}`}>
          <CategoryIcon category={category} />
        </div>

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
            {t(titleKey)}
            {selectedCount > 0 && (
              <span className={`text-xs font-semibold ${colors.text} ${colors.bg} px-2 py-0.5 rounded-full`}>
                {selectedCount}
              </span>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5 line-clamp-2">
            {t(descriptionKey)}
          </p>
        </div>

        {/* Expand arrow */}
        <div className="flex-shrink-0">
          <svg
            className={`w-5 h-5 sm:w-6 sm:h-6 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div
          id={`goals-${category}`}
          className="p-4 sm:p-5 border-t border-nhs-pale-grey bg-white"
          role="region"
          aria-label={t(titleKey)}
        >
          <p className="text-xs sm:text-sm text-text-muted mb-3 sm:mb-4">
            {t('lifeGoals.selectGoalsPrompt')}
          </p>
          <GoalSelector
            goals={goals}
            selectedGoals={selectedGoals}
            onToggleGoal={onToggleGoal}
          />
        </div>
      )}
    </div>
  );
}
