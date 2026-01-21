/**
 * @fileoverview Questionnaire page for the NHS Renal Decision Aid.
 * Guides users through a series of questions to personalize their experience
 * by understanding their knowledge level, goals, preferences, and priorities.
 * @module pages/QuestionnairePage
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import StickyProgressIndicator from '@/components/StickyProgressIndicator';

/**
 * Question option key structure for translation-based options.
 * @interface QuestionOptionKey
 * @property {string} value - The option value to store
 * @property {string} labelKey - i18n key for the option label
 * @property {string} [descriptionKey] - Optional i18n key for option description
 */
interface QuestionOptionKey {
  value: string;
  labelKey: string;
  descriptionKey?: string;
}

/**
 * Question configuration structure for the questionnaire.
 * @interface Question
 * @property {string} id - Unique identifier for the question
 * @property {'slider' | 'radio' | 'checkbox'} type - Type of input control
 * @property {string} questionKey - i18n key for the question text
 * @property {string} [hintKey] - Optional i18n key for hint text
 * @property {QuestionOptionKey[]} [optionKeys] - Options for radio/checkbox types
 * @property {string[]} [sliderLabelKeys] - Labels for slider positions
 * @property {number} [min] - Minimum value for slider
 * @property {number} [max] - Maximum value for slider
 * @property {number} [maxSelections] - Max selections for checkbox type
 */
interface Question {
  id: string;
  type: 'slider' | 'radio' | 'checkbox';
  questionKey: string;
  hintKey?: string;
  optionKeys?: QuestionOptionKey[];
  sliderLabelKeys?: string[];
  min?: number;
  max?: number;
  maxSelections?: number;
}

/**
 * Array of questionnaire questions with their configurations.
 * Includes questions about knowledge level, session goals, learning preferences,
 * comfort level, home support, living situation, and priorities.
 * @constant {Question[]}
 */
