/**
 * @fileoverview Journey stage selection page for the NHS Renal Decision Aid.
 * Allows users to select their current stage in the kidney disease journey
 * to receive personalized content and recommendations.
 *
 * @module pages/JourneyStagePage
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires react
 * @requires react-router-dom
 * @requires react-i18next
 * @requires @/context/SessionContext
 * @requires @renal-decision-aid/shared-types
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import type { JourneyStage } from '@renal-decision-aid/shared-types';

/**
 * Configuration for a journey stage option.
 * @interface JourneyOption
 * @property {JourneyStage} id - Unique stage identifier
 * @property {string} titleKey - i18n key for stage title
 * @property {string} descriptionKey - i18n key for stage description
 * @property {React.ReactNode} icon - Icon component for the stage
 */
interface JourneyOption {
  id: JourneyStage;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
}

const JOURNEY_OPTIONS: JourneyOption[] = [
  {
    id: 'newly-diagnosed',
    titleKey: 'journey.stages.suspected.title',
    descriptionKey: 'journey.stages.suspected.description',
    icon: <InfoCircleIcon />,
  },
  {
    id: 'monitoring',
    titleKey: 'journey.stages.earlyDiagnosis.title',
    descriptionKey: 'journey.stages.earlyDiagnosis.description',
    icon: <DocumentIcon />,
  },
  {
    id: 'preparing',
    titleKey: 'journey.stages.lateDiagnosis.title',
    descriptionKey: 'journey.stages.lateDiagnosis.description',
    icon: <ActivityIcon />,
  },
  {
    id: 'on-dialysis',
    titleKey: 'journey.stages.choosingTreatment.title',
    descriptionKey: 'journey.stages.choosingTreatment.description',
    icon: <ClockIcon />,
  },
  {
    id: 'transplant-waiting',
    titleKey: 'journey.stages.transplantPending.title',
    descriptionKey: 'journey.stages.transplantPending.description',
    icon: <HeartIcon />,
  },
  {
    id: 'post-transplant',
    titleKey: 'journey.stages.dialysisPending.title',
    descriptionKey: 'journey.stages.dialysisPending.description',
    icon: <SunIcon />,
  },
  {
    id: 'supporting-someone',
    titleKey: 'journey.stages.supporting.title',
    descriptionKey: 'journey.stages.supporting.description',
    icon: <UsersIcon />,
  },
];

/**
 * Journey stage selection page component.
 * Presents users with options to identify their current stage in the
 * kidney disease journey. Selection personalizes subsequent content.
 *
 * @component
 * @returns {JSX.Element} The rendered journey stage selection page
 *
 * @example
 * // Usage in router
 * <Route path="/journey" element={<JourneyStagePage />} />
 */
