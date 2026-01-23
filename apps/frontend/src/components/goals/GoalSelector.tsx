/**
 * @fileoverview Goal selector component for the Life Goals feature.
 * Displays selectable goals within an expanded category card.
 *
 * @module components/goals/GoalSelector
 * @version 1.0.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 */

import { useTranslation } from 'react-i18next';
import type { LifeGoal } from '../../data/goalCompatibility';

/**
 * Props for the GoalSelector component.
 */
interface GoalSelectorProps {
  /** Goals to display for selection */
  goals: LifeGoal[];
  /** Currently selected goal IDs */
  selectedGoals: string[];
  /** Callback when a goal is toggled */
  onToggleGoal: (goalId: string) => void;
}

/**
 * The goal selection interface within a category.
 * Displays goals as toggle buttons with checkmark indicators.
 */
export default function GoalSelector({
  goals,
  selectedGoals,
  onToggleGoal,
}: GoalSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 sm:space-y-3" role="group" aria-label={t('lifeGoals.selectGoals')}>
      {goals.map((goal) => {
        const isSelected = selectedGoals.includes(goal.id);
        return (
          <button
            key={goal.id}
            onClick={() => onToggleGoal(goal.id)}
            className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left min-h-[52px] touch-manipulation focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 ${
              isSelected
                ? 'border-nhs-blue bg-nhs-blue/5 shadow-sm'
                : 'border-nhs-pale-grey bg-white hover:border-nhs-blue/30 hover:bg-nhs-blue/5 active:scale-[0.98]'
            }`}
            role="checkbox"
            aria-checked={isSelected}
            aria-label={t(goal.labelKey)}
          >
            {/* Checkbox indicator */}
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected
                  ? 'bg-nhs-blue text-white shadow-sm'
                  : 'bg-nhs-pale-grey border-2 border-nhs-mid-grey'
              }`}
              aria-hidden="true"
            >
              {isSelected && (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

            {/* Goal label */}
            <span className={`text-sm sm:text-base font-medium flex-1 ${
              isSelected ? 'text-nhs-blue' : 'text-text-primary'
            }`}>
              {t(goal.labelKey)}
            </span>

            {/* Selected indicator */}
            {isSelected && (
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