const QUESTIONS: Question[] = [
  {
    id: 'knowledge-level',
    type: 'slider',
    questionKey: 'questionnaire.questions.knowledge.title',
    hintKey: 'questionnaire.questions.knowledge.hint',
    min: 1,
    max: 5,
    sliderLabelKeys: [
      'questionnaire.knowledge.levels.1',
      'questionnaire.knowledge.levels.2',
      'questionnaire.knowledge.levels.3',
      'questionnaire.knowledge.levels.4',
      'questionnaire.knowledge.levels.5',
    ],
  },
  {
    id: 'session-goal',
    type: 'radio',
    questionKey: 'questionnaire.questions.goal.title',
    hintKey: 'questionnaire.questions.goal.hint',
    optionKeys: [
      { value: 'learn-basics', labelKey: 'questionnaire.goal.options.learnBasics.label', descriptionKey: 'questionnaire.goal.options.learnBasics.description' },
      { value: 'compare-options', labelKey: 'questionnaire.goal.options.compare.label', descriptionKey: 'questionnaire.goal.options.compare.description' },
      { value: 'prepare-discussion', labelKey: 'questionnaire.goal.options.prepare.label', descriptionKey: 'questionnaire.goal.options.prepare.description' },
      { value: 'support-someone', labelKey: 'questionnaire.goal.options.support.label', descriptionKey: 'questionnaire.goal.options.support.description' },
      { value: 'not-sure', labelKey: 'questionnaire.goal.options.notSure.label', descriptionKey: 'questionnaire.goal.options.notSure.description' },
    ],
  },
  {
    id: 'learning-preferences',
    type: 'checkbox',
    questionKey: 'questionnaire.questions.learning.title',
    hintKey: 'questionnaire.questions.learning.hint',
    optionKeys: [
      { value: 'visual', labelKey: 'questionnaire.learning.options.visual.label', descriptionKey: 'questionnaire.learning.options.visual.description' },
      { value: 'audio', labelKey: 'questionnaire.learning.options.audio.label', descriptionKey: 'questionnaire.learning.options.audio.description' },
      { value: 'reading', labelKey: 'questionnaire.learning.options.reading.label', descriptionKey: 'questionnaire.learning.options.reading.description' },
      { value: 'video', labelKey: 'questionnaire.learning.options.video.label', descriptionKey: 'questionnaire.learning.options.video.description' },
      { value: 'interactive', labelKey: 'questionnaire.learning.options.interactive.label', descriptionKey: 'questionnaire.learning.options.interactive.description' },
    ],
  },
  {
    id: 'comfort-level',
    type: 'slider',
    questionKey: 'questionnaire.questions.comfort.title',
    hintKey: 'questionnaire.questions.comfort.hint',
    min: 1,
    max: 5,
    sliderLabelKeys: [
      'questionnaire.comfort.levels.1',
      'questionnaire.comfort.levels.2',
      'questionnaire.comfort.levels.3',
      'questionnaire.comfort.levels.4',
      'questionnaire.comfort.levels.5',
    ],
  },
  {
    id: 'home-support',
    type: 'radio',
    questionKey: 'questionnaire.questions.support.title',
    hintKey: 'questionnaire.questions.support.hint',
    optionKeys: [
      { value: 'family-partner', labelKey: 'questionnaire.support.options.familyPartner' },
      { value: 'carers', labelKey: 'questionnaire.support.options.carers' },
      { value: 'family-nearby', labelKey: 'questionnaire.support.options.familyNearby' },
      { value: 'limited-support', labelKey: 'questionnaire.support.options.limitedSupport' },
      { value: 'prefer-not-say', labelKey: 'questionnaire.support.options.preferNotSay' },
    ],
  },
  {
    id: 'living-situation',
    type: 'radio',
    questionKey: 'questionnaire.questions.living.title',
    hintKey: 'questionnaire.questions.living.hint',
    optionKeys: [
      { value: 'home-space', labelKey: 'questionnaire.living.options.homeSpace' },
      { value: 'home-limited', labelKey: 'questionnaire.living.options.homeLimited' },
      { value: 'flat', labelKey: 'questionnaire.living.options.flat' },
      { value: 'supported', labelKey: 'questionnaire.living.options.supported' },
      { value: 'prefer-not-say', labelKey: 'questionnaire.support.options.preferNotSay' },
    ],
  },
  {
    id: 'priorities',
    type: 'checkbox',
    questionKey: 'questionnaire.questions.priorities.title',
    hintKey: 'questionnaire.questions.priorities.hint',
    maxSelections: 3,
    optionKeys: [
      { value: 'family-time', labelKey: 'questionnaire.priorities.options.familyTime' },
      { value: 'independence', labelKey: 'questionnaire.priorities.options.independence' },
      { value: 'minimise-hospital', labelKey: 'questionnaire.priorities.options.minimiseHospital' },
      { value: 'routine', labelKey: 'questionnaire.priorities.options.routine' },
      { value: 'control', labelKey: 'questionnaire.priorities.options.control' },
      { value: 'longevity', labelKey: 'questionnaire.priorities.options.longevity' },
      { value: 'quality', labelKey: 'questionnaire.priorities.options.quality' },
      { value: 'travel', labelKey: 'questionnaire.priorities.options.travel' },
    ],
  },
];

/**
 * Questionnaire page component for collecting user preferences.
 *
 * Features:
 * - Introduction screen with feature highlights
 * - Multiple question types: slider, radio, checkbox
 * - Progress tracking with visual progress bar
 * - Sticky progress indicator on scroll
 * - Skip functionality for individual questions or all
 * - Audio support for accessibility
 * - Saves answers to session context
 *
 * @component
 * @returns {JSX.Element} The rendered questionnaire page
 *
 * @example
 * <Route path="/questionnaire" element={<QuestionnairePage />} />
 */