export default function JourneyStagePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setJourneyStage } = useSession();
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);
  const [showError, setShowError] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSelectStage = useCallback((stageId: JourneyStage) => {
    setSelectedStage(stageId);
    setShowError(false);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedStage) {
      setJourneyStage(selectedStage);
      navigate('/questions');
    } else {
      setShowError(true);
      // Scroll to error message
      document.getElementById('error-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedStage, setJourneyStage, navigate]);

  const handlePlayAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      const text = t('journey.audioText', 'Where are you in your journey? Select the option that best describes your situation.');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [t]);

  return (
    <main className="min-h-screen bg-bg-page">
      {/* Progress Indicator */}
      <div className="bg-white border-b border-nhs-pale-grey">
        <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <ProgressSteps currentStep={3} />
        </div>
      </div>

      <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Page Header */}
        <header className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary">
              {t('journey.title', 'Where Are You in Your Journey?')}
            </h1>
            <button
              type="button"
              onClick={handlePlayAudio}
              className="flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] bg-nhs-blue text-white rounded-full
                         flex items-center justify-center
                         transition-all duration-150
                         hover:bg-nhs-blue-dark hover:scale-105
                         focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2"
              aria-label={t('journey.listenToQuestion', 'Listen to this question')}
              title={t('journey.listenToQuestion', 'Listen to this question')}
            >
              <AudioIcon />
            </button>
          </div>
          <p className="text-base sm:text-lg text-text-secondary px-2">
            {t('journey.subtitle', 'Select the option that best describes your situation')}
          </p>
        </header>

        {/* Introduction Text */}
        <div className="max-w-[700px] mx-auto text-center mb-6 sm:mb-8 px-2">
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            {t('journey.intro', 'Everyone\'s kidney journey is different. To help us show you the most relevant information, please tell us where you are right now. There are no right or wrong answers.')}
          </p>
        </div>

        {/* Error Message */}
        {showError && (
          <div
            id="error-message"
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 mb-4 sm:mb-6 bg-red-50 border-l-4 border-nhs-red rounded-r-md max-w-[900px] mx-auto text-sm sm:text-base"
            role="alert"
            aria-live="polite"
          >
            <ErrorIcon />
            <span className="text-nhs-red-dark">
              {t('journey.error', 'Please select an option that describes your situation. If none of these fit, select "I am supporting a family member or friend" to continue.')}
            </span>
          </div>
        )}

        {/* Journey Stage Cards */}
        <form aria-label={t('journey.formLabel', 'Journey stage options')}>
          <fieldset>
            <legend className="sr-only">
              {t('journey.legendLabel', 'Select where you are in your kidney journey')}
            </legend>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
              role="radiogroup"
              aria-label={t('journey.radioGroupLabel', 'Journey stage options')}
            >
              {JOURNEY_OPTIONS.map((option) => (
                <JourneyCard
                  key={option.id}
                  id={option.id}
                  title={t(option.titleKey, getDefaultTitle(option.id))}
                  description={t(option.descriptionKey, getDefaultDescription(option.id))}
                  icon={option.icon}
                  isSelected={selectedStage === option.id}
                  onSelect={() => handleSelectStage(option.id)}
                />
              ))}
            </div>
          </fieldset>
        </form>

        {/* Reassurance Box */}
        <div className="bg-blue-50 border-l-4 border-nhs-blue rounded-r-md p-3 sm:p-4 mb-6 sm:mb-8 max-w-[900px] mx-auto">
          <p className="text-nhs-blue-dark text-xs sm:text-sm">
            {t('journey.reassurance', 'Do not worry if you are unsure which option fits best. You can always explore all treatment options later, and your kidney team can help clarify your situation. Your selection helps us show you the most relevant information first.')}
          </p>
        </div>

        {/* Help Button */}
        <div className="text-center mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 min-h-[48px]
                       bg-transparent border-2 border-nhs-blue rounded-md
                       text-nhs-blue font-semibold text-sm sm:text-base
                       transition-colors duration-150
                       hover:bg-nhs-blue hover:text-white
                       focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2"
            aria-haspopup="dialog"
          >
            <HelpIcon />
            {t('journey.needHelp', 'I need help choosing')}
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-nhs-pale-grey max-w-[900px] mx-auto">
          <button
            type="button"
            onClick={() => navigate('/disclaimer')}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 min-h-[48px] text-nhs-blue hover:underline
                       focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded text-base"
          >
            <BackIcon />
            {t('nav.back', 'Back')}
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 min-h-[48px] w-full sm:w-auto sm:min-w-[140px] justify-center
                       bg-nhs-green text-white font-bold rounded-md text-base sm:text-lg
                       transition-colors duration-150
                       hover:bg-nhs-green-dark
                       focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2"
            aria-label={t('nav.continueToQuestionnaire', 'Continue to questionnaire')}
          >
            {t('common.continue', 'Continue')}
            <ForwardIcon />
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </main>
  );
}

// Progress Steps Component
interface ProgressStepsProps {
  currentStep: number;
}

