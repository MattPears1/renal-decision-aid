import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';

interface QuestionOptionKey {
  value: string;
  labelKey: string;
  descriptionKey?: string;
}

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

  const handleSliderChange = (value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleRadioChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

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

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      setShowIntro(true);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleSkipAll = () => {
    navigate('/hub');
  };

  // Introduction Screen
  if (showIntro) {
    return (
      <main className="min-h-screen bg-bg-page">
        <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 max-w-[700px] w-full text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-nhs-blue/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {t('questionnaire.intro.title', 'Tell Us About Yourself')}
            </h1>
            <p className="text-lg text-text-secondary mb-8 max-w-[550px] mx-auto">
              {t('questionnaire.intro.description', 'These questions help us show you information that is most relevant to your situation. Your answers are private and will not be saved after this session.')}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              <FeatureItem icon={<CheckIcon />} text={t('questionnaire.intro.features.questions', '7 quick questions')} />
              <FeatureItem icon={<ClockIcon />} text={t('questionnaire.intro.features.time', 'Takes 3-5 minutes')} />
              <FeatureItem icon={<LockIcon />} text={t('questionnaire.intro.features.private', 'Completely private')} />
              <FeatureItem icon={<SkipIcon />} text={t('questionnaire.intro.features.skip', 'Skip any question')} />
            </div>

            {/* Start Button */}
            <button
              onClick={() => setShowIntro(false)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4
                         text-lg font-bold bg-nhs-blue text-white
                         border-2 border-nhs-blue rounded-md min-h-[48px]
                         transition-all duration-fast
                         hover:bg-nhs-blue-dark hover:border-nhs-blue-dark
                         focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
            >
              {t('questionnaire.intro.beginButton', 'Begin Questions')}
              <ArrowRightIcon />
            </button>

            {/* Skip Link */}
            <div className="mt-8 pt-6 border-t border-nhs-pale-grey">
              <p className="text-sm text-text-secondary mb-3">
                {t('questionnaire.intro.skipText', 'If you prefer not to answer these questions, you can skip to general treatment information.')}
              </p>
              <button
                onClick={handleSkipAll}
                className="text-sm text-nhs-blue hover:underline focus:outline-none focus:ring-2 focus:ring-focus rounded px-2 py-1"
              >
                {t('questionnaire.intro.skipButton', 'Skip All Questions')}
              </button>
            </div>

            {/* Navigation */}
            <div className="mt-6 pt-6 border-t border-nhs-pale-grey flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={() => navigate('/journey')}
                className="inline-flex items-center gap-2 px-4 py-2 text-nhs-blue hover:underline focus:outline-none focus:ring-2 focus:ring-focus rounded"
              >
                <ArrowLeftIcon />
                {t('questionnaire.intro.backToJourney', 'Back to Journey Stage')}
              </button>
              <button
                onClick={() => navigate('/hub')}
                className="inline-flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-nhs-blue focus:outline-none focus:ring-2 focus:ring-focus rounded"
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
      <div className="max-w-container-lg mx-auto px-4 py-8 md:py-12 flex flex-col min-h-[calc(100vh-200px)]">

        {/* Progress Bar */}
        <div className="mb-8" role="progressbar" aria-valuenow={currentQuestion + 1} aria-valuemin={1} aria-valuemax={totalQuestions} aria-label={t('questionnaire.progress.label', 'Question progress')}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-nhs-blue">
              {t('questionnaire.progress.questionOf', 'Question {{current}} of {{total}}', { current: currentQuestion + 1, total: totalQuestions })}
            </span>
            <span className="text-sm text-text-secondary">
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
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 flex-1 flex flex-col">
          {/* Question Header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-nhs-pale-grey rounded text-xs text-text-secondary uppercase tracking-wide mb-4">
              {question.type === 'slider' && t('questionnaire.types.scale', 'Scale Rating')}
              {question.type === 'radio' && t('questionnaire.types.single', 'Single Choice')}
              {question.type === 'checkbox' && t('questionnaire.types.multiple', 'Multiple Choice')}
            </span>

            <div className="flex items-start gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex-1">
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
                className="flex-shrink-0 w-12 h-12 rounded-full bg-nhs-blue text-white flex items-center justify-center transition-all hover:bg-nhs-blue-dark hover:scale-105 focus:outline-none focus:ring-3 focus:ring-focus"
                aria-label={t('questionnaire.audio.listen', 'Listen to this question')}
                title={t('questionnaire.audio.listen', 'Listen to this question')}
              >
                <AudioIcon />
              </button>
            </div>

            {question.hintKey && (
              <p className="mt-4 text-base text-text-secondary flex items-center gap-2">
                <InfoIcon />
                {t(question.hintKey,
                  question.id === 'knowledge-level' ? 'This helps us tailor information to your current understanding.' :
                  question.id === 'session-goal' ? 'Select the option that best describes your main goal today.' :
                  question.id === 'learning-preferences' ? 'This helps us present information in ways that work best for you.' :
                  question.id === 'comfort-level' ? 'This is a sensitive topic. You can skip this question if you prefer.' :
                  question.id === 'home-support' ? 'Some treatments are easier with help from family or carers.' :
                  question.id === 'living-situation' ? 'This helps us understand which treatments might work best in your home environment.' :
                  'Your priorities will help us highlight what matters to you in each treatment option.'
                )}
              </p>
            )}
          </div>

          {/* Answer Options */}
          <div className="flex-1" role="group" aria-labelledby={`question-${question.id}`}>
            {/* Checkbox Info */}
            {question.type === 'checkbox' && (
              <div className="flex items-center gap-2 px-4 py-3 bg-nhs-blue/10 rounded-md text-sm text-nhs-blue-dark mb-4">
                <InfoIcon />
                {question.maxSelections
                  ? t('questionnaire.hints.selectUpTo', 'Select up to {{max}} priorities that are most important to you.', { max: question.maxSelections })
                  : t('questionnaire.hints.selectAll', 'Select all that apply - you can choose more than one option.')
                }
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
              <div className="flex flex-col gap-3">
                {question.optionKeys.map(option => (
                  <label
                    key={option.value}
                    className={`relative flex items-center gap-4 p-4 bg-white border-2 rounded-md cursor-pointer transition-all min-h-[64px]
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
                      className="w-7 h-7 accent-nhs-blue cursor-pointer"
                    />
                    <span className="flex-1">
                      <span className="font-semibold text-text-primary block">{t(option.labelKey)}</span>
                      {option.descriptionKey && (
                        <span className="text-sm text-text-secondary">{t(option.descriptionKey)}</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Checkbox Question */}
            {question.type === 'checkbox' && question.optionKeys && (
              <div className="flex flex-col gap-3">
                {question.optionKeys.map(option => {
                  const currentValues = (answers[question.id] as string[]) || [];
                  const isChecked = currentValues.includes(option.value);
                  const isDisabled = !isChecked && !!question.maxSelections && currentValues.length >= question.maxSelections;

                  return (
                    <label
                      key={option.value}
                      className={`relative flex items-center gap-4 p-4 bg-white border-2 rounded-md cursor-pointer transition-all min-h-[64px]
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
                        className="w-7 h-7 accent-nhs-blue cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="flex-1">
                        <span className="font-semibold text-text-primary block">{t(option.labelKey)}</span>
                        {option.descriptionKey && (
                          <span className="text-sm text-text-secondary">{t(option.descriptionKey)}</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-nhs-blue border-2 border-transparent rounded hover:bg-nhs-pale-grey focus:outline-none focus:ring-3 focus:ring-focus transition-colors"
              >
                <ArrowLeftIcon />
                {t('common.back', 'Back')}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-nhs-pale-grey rounded transition-colors focus:outline-none focus:ring-3 focus:ring-focus"
              >
                {t('questionnaire.skipQuestion', 'Skip this question')}
              </button>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-bold bg-nhs-blue text-white border-2 border-nhs-blue rounded-md min-h-[48px] transition-all hover:bg-nhs-blue-dark hover:border-nhs-blue-dark focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
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

// Slider Question Component
interface SliderQuestionProps {
  value: number;
  onChange: (value: number) => void;
  labelKeys: string[];
  min: number;
  max: number;
}

function SliderQuestion({ value, onChange, labelKeys, min, max }: SliderQuestionProps) {
  const { t } = useTranslation();
  const getValueText = (val: number) => {
    const index = val - min;
    return labelKeys[index] ? t(labelKeys[index]) : '';
  };

  return (
    <div className="py-8">
      {/* Labels */}
      <div className="flex justify-between mb-4">
        {labelKeys.map((labelKey, index) => (
          <span
            key={index}
            className={`text-center text-sm max-w-[100px] ${
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
        className="w-full h-2 bg-nhs-pale-grey rounded-full appearance-none cursor-pointer accent-nhs-blue
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8
                   [&::-webkit-slider-thumb]:bg-nhs-blue [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4
                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                   focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
        aria-label={t('questionnaire.slider.ariaLabel', { min, max })}
        aria-valuetext={getValueText(value)}
      />

      {/* Value Display */}
      <div className="text-center mt-6">
        <span className="inline-flex items-center justify-center w-12 h-12 bg-nhs-blue text-white text-xl font-bold rounded-full mb-2">
          {value}
        </span>
        <p className="text-base text-text-secondary">{getValueText(value)}</p>
      </div>
    </div>
  );
}

// Feature Item Component
interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 flex-shrink-0 text-nhs-green mt-0.5">
        {icon}
      </span>
      <span className="text-base text-text-primary">{text}</span>
    </div>
  );
}

// Icon Components
function ArrowRightIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

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

function AudioIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 text-nhs-blue flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