export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addQuestionnaireAnswer } = useSession();

  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});

  const totalQuestions = QUESTIONS.length;
  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  /**
   * Handles slider value changes for slider-type questions.
   * @param {number} value - The new slider value
   */
  const handleSliderChange = (value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  /**
   * Handles radio button selection for radio-type questions.
   * @param {string} value - The selected option value
   */
  const handleRadioChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  /**
   * Handles checkbox toggle for checkbox-type questions.
   * Enforces maxSelections limit if defined on the question.
   * @param {string} value - The checkbox option value
   * @param {boolean} checked - Whether the checkbox is being checked
   */
  const handleCheckboxChange = (value: string, checked: boolean) => {
    const currentValues = (answers[question.id] as string[]) || [];
    let newValues: string[];

    if (checked) {
      if (question.maxSelections && currentValues.length >= question.maxSelections) {
        return; // Don't add more if at max
      }
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    setAnswers(prev => ({ ...prev, [question.id]: newValues }));
  };

  /**
   * Handles advancing to the next question or completing the questionnaire.
   * Saves the current answer to session context before advancing.
   */
  const handleNext = () => {
    // Save answer to session
    const answer = answers[question.id];
    if (answer !== undefined) {
      addQuestionnaireAnswer({
        questionId: question.id,
        value: answer,
        timestamp: Date.now(),
      });
    }

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Navigate to hub on completion
      navigate('/hub');
    }
  };

  /**
   * Handles navigating back to the previous question or intro screen.
   */
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      setShowIntro(true);
    }
  };

  /**
   * Skips the current question and advances to the next.
   */
  const handleSkip = () => {
    handleNext();
  };

  /**
   * Skips all remaining questions and navigates to the hub.
   */
  const handleSkipAll = () => {
    navigate('/hub');
  };

  // Introduction Screen
  if (showIntro) {
    return (
      <main className="min-h-screen bg-bg-page">
        <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 flex flex-col items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-5 sm:p-8 md:p-12 max-w-[700px] w-full text-center">
            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-nhs-blue/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
              {t('questionnaire.intro.title', 'Tell Us About Yourself')}
            </h1>
            <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8 max-w-[550px] mx-auto">
              {t('questionnaire.intro.description', 'These questions help us show you information that is most relevant to your situation. Your answers are private and will not be saved after this session.')}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 text-left">
              <FeatureItem icon={<CheckIcon />} text={t('questionnaire.intro.features.questions', '7 quick questions')} />
              <FeatureItem icon={<ClockIcon />} text={t('questionnaire.intro.features.time', 'Takes 3-5 minutes')} />
              <FeatureItem icon={<LockIcon />} text={t('questionnaire.intro.features.private', 'Completely private')} />
              <FeatureItem icon={<SkipIcon />} text={t('questionnaire.intro.features.skip', 'Skip any question')} />
            </div>

            {/* Start Button */}
            <button
              onClick={() => setShowIntro(false)}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto
                         text-base sm:text-lg font-bold bg-nhs-blue text-white
                         border-2 border-nhs-blue rounded-md min-h-[48px]
                         transition-all duration-fast
                         hover:bg-nhs-blue-dark hover:border-nhs-blue-dark
                         focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
            >
              {t('questionnaire.intro.beginButton', 'Begin Questions')}
              <ArrowRightIcon />
            </button>

            {/* Skip Link */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-nhs-pale-grey">
              <p className="text-xs sm:text-sm text-text-secondary mb-3">
                {t('questionnaire.intro.skipText', 'If you prefer not to answer these questions, you can skip to general treatment information.')}
              </p>
              <button
                onClick={handleSkipAll}
                className="text-sm text-nhs-blue hover:underline focus:outline-none focus:ring-2 focus:ring-focus rounded px-3 py-2 min-h-[44px]"
              >
                {t('questionnaire.intro.skipButton', 'Skip All Questions')}
              </button>
            </div>

            {/* Navigation */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-nhs-pale-grey flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/journey')}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] text-nhs-blue hover:underline focus:outline-none focus:ring-2 focus:ring-focus rounded text-sm sm:text-base"
              >
                <ArrowLeftIcon />
                {t('questionnaire.intro.backToJourney', 'Back to Journey Stage')}
              </button>
              <button
                onClick={() => navigate('/hub')}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] text-text-secondary hover:text-nhs-blue focus:outline-none focus:ring-2 focus:ring-focus rounded text-sm sm:text-base"
              >
                <HomeIcon />
                {t('nav.returnToHub', 'Return to Hub')}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Question Screen
  return (
    <main className="min-h-screen bg-bg-page">
      {/* Sticky Progress Indicator - shows on scroll */}
      <StickyProgressIndicator
        current={currentQuestion + 1}
        total={totalQuestions}
        showStepCount={true}
      />

      <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 flex flex-col min-h-[calc(100vh-200px)]">

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8" role="progressbar" aria-valuenow={currentQuestion + 1} aria-valuemin={1} aria-valuemax={totalQuestions} aria-label={t('questionnaire.progress.label', 'Question progress')}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-base sm:text-lg font-semibold text-nhs-blue">
              {t('questionnaire.progress.questionOf', 'Question {{current}} of {{total}}', { current: currentQuestion + 1, total: totalQuestions })}
            </span>
            <span className="text-xs sm:text-sm text-text-secondary">
              {Math.round(progress)}% {t('questionnaire.progress.complete', 'complete')}
            </span>
          </div>
          <div className="h-2 bg-nhs-pale-grey rounded-full overflow-hidden">
            <div
              className="h-full bg-nhs-blue rounded-full transition-all duration-slow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
          {/* Question Header */}
          <div className="mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-nhs-pale-grey rounded text-xs text-text-secondary uppercase tracking-wide mb-3 sm:mb-4">
              {question.type === 'slider' && t('questionnaire.types.scale', 'Scale Rating')}
              {question.type === 'radio' && t('questionnaire.types.single', 'Single Choice')}
              {question.type === 'checkbox' && t('questionnaire.types.multiple', 'Multiple Choice')}
            </span>

            <div className="flex items-start gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary flex-1">
                {t(question.questionKey,
                  question.id === 'knowledge-level' ? 'How much do you know about kidney disease and its treatments?' :
                  question.id === 'session-goal' ? 'What would you like to get from this session?' :
                  question.id === 'learning-preferences' ? 'How do you prefer to learn new information?' :
                  question.id === 'comfort-level' ? 'How comfortable are you with medical procedures?' :
                  question.id === 'home-support' ? 'Do you have support at home?' :
                  question.id === 'living-situation' ? 'Where do you live?' :
                  'What matters most to you in choosing a treatment?'
                )}
              </h2>
              <button
                className="flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-nhs-blue text-white flex items-center justify-center transition-all hover:bg-nhs-blue-dark hover:scale-105 focus:outline-none focus:ring-3 focus:ring-focus"
                aria-label={t('questionnaire.audio.listen', 'Listen to this question')}
                title={t('questionnaire.audio.listen', 'Listen to this question')}
              >
                <AudioIcon />
              </button>
            </div>

            {question.hintKey && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-text-secondary flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5"><InfoIcon /></span>
                <span>{t(question.hintKey,
                  question.id === 'knowledge-level' ? 'This helps us tailor information to your current understanding.' :
                  question.id === 'session-goal' ? 'Select the option that best describes your main goal today.' :
                  question.id === 'learning-preferences' ? 'This helps us present information in ways that work best for you.' :
                  question.id === 'comfort-level' ? 'This is a sensitive topic. You can skip this question if you prefer.' :
                  question.id === 'home-support' ? 'Some treatments are easier with help from family or carers.' :
                  question.id === 'living-situation' ? 'This helps us understand which treatments might work best in your home environment.' :
                  'Your priorities will help us highlight what matters to you in each treatment option.'
                )}</span>
              </p>
            )}
          </div>

          {/* Answer Options */}
          <div className="flex-1" role="group" aria-labelledby={`question-${question.id}`}>
            {/* Checkbox Info */}
            {question.type === 'checkbox' && (
              <div className="flex items-start gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-nhs-blue/10 rounded-md text-xs sm:text-sm text-nhs-blue-dark mb-3 sm:mb-4">
                <span className="flex-shrink-0 mt-0.5"><InfoIcon /></span>
                <span>{question.maxSelections
                  ? t('questionnaire.hints.selectUpTo', 'Select up to {{max}} priorities that are most important to you.', { max: question.maxSelections })
                  : t('questionnaire.hints.selectAll', 'Select all that apply - you can choose more than one option.')
                }</span>
              </div>
            )}

            {/* Slider Question */}
            {question.type === 'slider' && question.sliderLabelKeys && (
              <SliderQuestion
                value={(answers[question.id] as number) || 3}
                onChange={handleSliderChange}
                labelKeys={question.sliderLabelKeys}
                min={question.min || 1}
                max={question.max || 5}
              />
            )}

            {/* Radio Question */}
            {question.type === 'radio' && question.optionKeys && (
              <div className="flex flex-col gap-2 sm:gap-3">
                {question.optionKeys.map(option => (
                  <label
                    key={option.value}
                    className={`relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border-2 rounded-md cursor-pointer transition-all min-h-[56px] sm:min-h-[64px]
                      ${answers[question.id] === option.value
                        ? 'border-nhs-blue bg-nhs-blue/5'
                        : 'border-nhs-pale-grey hover:border-nhs-blue hover:bg-nhs-blue/5'
                      }
                      focus-within:ring-3 focus-within:ring-focus`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={() => handleRadioChange(option.value)}
                      className="w-6 h-6 sm:w-7 sm:h-7 accent-nhs-blue cursor-pointer flex-shrink-0"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="font-semibold text-text-primary block text-sm sm:text-base">{t(option.labelKey)}</span>
                      {option.descriptionKey && (
                        <span className="text-xs sm:text-sm text-text-secondary">{t(option.descriptionKey)}</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Checkbox Question */}
            {question.type === 'checkbox' && question.optionKeys && (
              <div className="flex flex-col gap-2 sm:gap-3">
                {question.optionKeys.map(option => {
                  const currentValues = (answers[question.id] as string[]) || [];
                  const isChecked = currentValues.includes(option.value);
                  const isDisabled = !isChecked && !!question.maxSelections && currentValues.length >= question.maxSelections;

                  return (
                    <label
                      key={option.value}
                      className={`relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border-2 rounded-md cursor-pointer transition-all min-h-[56px] sm:min-h-[64px]
                        ${isChecked
                          ? 'border-nhs-blue bg-nhs-blue/5'
                          : isDisabled
                            ? 'border-nhs-pale-grey opacity-50 cursor-not-allowed'
                            : 'border-nhs-pale-grey hover:border-nhs-blue hover:bg-nhs-blue/5'
                        }
                        focus-within:ring-3 focus-within:ring-focus`}
                    >
                      <input
                        type="checkbox"
                        name={question.id}
                        value={option.value}
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                        className="w-6 h-6 sm:w-7 sm:h-7 accent-nhs-blue cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="font-semibold text-text-primary block text-sm sm:text-base">{t(option.labelKey)}</span>
                        {option.descriptionKey && (
                          <span className="text-xs sm:text-sm text-text-secondary">{t(option.descriptionKey)}</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="order-2 sm:order-1">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] text-nhs-blue border-2 border-transparent rounded hover:bg-nhs-pale-grey focus:outline-none focus:ring-3 focus:ring-focus transition-colors text-sm sm:text-base"
              >
                <ArrowLeftIcon />
                {t('common.back', 'Back')}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 min-h-[44px] text-text-secondary hover:text-text-primary hover:bg-nhs-pale-grey rounded transition-colors focus:outline-none focus:ring-3 focus:ring-focus text-sm sm:text-base"
              >
                {t('questionnaire.skipQuestion', 'Skip this question')}
              </button>
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 text-sm sm:text-base font-bold bg-nhs-blue text-white border-2 border-nhs-blue rounded-md min-h-[48px] w-full sm:w-auto transition-all hover:bg-nhs-blue-dark hover:border-nhs-blue-dark focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
              >
                {currentQuestion === totalQuestions - 1
                  ? t('questionnaire.viewResults', 'View My Results')
                  : t('questionnaire.nextQuestion', 'Next Question')
                }
                {currentQuestion === totalQuestions - 1 ? <CheckIcon /> : <ArrowRightIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Props for the SliderQuestion component.
 * @interface SliderQuestionProps
 * @property {number} value - Current slider value
 * @property {(value: number) => void} onChange - Handler for value changes
 * @property {string[]} labelKeys - i18n keys for slider position labels
 * @property {number} min - Minimum slider value
 * @property {number} max - Maximum slider value
 */
interface SliderQuestionProps {
  value: number;
  onChange: (value: number) => void;
  labelKeys: string[];
  min: number;
  max: number;
}

/**
 * Slider question component for scale-type questions.
 * Displays a range slider with labels and a value indicator.
 * @component
 * @param {SliderQuestionProps} props - Component props
 * @returns {JSX.Element} The rendered slider question
 */
function SliderQuestion({ value, onChange, labelKeys, min, max }: SliderQuestionProps) {
  const { t } = useTranslation();
  const getValueText = (val: number) => {
    const index = val - min;
    return labelKeys[index] ? t(labelKeys[index]) : '';
  };

  return (
    <div className="py-4 sm:py-8">
      {/* Labels - hidden on mobile, shown above slider on larger screens */}
      <div className="hidden sm:flex justify-between mb-4">
        {labelKeys.map((labelKey, index) => (
          <span
            key={index}
            className={`text-center text-xs sm:text-sm max-w-[80px] sm:max-w-[100px] ${
              value === index + min
                ? 'text-nhs-blue font-semibold'
                : 'text-text-secondary'
            }`}
          >
            {t(labelKey)}
          </span>
        ))}
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 sm:h-2 bg-nhs-pale-grey rounded-full appearance-none cursor-pointer accent-nhs-blue
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10
                   sm:[&::-webkit-slider-thumb]:w-8 sm:[&::-webkit-slider-thumb]:h-8
                   [&::-webkit-slider-thumb]:bg-nhs-blue [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4
                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                   focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
        aria-label={t('questionnaire.slider.ariaLabel', { min, max })}
        aria-valuetext={getValueText(value)}
      />

      {/* Value Display */}
      <div className="text-center mt-4 sm:mt-6">
        <span className="inline-flex items-center justify-center w-12 h-12 bg-nhs-blue text-white text-xl font-bold rounded-full mb-2">
          {value}
        </span>
        <p className="text-sm sm:text-base text-text-secondary">{getValueText(value)}</p>
      </div>
    </div>
  );
}

/**
 * Props for the FeatureItem component.
 * @interface FeatureItemProps
 * @property {React.ReactNode} icon - Icon element to display
 * @property {string} text - Feature text description
 */
interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

/**
 * Feature item component for displaying intro screen features.
 * @component
 * @param {FeatureItemProps} props - Component props
 * @returns {JSX.Element} The rendered feature item
 */
function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-nhs-green mt-0.5">
        {icon}
      </span>
      <span className="text-sm sm:text-base text-text-primary">{text}</span>
    </div>
  );
}

// ============================================================================
// Icon Components
// ============================================================================

/** Right arrow icon for navigation buttons. */
function ArrowRightIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/** Left arrow icon for back navigation. */
function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/** Checkmark icon for completion states. */
function CheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/** Clock icon for time-related information. */
function ClockIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/** Lock icon for privacy indicators. */
function LockIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

/** Skip icon for skip functionality. */
function SkipIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

/** Audio/speaker icon for text-to-speech buttons. */
function AudioIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

/** Info circle icon for hints and tips. */
function InfoIcon() {
  return (
    <svg className="w-5 h-5 text-nhs-blue flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/** Home icon for navigation to hub. */
function HomeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