function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const { t } = useTranslation();

  const steps = [
    { label: t('progress.language', 'Language'), step: 1 },
    { label: t('progress.privacy', 'Privacy'), step: 2 },
    { label: t('progress.yourJourney', 'Your Journey'), step: 3 },
    { label: t('progress.aboutYou', 'About You'), step: 4 },
    { label: t('progress.yourOptions', 'Your Options'), step: 5 },
  ];

  return (
    <div
      className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 flex-wrap"
      aria-label={t('progress.ariaLabel', 'Progress through decision aid')}
    >
      {steps.map((s, index) => (
        <div
          key={s.step}
          className={`flex items-center gap-1 sm:gap-2 ${index < steps.length - 1 ? 'after:content-[""] after:w-2 sm:after:w-4 md:after:w-8 after:h-0.5 after:bg-nhs-pale-grey after:ml-1 sm:after:ml-2 md:after:ml-4' : ''}`}
        >
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0
                        ${s.step < currentStep
                          ? 'bg-nhs-green text-white'
                          : s.step === currentStep
                            ? 'bg-nhs-blue text-white'
                            : 'bg-nhs-pale-grey text-text-secondary'
                        }`}
            aria-hidden="true"
          >
            {s.step < currentStep ? <CheckIcon /> : s.step}
          </div>
          <span
            className={`text-xs sm:text-sm hidden md:inline
                        ${s.step === currentStep ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Journey Card Component
interface JourneyCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

function JourneyCard({ id, title, description, icon, isSelected, onSelect }: JourneyCardProps) {
  return (
    <label
      className={`relative flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white border-2 rounded-lg cursor-pointer min-h-[100px]
                  transition-all duration-200
                  hover:border-nhs-blue hover:shadow-md hover:-translate-y-0.5
                  focus-within:outline-none focus-within:ring-[3px] focus-within:ring-focus focus-within:ring-offset-2
                  ${isSelected
                    ? 'border-nhs-blue bg-blue-50 shadow-md'
                    : 'border-nhs-pale-grey'
                  }`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Hidden Radio Input */}
      <input
        type="radio"
        name="journey-stage"
        value={id}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
        aria-describedby={`desc-${id}`}
      />

      {/* Selected Checkmark */}
      {isSelected && (
        <span
          className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 bg-nhs-blue rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <CheckIcon />
        </span>
      )}

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-md flex items-center justify-center
                    transition-colors duration-150
                    ${isSelected
                      ? 'bg-nhs-blue text-white'
                      : 'bg-bg-surface-secondary text-nhs-blue'
                    }`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 pr-6 sm:pr-8 min-w-0">
        <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1 leading-tight">
          {title}
        </h3>
        <p
          id={`desc-${id}`}
          className="text-xs sm:text-sm text-text-secondary leading-relaxed m-0"
        >
          {description}
        </p>
      </div>
    </label>
  );
}

// Help Modal Component
interface HelpModalProps {
  onClose: () => void;
}

function HelpModal({ onClose }: HelpModalProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-nhs-pale-grey">
          <h2 id="help-modal-title" className="text-lg sm:text-xl font-bold text-text-primary">
            {t('journey.helpModal.title', 'Need Help Choosing?')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center
                       hover:bg-nhs-pale-grey transition-colors
                       focus:outline-none focus:ring-2 focus:ring-focus"
            aria-label={t('common.close', 'Close help dialog')}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-text-secondary">
            {t('journey.helpModal.intro', 'It is perfectly normal to feel unsure about which stage describes you best. Here are some tips:')}
          </p>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
              {t('journey.helpModal.tip1Title', 'Think about your most recent appointment')}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary">
              {t('journey.helpModal.tip1Text', 'What did your kidney team tell you about your kidney function and any next steps?')}
            </p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
              {t('journey.helpModal.tip2Title', 'Consider what brought you here')}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary">
              {t('journey.helpModal.tip2Text', 'Were you given this tool by a doctor or nurse? They may have suggested which stage applies to you.')}
            </p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
              {t('journey.helpModal.tip3Title', 'If you are still unsure')}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary">
              {t('journey.helpModal.tip3Text', 'Choose the option that feels closest to your situation. You will still be able to explore all the information in this tool, regardless of which option you select.')}
            </p>
          </div>

          <div className="bg-blue-50 rounded-md p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 text-nhs-blue">
              <InfoCircleIcon />
            </div>
            <p className="text-nhs-blue-dark text-xs sm:text-sm">
              {t('journey.helpModal.note', 'Your kidney team are the experts in your care. If you have questions about your kidney health, please contact them directly.')}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-nhs-pale-grey">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-6 py-3 min-h-[48px] bg-nhs-green text-white font-bold rounded-md text-base
                       hover:bg-nhs-green-dark transition-colors
                       focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2"
          >
            {t('journey.helpModal.understand', 'I understand')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions for default titles/descriptions
function getDefaultTitle(id: JourneyStage): string {
  const titles: Record<JourneyStage, string> = {
    'newly-diagnosed': 'I think I may have kidney disease',
    'monitoring': 'I\'ve just been diagnosed - early stage CKD',
    'preparing': 'I\'ve been diagnosed - late stage CKD',
    'on-dialysis': 'I need to choose a treatment soon',
    'transplant-waiting': 'I\'m due to have a transplant - want to learn more',
    'post-transplant': 'I\'m due to start dialysis - want to learn more',
    'supporting-someone': 'I\'m supporting a family member or friend',
  };
  return titles[id] || id;
}

function getDefaultDescription(id: JourneyStage): string {
  const descriptions: Record<JourneyStage, string> = {
    'newly-diagnosed': 'You are concerned about your kidney health and want to learn more about what kidney disease means.',
    'monitoring': 'You have recently learned about your kidney condition and want to understand what this means for you.',
    'preparing': 'Your kidney function has declined significantly and you may need to think about treatment options soon.',
    'on-dialysis': 'Your kidney team has told you that you will need to start treatment in the coming months and you want to learn about your options.',
    'transplant-waiting': 'You are on the transplant list or have a living donor lined up and want to know more about what to expect.',
    'post-transplant': 'You will be starting dialysis treatment soon and want to understand the different types and what daily life will be like.',
    'supporting-someone': 'Someone close to you has kidney disease and you want to understand their options to help support them.',
  };
  return descriptions[id] || '';
}

// Icon Components
function AudioIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function InfoCircleIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-6 h-6 text-nhs-red flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="14" fontWeight="bold">!</text>
    </svg>
  );
}

function BackIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
