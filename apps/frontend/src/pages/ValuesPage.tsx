/**
 * @fileoverview Enhanced values clarification page for the NHS Renal Decision Aid.
 * Helps users identify and prioritize what matters most to them when
 * considering kidney treatment options through an interactive rating exercise
 * with treatment alignment feedback.
 *
 * @module pages/ValuesPage
 * @version 3.0.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 *
 * @requires react
 * @requires react-i18next
 * @requires react-router-dom
 * @requires @/context/SessionContext
 * @requires @renal-decision-aid/shared-types
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import type { ValueRating } from '@renal-decision-aid/shared-types';

/**
 * Hook to provide haptic feedback on supported devices.
 * Falls back to visual feedback only on unsupported devices.
 */
function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Vibration not supported or permission denied
      }
    }
  }, []);

  return { vibrate };
}

/**
 * Category configuration for value statements.
 */
type ValueCategory = 'lifestyle' | 'medical' | 'social';

/**
 * Category metadata for display.
 */
interface CategoryInfo {
  id: ValueCategory;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Treatment alignment scores for each value.
 */
interface TreatmentAlignment {
  transplant: number; // 1-5 how well this treatment aligns
  hemodialysis: number;
  peritoneal: number;
  conservative: number;
}

/**
 * Extended value statement with category and treatment alignment.
 */
interface ValueStatement {
  id: string;
  statement: string;
  hint?: string;
  example?: string;
  category: ValueCategory;
  alignment: TreatmentAlignment;
}

/**
 * Rating label configuration.
 */
interface RatingLabel {
  value: number;
  label: string;
  shortLabel: string;
}

/**
 * Treatment match result.
 */
interface TreatmentMatch {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  strengths: string[];
}

/**
 * Category icons for display.
 */
const CATEGORY_ICONS: Record<ValueCategory, React.ReactNode> = {
  lifestyle: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  medical: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
    </svg>
  ),
  social: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
};

/**
 * Category metadata for styling.
 */
const CATEGORY_INFO: Record<ValueCategory, CategoryInfo> = {
  lifestyle: {
    id: 'lifestyle',
    icon: CATEGORY_ICONS.lifestyle,
    color: 'text-nhs-green',
    bgColor: 'bg-nhs-green/10',
    borderColor: 'border-nhs-green/30',
  },
  medical: {
    id: 'medical',
    icon: CATEGORY_ICONS.medical,
    color: 'text-nhs-blue',
    bgColor: 'bg-nhs-blue/10',
    borderColor: 'border-nhs-blue/30',
  },
  social: {
    id: 'social',
    icon: CATEGORY_ICONS.social,
    color: 'text-nhs-pink',
    bgColor: 'bg-nhs-pink/10',
    borderColor: 'border-nhs-pink/30',
  },
};

/**
 * Statement configuration with treatment alignment scores.
 * Higher scores (1-5) indicate better alignment with that treatment.
 */
const STATEMENT_CONFIGS: Array<{
  id: string;
  category: ValueCategory;
  alignment: TreatmentAlignment;
}> = [
  {
    id: 'travel',
    category: 'lifestyle',
    alignment: { transplant: 5, hemodialysis: 2, peritoneal: 4, conservative: 3 },
  },
  {
    id: 'hospitalTime',
    category: 'lifestyle',
    alignment: { transplant: 4, hemodialysis: 1, peritoneal: 5, conservative: 5 },
  },
  {
    id: 'needles',
    category: 'medical',
    alignment: { transplant: 3, hemodialysis: 2, peritoneal: 5, conservative: 5 },
  },
  {
    id: 'independence',
    category: 'lifestyle',
    alignment: { transplant: 5, hemodialysis: 2, peritoneal: 4, conservative: 4 },
  },
  {
    id: 'familyBurden',
    category: 'social',
    alignment: { transplant: 4, hemodialysis: 3, peritoneal: 3, conservative: 2 },
  },
  {
    id: 'longevity',
    category: 'medical',
    alignment: { transplant: 5, hemodialysis: 4, peritoneal: 4, conservative: 2 },
  },
  {
    id: 'qualityOfLife',
    category: 'medical',
    alignment: { transplant: 5, hemodialysis: 3, peritoneal: 4, conservative: 4 },
  },
  {
    id: 'homeTreatment',
    category: 'lifestyle',
    alignment: { transplant: 4, hemodialysis: 2, peritoneal: 5, conservative: 5 },
  },
  {
    id: 'workActivities',
    category: 'lifestyle',
    alignment: { transplant: 5, hemodialysis: 2, peritoneal: 4, conservative: 3 },
  },
  {
    id: 'professionalCare',
    category: 'social',
    alignment: { transplant: 3, hemodialysis: 5, peritoneal: 2, conservative: 4 },
  },
];

