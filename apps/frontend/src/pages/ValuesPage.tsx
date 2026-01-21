import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import type { ValueRating } from '@renal-decision-aid/shared-types';

interface ValueStatement {
  id: string;
  statement: string;
  hint?: string;
  category: 'independence' | 'health' | 'lifestyle' | 'social' | 'practical';
}

interface RatingLabel {
  value: number;
  label: string;
  shortLabel: string;
}

// Statement IDs and their categories (static data)
// IDs match the keys in values.statements in common.json
const STATEMENT_CONFIGS = [
  { id: 'travel', category: 'lifestyle' as const },
  { id: 'hospitalTime', category: 'practical' as const },
  { id: 'needles', category: 'health' as const },
  { id: 'independence', category: 'independence' as const },
  { id: 'familyBurden', category: 'social' as const },
  { id: 'longevity', category: 'health' as const },
  { id: 'qualityOfLife', category: 'health' as const },
  { id: 'homeTreatment', category: 'practical' as const },
  { id: 'workActivities', category: 'lifestyle' as const },
  { id: 'professionalCare', category: 'practical' as const },
];

// Rating values (static data)
const RATING_VALUES = [1, 2, 3, 4, 5];

// Mapping from numeric rating values to translation keys
const RATING_LABEL_KEYS: Record<number, string> = {
  1: 'notImportant',
  2: 'slightlyImportant',
  3: 'moderatelyImportant',
  4: 'important',
  5: 'veryImportant',
};

type ViewMode = 'intro' | 'one-at-a-time' | 'all-at-once' | 'results';