/**
 * Available rating values from 1 (not important) to 5 (very important).
 */
const RATING_VALUES = [1, 2, 3, 4, 5];

/**
 * Maps numeric rating values to translation key suffixes.
 */
const RATING_LABEL_KEYS: Record<number, string> = {
  1: 'notImportant',
  2: 'slightlyImportant',
  3: 'moderatelyImportant',
  4: 'important',
  5: 'veryImportant',
};

/**
 * View mode states for the values exercise.
 */
type ViewMode = 'intro' | 'one-at-a-time' | 'all-at-once' | 'results';

/**
 * Values clarification page component.
 * Guides users through rating value statements with treatment alignment feedback.
 */
export default function ValuesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, addValueRating } = useSession();
  const { vibrate } = useHapticFeedback();

  const [viewMode, setViewMode] = useState<ViewMode>('intro');
  const [currentStatement, setCurrentStatement] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [recentlySelected, setRecentlySelected] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<ValueCategory | null>(null);
  const [showTreatmentHints, setShowTreatmentHints] = useState(true);

  // Refs for focus management
  const statementRef = useRef<HTMLHeadingElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Translated value statements with examples and treatment alignment
  const VALUE_STATEMENTS: ValueStatement[] = useMemo(
    () =>
      STATEMENT_CONFIGS.map(({ id, category, alignment }) => ({
        id,
        statement: t(`values.statements.${id}.text`),
        hint: t(`values.statements.${id}.hint`),
        example: t(`values.statements.${id}.example`, ''),
        category,
        alignment,
      })),
    [t]
  );

  // Group statements by category
  const GROUPED_STATEMENTS = useMemo(() => {
    const groups: Record<ValueCategory, ValueStatement[]> = {
      lifestyle: [],
      medical: [],
      social: [],
    };
    VALUE_STATEMENTS.forEach((stmt) => {
      groups[stmt.category].push(stmt);
    });
    return groups;
  }, [VALUE_STATEMENTS]);

  // Translated rating labels
  const RATING_LABELS: RatingLabel[] = useMemo(
    () =>
      RATING_VALUES.map((value) => ({
        value,
        label: t(`values.ratingLabels.${RATING_LABEL_KEYS[value]}`),
        shortLabel: String(value),
      })),
    [t]
  );

  /**
   * Calculates treatment alignment scores based on user ratings.
   */
  const getTreatmentMatches = useCallback((): TreatmentMatch[] => {
    const treatments: Array<{ id: string; key: keyof TreatmentAlignment }> = [
      { id: 'transplant', key: 'transplant' },
      { id: 'hemodialysis', key: 'hemodialysis' },
      { id: 'peritoneal', key: 'peritoneal' },
      { id: 'conservative', key: 'conservative' },
    ];

    return treatments
      .map(({ id, key }) => {
        let totalScore = 0;
        let maxPossible = 0;
        const strengths: string[] = [];

        STATEMENT_CONFIGS.forEach((config) => {
          const userRating = ratings[config.id] || 0;
          if (userRating >= 4) {
            // Only count high-priority values
            const alignmentScore = config.alignment[key];
            totalScore += alignmentScore * userRating;
            maxPossible += 5 * userRating;

            if (alignmentScore >= 4) {
              const stmt = VALUE_STATEMENTS.find((s) => s.id === config.id);
              if (stmt) strengths.push(stmt.statement);
            }
          }
        });

        const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

        return {
          id,
          name: t(`values.treatments.${id}`, id),
          score: totalScore,
          maxScore: maxPossible,
          percentage,
          strengths: strengths.slice(0, 3),
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [ratings, VALUE_STATEMENTS, t]);

  /**
   * Handles user rating of a value statement.
   */
  const handleRating = useCallback(
    (statementId: string, rating: 1 | 2 | 3 | 4 | 5) => {
      // Provide haptic feedback
      vibrate(rating >= 4 ? [10, 30, 10] : 10);

      // Visual feedback for selection
      setRecentlySelected(`${statementId}-${rating}`);
      setTimeout(() => setRecentlySelected(null), 400);

      setRatings((prev) => ({ ...prev, [statementId]: rating }));

      // Announce to screen readers
      const ratingLabel = t(`values.ratingLabels.${RATING_LABEL_KEYS[rating]}`);
      setAnnouncement(t('values.accessibility.ratingSelected', { rating: ratingLabel }));

      // Save to session
      const valueRating: ValueRating = {
        statementId,
        rating,
      };
      addValueRating(valueRating);
    },
    [vibrate, t, addValueRating]
  );

  // Focus management when changing statements
  useEffect(() => {
    if (viewMode === 'one-at-a-time' && statementRef.current) {
      statementRef.current.focus();
    }
  }, [currentStatement, viewMode]);

  // Focus management when viewing results
  useEffect(() => {
    if (viewMode === 'results' && resultsRef.current) {
      resultsRef.current.focus();
    }
  }, [viewMode]);

  /**
   * Navigates to the next statement or results view if at the end.
   */
  const goToNextStatement = () => {
    if (currentStatement < VALUE_STATEMENTS.length - 1) {
      setCurrentStatement((prev) => prev + 1);
    } else {
      setViewMode('results');
    }
  };

  /**
   * Navigates to the previous statement or intro view if at the beginning.
   */
  const goToPreviousStatement = () => {
    if (currentStatement > 0) {
      setCurrentStatement((prev) => prev - 1);
    } else {
      setViewMode('intro');
    }
  };

  /**
   * Calculates the current progress percentage.
   */
  const getProgress = () => {
    return Math.round(((currentStatement + 1) / VALUE_STATEMENTS.length) * 100);
  };

  /**
   * Gets the count of completed ratings.
   */
  const getCompletedCount = () => {
    return Object.keys(ratings).length;
  };

  /**
   * Gets the user's top priorities (ratings of 4 or 5).
   */
  const getTopPriorities = () => {
    return Object.entries(ratings)
      .filter(([, rating]) => rating >= 4)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, rating]) => ({
        id,
        rating,
        statement: VALUE_STATEMENTS.find((s) => s.id === id)?.statement || '',
        category: VALUE_STATEMENTS.find((s) => s.id === id)?.category || 'lifestyle',
      }));
  };

  /**
   * Gets treatment alignment indicator for a single value.
   */
  const getTreatmentIndicator = (alignment: TreatmentAlignment) => {
    const treatments = [
      { key: 'transplant', label: t('values.treatmentShort.transplant', 'T'), score: alignment.transplant },
      { key: 'hemodialysis', label: t('values.treatmentShort.hemodialysis', 'HD'), score: alignment.hemodialysis },
      { key: 'peritoneal', label: t('values.treatmentShort.peritoneal', 'PD'), score: alignment.peritoneal },
      { key: 'conservative', label: t('values.treatmentShort.conservative', 'CC'), score: alignment.conservative },
    ];

    return treatments
      .filter((tr) => tr.score >= 4)
      .map((tr) => tr.label)
      .join(', ');
  };

  /**
   * Completes the all-at-once view and shows results.
   */
  const handleFinishAllAtOnce = () => {
    setViewMode('results');
  };

  // Introduction View - Enhanced with explanation of why values matter
  if (viewMode === 'intro') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30" id="main-content">
        <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[800px] mx-auto">
            {/* Main intro card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 text-center border border-nhs-pale-grey overflow-hidden relative mb-6">
              {/* Decorative background */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-nhs-pink/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-nhs-blue/5 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                {/* Icon */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-nhs-pink/20 to-nhs-pink/10 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-nhs-pink" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight">
                  {t('values.intro.title', 'What Matters Most to You?')}
                </h1>
                <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8 max-w-[600px] mx-auto leading-relaxed">
                  {t(
                    'values.intro.description',
                    'Choosing a kidney treatment is a personal decision. This exercise helps you think about your values and priorities so you can discuss them with your kidney team.'
                  )}
                </p>

                {/* Why values matter section */}
                <div className="bg-nhs-blue/5 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-left border border-nhs-blue/20">
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    {t('values.intro.whyMattersTitle', 'Why Your Values Matter')}
                  </h2>
                  <p className="text-sm sm:text-base text-text-secondary mb-4">
                    {t(
                      'values.intro.whyMattersText',
                      'Every kidney treatment has different effects on your daily life. Understanding what matters most to you helps identify which treatment options might suit you best.'
                    )}
                  </p>
                  <ul className="space-y-2 text-sm sm:text-base text-text-secondary">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-green flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      {t('values.intro.benefit1', 'See how each treatment aligns with your priorities')}
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-green flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      {t('values.intro.benefit2', 'Prepare for conversations with your kidney team')}
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-green flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      {t('values.intro.benefit3', 'Feel more confident in your decision-making')}
                    </li>
                  </ul>
                </div>

                {/* Features - Enhanced cards with categories */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {(['lifestyle', 'medical', 'social'] as ValueCategory[]).map((category) => {
                    const info = CATEGORY_INFO[category];
                    return (
                      <div
                        key={category}
                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 ${info.bgColor} rounded-xl text-center border ${info.borderColor}`}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${info.bgColor} rounded-xl flex items-center justify-center ${info.color}`}>
                          {info.icon}
                        </div>
                        <span className="text-sm sm:text-base text-text-primary font-medium">
                          {t(`values.categories.${category}`, category)}
                        </span>
                        <span className="text-xs text-text-muted">
                          {GROUPED_STATEMENTS[category].length} {t('values.intro.questions', 'questions')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Time and features */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5 bg-nhs-pale-grey/50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    {t('values.intro.feature2', 'Takes about 5 minutes')}
                  </span>
                  <span className="flex items-center gap-1.5 bg-nhs-pale-grey/50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    {t('values.intro.feature3', 'No right or wrong answers')}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setViewMode('one-at-a-time');
                    setCurrentStatement(0);
                  }}
                  className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-nhs-pink to-[#8a2150] text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2 min-h-[56px] touch-manipulation"
                >
                  {t('values.intro.beginButton', 'Begin Exercise')}
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-nhs-pale-grey">
                  <p className="text-sm text-text-secondary mb-2 sm:mb-3">
                    {t('values.intro.allAtOnce', 'Prefer to see all statements at once?')}
                  </p>
                  <button
                    onClick={() => setViewMode('all-at-once')}
                    className="text-nhs-blue font-semibold hover:text-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 rounded px-2 py-1"
                  >
                    {t('values.intro.viewAll', 'View All Statements')}
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="text-center">
              <button
                onClick={() => navigate('/hub')}
                className="inline-flex items-center gap-2 text-nhs-blue font-medium hover:bg-nhs-blue/5 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                {t('nav.backToHub', 'Back to Your Hub')}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // One-at-a-time View - Enhanced with treatment hints
  if (viewMode === 'one-at-a-time') {
    const statement = VALUE_STATEMENTS[currentStatement];
    const currentRating = ratings[statement.id];
    const categoryInfo = CATEGORY_INFO[statement.category];
    const treatmentHint = getTreatmentIndicator(statement.alignment);

    return (
      <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30" id="main-content">
        {/* Screen reader announcements */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        <div className="max-w-container-lg mx-auto px-4 py-6 sm:py-8 md:py-12">
          {/* Progress Bar */}
          <div
            className="mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-nhs-pale-grey"
            role="progressbar"
            aria-valuenow={currentStatement + 1}
            aria-valuemin={1}
            aria-valuemax={VALUE_STATEMENTS.length}
            aria-label={t('values.accessibility.progressLabel', 'Exercise progress')}
          >
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${categoryInfo.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center ${categoryInfo.color}`}>
                  {categoryInfo.icon}
                </div>
                <div>
                  <span className="text-sm sm:text-base font-semibold text-text-primary block">
                    {t('values.progress.statement', 'Statement')} {currentStatement + 1} {t('values.progress.of', 'of')} {VALUE_STATEMENTS.length}
                  </span>
                  <span className={`text-xs ${categoryInfo.color} font-medium`}>
                    {t(`values.categories.${statement.category}`, statement.category)}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-nhs-pink bg-nhs-pink/10 px-2.5 sm:px-3 py-1 rounded-full">
                {getProgress()}%
              </span>
            </div>
            <div className="h-2 sm:h-3 bg-nhs-pale-grey rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-nhs-pink to-[#8a2150] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          {/* Statement Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 md:p-12 border border-nhs-pale-grey animate-fade-in">
            <div className="mb-6 sm:mb-10">
              <div className="flex items-start gap-2 sm:gap-4 mb-4 sm:mb-6">
                <h2
                  ref={statementRef}
                  tabIndex={-1}
                  className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary flex-1 leading-tight focus:outline-none"
                  id={`statement-${currentStatement}`}
                >
                  "{statement.statement}"
                </h2>
                <button
                  className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-nhs-blue/10 text-nhs-blue flex items-center justify-center hover:bg-nhs-blue hover:text-white active:scale-95 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 touch-manipulation"
                  aria-label={t('values.listenStatement', 'Listen to this statement')}
                >
                  <svg className="w-5 h-5 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                </button>
              </div>

              {/* Hint with example */}
              <div className="space-y-2 sm:space-y-3">
                <p className="flex items-start gap-2 sm:gap-3 text-text-secondary bg-nhs-blue/5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-blue flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  {statement.hint || t('values.defaultHint', 'Rate how important this is to you from 1 (Not important) to 5 (Very important)')}
                </p>

                {/* Example */}
                {statement.example && (
                  <p className="flex items-start gap-2 sm:gap-3 text-text-muted bg-nhs-warm-yellow/10 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm border border-nhs-warm-yellow/20">
                    <svg className="w-4 h-4 text-nhs-warm-yellow flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>
                      <strong>{t('values.example', 'Example')}:</strong> {statement.example}
                    </span>
                  </p>
                )}

                {/* Treatment alignment hint */}
                {showTreatmentHints && treatmentHint && (
                  <div className="flex items-center justify-between bg-nhs-green/5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-nhs-green/20">
                    <span className="text-xs sm:text-sm text-text-muted flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-nhs-green" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      {t('values.treatmentHint', 'Strong match with')}: <strong className="text-nhs-green">{treatmentHint}</strong>
                    </span>
                    <button
                      onClick={() => setShowTreatmentHints(false)}
                      className="text-xs text-text-muted hover:text-text-secondary p-1"
                      aria-label={t('values.hideTreatmentHints', 'Hide treatment hints')}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Scale - Enhanced mobile touch */}
            <div className="py-4 sm:py-10" role="radiogroup" aria-labelledby={`statement-${currentStatement}`}>
              {/* Visual track connecting the options */}
              <div className="relative max-w-2xl mx-auto mb-2 px-6 sm:px-12 hidden sm:block" aria-hidden="true">
                <div className="h-1 bg-gradient-to-r from-nhs-pale-grey via-nhs-blue/30 to-nhs-pink/50 rounded-full" />
              </div>

              <div className="flex justify-between items-end gap-1 sm:gap-4 max-w-2xl mx-auto px-1 sm:px-2">
                {RATING_LABELS.map((option) => {
                  const isSelected = currentRating === option.value;
                  const isRecentlySelected = recentlySelected === `${statement.id}-${option.value}`;

                  return (
                    <label key={option.value} className="flex flex-col items-center cursor-pointer group flex-1 touch-manipulation">
                      <input
                        type="radio"
                        name={`rating-${statement.id}`}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleRating(statement.id, option.value as 1 | 2 | 3 | 4 | 5)}
                        className="sr-only"
                        aria-describedby={`rating-description-${option.value}`}
                      />
                      <span
                        className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 min-w-[56px] min-h-[56px] rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-3 transition-all duration-200 ${
                          isSelected
                            ? `bg-gradient-to-br from-nhs-pink to-[#8a2150] text-white shadow-lg ring-4 ring-nhs-pink/30 scale-110 ${
                                isRecentlySelected ? 'animate-value-pop' : ''
                              }`
                            : 'bg-nhs-pale-grey text-text-primary shadow-sm group-hover:bg-nhs-pink/10 group-hover:text-nhs-pink group-hover:scale-105 group-focus-within:ring-2 group-focus-within:ring-nhs-pink active:scale-95'
                        }`}
                      >
                        {option.shortLabel}
                      </span>
                      <span
                        id={`rating-description-${option.value}`}
                        className={`text-[10px] sm:text-xs md:text-sm text-center max-w-[60px] sm:max-w-[80px] leading-tight font-medium transition-colors ${
                          isSelected ? 'text-nhs-pink font-bold' : 'text-text-secondary group-hover:text-nhs-pink'
                        }`}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Visual scale indicator */}
              <div className="flex justify-between max-w-2xl mx-auto mt-4 sm:mt-6 px-4 sm:px-8">
                <span className="text-[10px] sm:text-xs text-text-muted flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                  </svg>
                  {t('values.scale.lessImportant', 'Less important')}
                </span>
                <span className="text-[10px] sm:text-xs text-text-muted flex items-center gap-1">
                  {t('values.scale.moreImportant', 'More important')}
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Navigation - Enhanced touch targets */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-nhs-pale-grey">
              <button
                onClick={goToPreviousStatement}
                className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-3 text-nhs-blue font-medium hover:bg-nhs-blue/5 active:scale-95 rounded-xl transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                {t('values.nav.back', 'Back')}
              </button>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={goToNextStatement}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-3 text-text-secondary hover:text-text-primary hover:bg-nhs-pale-grey/50 active:scale-95 rounded-xl transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation"
                >
                  {t('values.nav.skip', 'Skip')}
                </button>
                <button
                  onClick={goToNextStatement}
                  className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-nhs-pink to-[#8a2150] text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation"
                >
                  {currentStatement === VALUE_STATEMENTS.length - 1 ? t('values.nav.finish', 'Finish') : t('values.nav.next', 'Next')}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // All-at-once View - Grouped by category
  if (viewMode === 'all-at-once') {
    return (
      <main className="min-h-screen bg-bg-page" id="main-content">
        <div className="max-w-container-lg mx-auto px-4 py-6 sm:py-8 md:py-12">
          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
              {t('values.allAtOnce.title', 'Rate All Statements')}
            </h1>
            <p className="text-base sm:text-lg text-text-secondary">
              {t('values.allAtOnce.description', 'Rate each statement from 1 (Not important) to 5 (Very important).')}
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-sm text-text-secondary bg-nhs-pale-grey/50 px-3 py-1.5 rounded-full">
                {t('values.allAtOnce.progress', 'Completed')}: {getCompletedCount()} / {VALUE_STATEMENTS.length}
              </span>
              <div className="flex-1 h-2 bg-nhs-pale-grey rounded-full overflow-hidden max-w-[200px]">
                <div
                  className="h-full bg-nhs-green rounded-full transition-all duration-300"
                  style={{ width: `${(getCompletedCount() / VALUE_STATEMENTS.length) * 100}%` }}
                />
              </div>
            </div>
          </header>

          {/* Grouped Statements by Category */}
          <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
            {(['lifestyle', 'medical', 'social'] as ValueCategory[]).map((category) => {
              const categoryInfo = CATEGORY_INFO[category];
              const statements = GROUPED_STATEMENTS[category];
              const isExpanded = expandedCategory === category || expandedCategory === null;
              const completedInCategory = statements.filter((s) => ratings[s.id] !== undefined).length;

              return (
                <div key={category} className={`rounded-xl sm:rounded-2xl border ${categoryInfo.borderColor} overflow-hidden bg-white`}>
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded && expandedCategory !== null ? null : category)}
                    className={`w-full flex items-center justify-between p-4 sm:p-5 ${categoryInfo.bgColor} hover:brightness-95 transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-focus`}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${categoryInfo.color} bg-white/50`}>
                        {categoryInfo.icon}
                      </div>
                      <div className="text-left">
                        <h2 className="text-base sm:text-lg font-bold text-text-primary">{t(`values.categories.${category}`, category)}</h2>
                        <span className="text-xs sm:text-sm text-text-muted">
                          {completedInCategory}/{statements.length} {t('values.completed', 'completed')}
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                    </svg>
                  </button>

                  {/* Statements */}
                  {isExpanded && (
                    <div className="divide-y divide-nhs-pale-grey">
                      {statements.map((statement, index) => {
                        const currentRating = ratings[statement.id];
                        const isCompleted = currentRating !== undefined;

                        return (
                          <div key={statement.id} className={`p-4 sm:p-6 transition-colors ${isCompleted ? 'bg-nhs-green/5' : 'bg-white hover:bg-nhs-blue/5'}`}>
                            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                              <div
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                  isCompleted ? 'bg-nhs-green text-white' : 'bg-nhs-pale-grey text-text-primary'
                                }`}
                              >
                                {isCompleted ? (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-base sm:text-lg font-medium text-text-primary mb-1">{statement.statement}</p>
                                {statement.example && (
                                  <p className="text-xs sm:text-sm text-text-muted">
                                    <span className="font-medium">{t('values.example', 'Example')}:</span> {statement.example}
                                  </p>
                                )}
                              </div>
                              <button
                                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-nhs-blue/10 text-nhs-blue flex items-center justify-center hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
                                aria-label={t('values.listenStatement', 'Listen to this statement')}
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                                </svg>
                              </button>
                            </div>

                            {/* Mini Rating Scale */}
                            <div className="flex justify-center gap-2 sm:gap-3" role="radiogroup" aria-label={statement.statement}>
                              {RATING_LABELS.map((option) => (
                                <label key={option.value} className="flex flex-col items-center cursor-pointer touch-manipulation">
                                  <input
                                    type="radio"
                                    name={`rating-all-${statement.id}`}
                                    value={option.value}
                                    checked={currentRating === option.value}
                                    onChange={() => handleRating(statement.id, option.value as 1 | 2 | 3 | 4 | 5)}
                                    className="sr-only"
                                  />
                                  <span
                                    className={`w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold border-2 transition-all ${
                                      currentRating === option.value
                                        ? 'bg-gradient-to-br from-nhs-pink to-[#8a2150] border-nhs-pink text-white shadow-md scale-105'
                                        : 'bg-nhs-pale-grey border-transparent active:scale-95 hover:border-nhs-pink hover:bg-nhs-pink/10'
                                    }`}
                                  >
                                    {option.shortLabel}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-text-muted mt-1 hidden sm:block">{option.label.split(' ')[0]}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-nhs-pale-grey">
            <button
              onClick={() => setViewMode('intro')}
              className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-3 text-nhs-blue font-medium hover:bg-nhs-blue/5 rounded-xl focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              {t('values.nav.backToIntro', 'Back to Introduction')}
            </button>
            <button
              onClick={handleFinishAllAtOnce}
              disabled={getCompletedCount() === 0}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[52px] touch-manipulation"
            >
              {t('values.nav.seeResults', 'See My Results')}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Results View - Enhanced with treatment alignment and values profile
  const topPriorities = getTopPriorities();
  const treatmentMatches = getTreatmentMatches();
  const bestMatch = treatmentMatches[0];

  return (
    <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30" id="main-content">
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="max-w-container-lg mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div ref={resultsRef} tabIndex={-1} className="max-w-[900px] mx-auto focus:outline-none">
          {/* Header Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 md:p-10 border border-nhs-pale-grey mb-4 sm:mb-6 animate-fade-in">
            <header className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-nhs-green/20 to-nhs-green/10 rounded-2xl flex items-center justify-center animate-scale-in">
                <svg className="w-7 h-7 sm:w-10 sm:h-10 text-nhs-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2 sm:mb-4">
                {t('values.results.title', 'Your Values Profile')}
              </h1>
              <p className="text-sm sm:text-lg text-text-secondary max-w-lg mx-auto">
                {t('values.results.description', 'Based on your responses, here is what matters most to you and how treatments align with your values.')}
              </p>
            </header>

            {/* Summary stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6 sm:mb-8 p-3 sm:p-4 bg-nhs-pale-grey/30 rounded-xl">
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl font-bold text-nhs-blue">{getCompletedCount()}</span>
                <span className="text-xs sm:text-sm text-text-muted">{t('values.results.statementsRated', 'Statements rated')}</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl font-bold text-nhs-pink">{topPriorities.length}</span>
                <span className="text-xs sm:text-sm text-text-muted">{t('values.results.topPrioritiesCount', 'Top priorities')}</span>
              </div>
              {bestMatch.percentage > 0 && (
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl font-bold text-nhs-green">{bestMatch.percentage}%</span>
                  <span className="text-xs sm:text-sm text-text-muted">{t('values.results.bestMatchScore', 'Best match')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Treatment Alignment Card */}
          {getCompletedCount() >= 3 && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-nhs-blue/10 rounded-xl flex items-center justify-center" aria-hidden="true">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                </div>
                {t('values.results.treatmentAlignment', 'Treatment Alignment')}
              </h2>

              <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">
                {t('values.results.treatmentAlignmentDesc', 'Based on your priorities, here is how each treatment aligns with what matters to you.')}
              </p>

              <div className="space-y-3 sm:space-y-4">
                {treatmentMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all ${
                      index === 0 ? 'border-nhs-green bg-nhs-green/5' : 'border-nhs-pale-grey bg-bg-surface-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {index === 0 && (
                          <span className="text-[10px] sm:text-xs font-bold text-nhs-green bg-nhs-green/20 px-2 py-0.5 rounded-full">
                            {t('values.results.bestMatch', 'Best Match')}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-semibold text-text-primary">{match.name}</span>
                      </div>
                      <span
                        className={`text-lg sm:text-xl font-bold ${
                          match.percentage >= 70 ? 'text-nhs-green' : match.percentage >= 50 ? 'text-nhs-blue' : 'text-text-muted'
                        }`}
                      >
                        {match.percentage}%
                      </span>
                    </div>
                    <div className="h-2 sm:h-3 bg-nhs-pale-grey rounded-full overflow-hidden mb-2 sm:mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          match.percentage >= 70 ? 'bg-nhs-green' : match.percentage >= 50 ? 'bg-nhs-blue' : 'bg-text-muted'
                        }`}
                        style={{ width: `${match.percentage}%` }}
                      />
                    </div>
                    {match.strengths.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {match.strengths.map((strength, i) => (
                          <span key={i} className="text-[10px] sm:text-xs text-text-muted bg-white px-2 py-1 rounded-full border border-nhs-pale-grey">
                            {strength.length > 40 ? strength.substring(0, 40) + '...' : strength}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-text-muted mt-4 sm:mt-6 p-3 sm:p-4 bg-nhs-warm-yellow/10 rounded-xl border border-nhs-warm-yellow/20">
                <strong>{t('values.results.note', 'Note')}:</strong>{' '}
                {t(
                  'values.results.alignmentDisclaimer',
                  'This is a guide based on your stated preferences, not a medical recommendation. Your kidney team will help you find the best treatment for your specific situation.'
                )}
              </p>
            </div>
          )}

          {/* Top Priorities Card */}
          {topPriorities.length > 0 && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-nhs-warm-yellow/20 rounded-xl flex items-center justify-center" aria-hidden="true">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-warm-yellow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
                {t('values.results.topPriorities', 'Your Top Priorities')}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {topPriorities.map((priority, index) => {
                  const categoryInfo = CATEGORY_INFO[priority.category];
                  return (
                    <div
                      key={priority.id}
                      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 ${categoryInfo.bgColor} border-l-4 ${categoryInfo.borderColor} rounded-xl`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-nhs-pink to-[#8a2150] text-white flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0 shadow-md">
                        {index + 1}
                      </div>
                      <span className="flex-1 text-sm sm:text-base font-medium text-text-primary">{priority.statement}</span>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-text-secondary bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-warm-yellow" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="font-semibold">{priority.rating}/5</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No priorities message */}
          {topPriorities.length === 0 && getCompletedCount() > 0 && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey mb-4 sm:mb-6">
              <div className="p-4 bg-nhs-warm-yellow/10 border border-nhs-warm-yellow/30 rounded-xl text-center">
                <p className="text-text-secondary text-sm sm:text-base">
                  {t('values.results.noPriorities', 'No values were rated as "Important" or "Very important". You can edit your ratings to see your top priorities.')}
                </p>
              </div>
            </div>
          )}

          {/* All Values Breakdown Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-base sm:text-lg font-bold text-text-primary mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-nhs-pink/20 rounded-lg flex items-center justify-center" aria-hidden="true">
                <svg className="w-4 h-4 text-nhs-pink" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              {t('values.results.allValues', 'All Your Values')}
            </h2>

            {/* Group by category */}
            {(['lifestyle', 'medical', 'social'] as ValueCategory[]).map((category) => {
              const categoryInfo = CATEGORY_INFO[category];
              const statements = GROUPED_STATEMENTS[category];

              return (
                <div key={category} className="mb-4 sm:mb-6 last:mb-0">
                  <h3 className={`text-xs sm:text-sm font-semibold ${categoryInfo.color} mb-2 sm:mb-3 flex items-center gap-1.5`}>
                    {categoryInfo.icon}
                    {t(`values.categories.${category}`, category)}
                  </h3>
                  <div className="space-y-2">
                    {statements.map((statement, index) => {
                      const rating = ratings[statement.id] || 0;
                      const percentage = (rating / 5) * 100;

                      return (
                        <div key={statement.id} className="p-2.5 sm:p-3 bg-bg-surface-secondary hover:bg-nhs-blue/5 rounded-lg sm:rounded-xl transition-colors">
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <span className="text-xs sm:text-sm text-text-primary font-medium flex-1 mr-2 sm:mr-3 line-clamp-1">{statement.statement}</span>
                            <span className="text-xs font-semibold text-text-muted flex-shrink-0">{rating > 0 ? `${rating}/5` : '-'}</span>
                          </div>
                          <div className="h-1.5 sm:h-2 bg-nhs-pale-grey rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                background:
                                  rating >= 4
                                    ? 'linear-gradient(90deg, #AE2573, #8a2150)'
                                    : rating >= 3
                                      ? 'linear-gradient(90deg, #005EB8, #003087)'
                                      : '#768692',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-nhs-pale-grey animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h2 className="text-base sm:text-lg font-bold text-text-primary mb-4 sm:mb-6 text-center">
              {t('values.results.nextSteps', 'What Would You Like to Do Next?')}
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center mb-4 sm:mb-6">
              <button
                onClick={() => {
                  setViewMode('all-at-once');
                }}
                className="px-4 sm:px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white active:scale-95 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation"
              >
                {t('values.results.editValues', 'Edit Your Values')}
              </button>
              <Link
                to="/compare"
                className="px-4 sm:px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white active:scale-95 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation text-center no-underline inline-flex items-center justify-center"
              >
                {t('values.results.compareLink', 'Compare Treatments')}
              </Link>
              <Link
                to="/summary"
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation text-center no-underline inline-flex items-center justify-center"
              >
                {t('values.results.addToSummary', 'Add to My Summary')}
              </Link>
            </div>

            {/* Back to Hub */}
            <div className="text-center pt-4 sm:pt-6 border-t border-nhs-pale-grey">
              <button
                onClick={() => navigate('/hub')}
                className="inline-flex items-center gap-2 text-nhs-blue font-medium hover:bg-nhs-blue/5 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                {t('nav.backToHub', 'Back to Your Hub')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