export default function ValuesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, addValueRating } = useSession();

  const [viewMode, setViewMode] = useState<ViewMode>('intro');
  const [currentStatement, setCurrentStatement] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  // Translated value statements
  const VALUE_STATEMENTS: ValueStatement[] = useMemo(() =>
    STATEMENT_CONFIGS.map(({ id, category }) => ({
      id,
      statement: t(`values.statements.${id}.text`),
      hint: t(`values.statements.${id}.hint`),
      category,
    })),
    [t]
  );

  // Translated rating labels
  const RATING_LABELS: RatingLabel[] = useMemo(() =>
    RATING_VALUES.map((value) => ({
      value,
      label: t(`values.ratingLabels.${RATING_LABEL_KEYS[value]}`),
      shortLabel: String(value),
    })),
    [t]
  );

  const handleRating = (statementId: string, rating: 1 | 2 | 3 | 4 | 5) => {
    setRatings((prev) => ({ ...prev, [statementId]: rating }));

    // Save to session
    const valueRating: ValueRating = {
      statementId,
      rating,
    };
    addValueRating(valueRating);
  };

  const goToNextStatement = () => {
    if (currentStatement < VALUE_STATEMENTS.length - 1) {
      setCurrentStatement((prev) => prev + 1);
    } else {
      setViewMode('results');
    }
  };

  const goToPreviousStatement = () => {
    if (currentStatement > 0) {
      setCurrentStatement((prev) => prev - 1);
    } else {
      setViewMode('intro');
    }
  };

  const getProgress = () => {
    return Math.round(((currentStatement + 1) / VALUE_STATEMENTS.length) * 100);
  };

  const getCompletedCount = () => {
    return Object.keys(ratings).length;
  };

  const getTopPriorities = () => {
    return Object.entries(ratings)
      .filter(([, rating]) => rating >= 4)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id, rating]) => ({
        id,
        rating,
        statement: VALUE_STATEMENTS.find((s) => s.id === id)?.statement || '',
      }));
  };

  const handleFinishAllAtOnce = () => {
    setViewMode('results');
  };

  // Introduction View - Enhanced
  if (viewMode === 'intro') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30" id="main-content">
        <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[750px] mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-nhs-pale-grey overflow-hidden relative">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-nhs-pink/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-nhs-blue/5 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-nhs-pink/20 to-nhs-pink/10 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-nhs-pink" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight">
                {t('values.intro.title', 'What Matters Most to You?')}
              </h1>
              <p className="text-lg text-text-secondary mb-10 max-w-[550px] mx-auto leading-relaxed">
                {t(
                  'values.intro.description',
                  'Choosing a kidney treatment is a personal decision. This exercise helps you think about your values and priorities so you can discuss them with your kidney team.'
                )}
              </p>

              {/* Features - Enhanced cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-4 p-4 bg-nhs-green/5 rounded-xl text-left border border-nhs-green/20">
                  <div className="w-12 h-12 bg-nhs-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-nhs-green" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <span className="text-text-primary font-medium">{t('values.intro.feature1', '10 value statements to rate')}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-nhs-blue/5 rounded-xl text-left border border-nhs-blue/20">
                  <div className="w-12 h-12 bg-nhs-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                  </div>
                  <span className="text-text-primary font-medium">{t('values.intro.feature2', 'Takes about 5 minutes')}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-nhs-aqua-green/5 rounded-xl text-left border border-nhs-aqua-green/20">
                  <div className="w-12 h-12 bg-nhs-aqua-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-nhs-aqua-green" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  </div>
                  <span className="text-text-primary font-medium">{t('values.intro.feature3', 'No right or wrong answers')}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-nhs-warm-yellow/5 rounded-xl text-left border border-nhs-warm-yellow/20">
                  <div className="w-12 h-12 bg-nhs-warm-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-nhs-warm-yellow" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                  <span className="text-text-primary font-medium">{t('values.intro.feature4', 'See your priorities summarised')}</span>
                </div>
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

              <div className="mt-10 pt-6 border-t border-nhs-pale-grey">
                <p className="text-sm text-text-secondary mb-3">
                  {t('values.intro.allAtOnce', 'Prefer to see all statements at once?')}
                </p>
                <button
                  onClick={() => setViewMode('all-at-once')}
                  className="text-nhs-blue font-semibold hover:text-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 rounded px-2 py-1"
                >
                  {t('values.intro.viewAll', 'View All Statements')}
                </button>
              </div>

              {/* Navigation */}
              <div className="mt-6 pt-6 border-t border-nhs-pale-grey">
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
        </div>
      </main>
    );
  }

  // One-at-a-time View - Enhanced
  if (viewMode === 'one-at-a-time') {
    const statement = VALUE_STATEMENTS[currentStatement];
    const currentRating = ratings[statement.id];

    return (
      <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30" id="main-content">
        <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12">
          {/* Progress Bar - Enhanced */}
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-nhs-pale-grey" role="progressbar" aria-valuenow={currentStatement + 1} aria-valuemin={1} aria-valuemax={VALUE_STATEMENTS.length}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-nhs-pink/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-nhs-pink" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-text-primary">
                  {t('values.progress.statement', 'Statement')} {currentStatement + 1} {t('values.progress.of', 'of')} {VALUE_STATEMENTS.length}
                </span>
              </div>
              <span className="text-sm font-semibold text-nhs-pink bg-nhs-pink/10 px-3 py-1 rounded-full">{getProgress()}%</span>
            </div>
            <div className="h-3 bg-nhs-pale-grey rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-nhs-pink to-[#8a2150] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          {/* Statement Card - Enhanced */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-nhs-pale-grey">
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary flex-1 leading-tight" id={`statement-${currentStatement}`}>
                  "{statement.statement}"
                </h2>
                <button
                  className="flex-shrink-0 w-14 h-14 rounded-xl bg-nhs-blue/10 text-nhs-blue flex items-center justify-center hover:bg-nhs-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
                  aria-label={t('values.listenStatement', 'Listen to this statement')}
                  title={t('values.listenStatement', 'Listen to this statement')}
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                </button>
              </div>
              <p className="flex items-center gap-3 text-text-secondary bg-nhs-blue/5 px-4 py-3 rounded-xl">
                <svg className="w-5 h-5 text-nhs-blue flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
                {statement.hint || t('values.defaultHint', 'Rate how important this is to you from 1 (Not important) to 5 (Very important)')}
              </p>
            </div>

            {/* Rating Scale - Enhanced with visual slider feel and larger touch targets */}
            <div className="py-6 sm:py-10" role="radiogroup" aria-labelledby={`statement-${currentStatement}`}>
              <div className="flex justify-between items-end gap-2 sm:gap-4 max-w-2xl mx-auto px-2">
                {RATING_LABELS.map((option) => (
                  <label key={option.value} className="flex flex-col items-center cursor-pointer group flex-1 touch-manipulation">
                    <input
                      type="radio"
                      name={`rating-${statement.id}`}
                      value={option.value}
                      checked={currentRating === option.value}
                      onChange={() => handleRating(statement.id, option.value as 1 | 2 | 3 | 4 | 5)}
                      className="sr-only"
                    />
                    <span
                      className={`w-14 h-14 sm:w-20 sm:h-20 min-w-[56px] min-h-[56px] rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl font-bold transition-all duration-300 mb-2 sm:mb-3 shadow-sm ${
                        currentRating === option.value
                          ? 'bg-gradient-to-br from-nhs-pink to-[#8a2150] text-white scale-105 sm:scale-110 shadow-lg ring-2 sm:ring-4 ring-nhs-pink/30'
                          : 'bg-nhs-pale-grey text-text-secondary active:bg-nhs-pink/20 active:scale-95 group-hover:bg-nhs-pink/10 group-hover:text-nhs-pink group-hover:scale-105'
                      }`}
                    >
                      {option.shortLabel}
                    </span>
                    <span className={`text-[10px] sm:text-sm text-center max-w-[60px] sm:max-w-[80px] leading-tight font-medium transition-colors ${
                      currentRating === option.value ? 'text-nhs-pink font-bold' : 'text-text-muted group-hover:text-nhs-pink'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              {/* Visual scale indicator */}
              <div className="flex justify-between max-w-2xl mx-auto mt-4 sm:mt-6 px-4 sm:px-8">
                <span className="text-[10px] sm:text-xs text-text-muted">{t('values.scale.lessImportant')}</span>
                <span className="text-[10px] sm:text-xs text-text-muted">{t('values.scale.moreImportant')}</span>
              </div>
            </div>

            {/* Navigation - Enhanced with larger touch targets */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-nhs-pale-grey">
              <button
                onClick={goToPreviousStatement}
                className="inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-3 text-nhs-blue font-medium hover:bg-nhs-blue/5 rounded-xl transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                {t('values.nav.back', 'Back')}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={goToNextStatement}
                  className="flex-1 sm:flex-none px-5 py-3 text-text-secondary hover:text-text-primary hover:bg-nhs-pale-grey/50 rounded-xl transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation"
                >
                  {t('values.nav.skip', 'Skip')}
                </button>
                <button
                  onClick={goToNextStatement}
                  className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-nhs-pink to-[#8a2150] text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation"
                >
                  {currentStatement === VALUE_STATEMENTS.length - 1 ? t('values.nav.finish', 'Finish') : t('values.nav.next', 'Next')}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor">
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

  // All-at-once View
  if (viewMode === 'all-at-once') {
    return (
      <main className="min-h-screen bg-bg-page" id="main-content">
        <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {t('values.allAtOnce.title', 'Rate All Statements')}
            </h1>
            <p className="text-lg text-text-secondary">
              {t('values.allAtOnce.description', 'Rate each statement from 1 (Not important) to 5 (Very important).')}
            </p>
            <div className="mt-4 text-sm text-text-secondary">
              {t('values.allAtOnce.progress', 'Completed')}: {getCompletedCount()} / {VALUE_STATEMENTS.length}
            </div>
          </header>

          {/* All Statements */}
          <div className="space-y-4 mb-8">
            {VALUE_STATEMENTS.map((statement, index) => {
              const currentRating = ratings[statement.id];
              const isCompleted = currentRating !== undefined;

              return (
                <div
                  key={statement.id}
                  className={`p-6 rounded-lg border transition-colors ${
                    isCompleted
                      ? 'border-nhs-green bg-[#E6F4EA]'
                      : 'border-nhs-pale-grey bg-white hover:border-nhs-blue'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isCompleted ? 'bg-nhs-green text-white' : 'bg-nhs-pale-grey text-text-secondary'
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
                    <p className="text-lg font-medium text-text-primary flex-1">{statement.statement}</p>
                    <button
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-nhs-blue text-white flex items-center justify-center hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
                      aria-label={t('values.listenStatement', 'Listen to this statement')}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                    </button>
                  </div>

                  {/* Mini Rating Scale - with larger touch targets */}
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
                          className={`w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-lg sm:text-xl border-2 transition-all ${
                            currentRating === option.value
                              ? 'bg-nhs-blue border-nhs-blue text-white'
                              : 'bg-nhs-pale-grey border-transparent active:bg-nhs-blue/20 active:scale-95 hover:border-nhs-blue hover:bg-[#E6F0FA]'
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-nhs-pale-grey">
            <button
              onClick={() => setViewMode('intro')}
              className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-3 text-nhs-blue font-medium hover:underline focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 rounded min-h-[48px] touch-manipulation"
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
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-nhs-green text-white font-bold rounded-md hover:bg-nhs-green-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
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

  // Results View
  const topPriorities = getTopPriorities();

  return (
    <main className="min-h-screen bg-bg-page" id="main-content">
      <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12">
        <div className="max-w-[800px] mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
          {/* Header */}
          <header className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#E6F4EA] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-nhs-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {t('values.results.title', 'Your Values Summary')}
            </h1>
            <p className="text-lg text-text-secondary">
              {t('values.results.description', 'Based on your responses, here is what matters most to you.')}
            </p>
          </header>

          {/* Top Priorities */}
          {topPriorities.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-nhs-warm-yellow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {t('values.results.topPriorities', 'Your Top Priorities')}
              </h2>
              <div className="space-y-3">
                {topPriorities.map((priority, index) => (
                  <div
                    key={priority.id}
                    className="flex items-center gap-4 p-4 bg-[#E6F0FA] border-l-4 border-nhs-blue rounded-r-md"
                  >
                    <div className="w-9 h-9 rounded-full bg-nhs-blue text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="flex-1 text-lg font-medium text-text-primary">{priority.statement}</span>
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <svg className="w-5 h-5 text-nhs-warm-yellow" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      {priority.rating}/5
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Values Breakdown */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              {t('values.results.allValues', 'All Your Values')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VALUE_STATEMENTS.map((statement) => {
                const rating = ratings[statement.id] || 0;
                return (
                  <div
                    key={statement.id}
                    className="flex items-center justify-between p-3 bg-bg-surface-secondary rounded-md"
                  >
                    <span className="text-sm text-text-primary flex-1 mr-3">{statement.statement}</span>
                    <div className="w-20 h-2 bg-nhs-pale-grey rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full bg-nhs-blue rounded-full transition-all"
                        style={{ width: `${(rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center pt-6 border-t border-nhs-pale-grey">
            <button
              onClick={() => {
                setViewMode('all-at-once');
              }}
              className="px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-md hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation"
            >
              {t('values.results.editValues', 'Edit Your Values')}
            </button>
            <Link
              to="/compare"
              className="px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-md hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation text-center"
            >
              {t('values.results.compareLink', 'Compare Treatments')}
            </Link>
            <Link
              to="/summary"
              className="px-6 py-3 bg-nhs-blue text-white font-semibold rounded-md hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation text-center"
            >
              {t('values.results.addToSummary', 'Add to My Summary')}
            </Link>
          </div>

          {/* Back to Hub */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/hub')}
              className="inline-flex items-center gap-2 text-nhs-blue font-medium hover:underline focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 rounded"
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
