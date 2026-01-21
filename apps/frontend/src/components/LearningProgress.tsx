/**
 * @fileoverview Learning progress component for the NHS Renal Decision Aid.
 * Tracks and displays user progress through the learning journey.
 * @module components/LearningProgress
 * @version 2.5.0
 * @since 1.5.0
 * @lastModified 21 January 2026
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

/**
 * Progress section configuration.
 * @interface ProgressSection
 * @property {string} id - Section identifier
 * @property {string} title - Display title
 * @property {string} description - Section description
 * @property {string} path - Navigation path
 * @property {React.ReactNode} icon - Section icon
 * @property {boolean} isCompleted - Whether section is complete
 * @property {boolean} [isInProgress] - Whether section is in progress
 */
interface ProgressSection {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isInProgress?: boolean;
}

/**
 * Props for the LearningProgress component.
 * @interface LearningProgressProps
 * @property {'full' | 'compact' | 'mini'} [variant='full'] - Display variant
 * @property {boolean} [showEncouragement=true] - Whether to show encouragement messages
 */
interface LearningProgressProps {
  variant?: 'full' | 'compact' | 'mini';
  showEncouragement?: boolean;
}

/** Array of treatment types for progress tracking. */
const TREATMENT_TYPES: TreatmentType[] = [
  'kidney-transplant',
  'hemodialysis',
  'peritoneal-dialysis',
  'conservative-care',
];

/** Checkmark icon for completed items. */
const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * Circular progress ring SVG component.
 * @component
 * @param {Object} props - Component props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {number} [props.size=80] - Ring size in pixels
 * @param {number} [props.strokeWidth=8] - Stroke width in pixels
 * @param {string} [props.color='#005EB8'] - Progress color
 * @returns {JSX.Element} The rendered progress ring
 */
const ProgressRing = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#005EB8',
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E8EDEE"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
};

/**
 * Badge component for displaying earned achievements.
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Badge icon
 * @param {string} props.label - Badge label
 * @param {boolean} props.isEarned - Whether badge is earned
 * @param {'sm' | 'md'} [props.size='md'] - Badge size
 * @returns {JSX.Element} The rendered badge
 */
const Badge = ({
  icon,
  label,
  isEarned,
  size = 'md',
}: {
  icon: React.ReactNode;
  label: string;
  isEarned: boolean;
  size?: 'sm' | 'md';
}) => {
  const sizeClasses = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-300 ${
          isEarned
            ? 'bg-gradient-to-br from-nhs-green to-nhs-green-dark text-white shadow-lg'
            : 'bg-nhs-pale-grey text-text-muted'
        }`}
      >
        <span className={iconSize}>{icon}</span>
      </div>
      <span
        className={`text-xs text-center font-medium ${
          isEarned ? 'text-nhs-green' : 'text-text-muted'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * Learning progress component showing user journey completion.
 *
 * Features:
 * - Three display variants: full, compact, mini
 * - Circular progress ring visualization
 * - Section-by-section progress tracking
 * - Achievement badges
 * - Encouragement messages based on progress
 * - Links to summary when sufficient progress
 *
 * @component
 * @param {LearningProgressProps} props - Component props
 * @returns {JSX.Element} The rendered progress display
 *
 * @example
 * <LearningProgress variant="full" showEncouragement={true} />
 */
export default function LearningProgress({
  variant = 'full',
  showEncouragement = true,
}: LearningProgressProps) {
  const { t } = useTranslation();
  const { session } = useSession();

  // Calculate progress metrics
  const progress = useMemo(() => {
    if (!session) {
      return {
        treatmentsViewed: 0,
        totalTreatments: 4,
        valuesCompleted: false,
        questionnaireCompleted: false,
        chatUsed: false,
        overallProgress: 0,
      };
    }

    const treatmentsViewed = session.viewedTreatments?.length || 0;
    const totalTreatments = TREATMENT_TYPES.length;
    const valuesCompleted = (session.valueRatings?.length || 0) >= 5;
    const questionnaireCompleted = (session.questionnaireAnswers?.length || 0) >= 5;
    const chatUsed = (session.chatHistory?.length || 0) > 0;

    // Calculate overall progress (weighted)
    const treatmentScore = (treatmentsViewed / totalTreatments) * 40;
    const valuesScore = valuesCompleted ? 25 : 0;
    const questionnaireScore = questionnaireCompleted ? 20 : 0;
    const chatScore = chatUsed ? 15 : 0;
    const overallProgress = Math.round(treatmentScore + valuesScore + questionnaireScore + chatScore);

    return {
      treatmentsViewed,
      totalTreatments,
      valuesCompleted,
      questionnaireCompleted,
      chatUsed,
      overallProgress,
    };
  }, [session]);

  // Get sections with completion status
  const sections: ProgressSection[] = useMemo(
    () => [
      {
        id: 'questionnaire',
        title: t('progress.sections.questionnaire', 'About You'),
        description: t('progress.sections.questionnaireDesc', 'Share your situation'),
        path: '/questions',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ),
        isCompleted: progress.questionnaireCompleted,
      },
      {
        id: 'treatments',
        title: t('progress.sections.treatments', 'Treatment Options'),
        description: t('progress.sections.treatmentsDesc', '{{viewed}} of {{total}} explored', {
          viewed: progress.treatmentsViewed,
          total: progress.totalTreatments,
        }),
        path: '/treatments',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        ),
        isCompleted: progress.treatmentsViewed === progress.totalTreatments,
        isInProgress: progress.treatmentsViewed > 0 && progress.treatmentsViewed < progress.totalTreatments,
      },
      {
        id: 'values',
        title: t('progress.sections.values', 'Values Exercise'),
        description: t('progress.sections.valuesDesc', 'Clarify your priorities'),
        path: '/values',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ),
        isCompleted: progress.valuesCompleted,
      },
      {
        id: 'chat',
        title: t('progress.sections.chat', 'Ask Questions'),
        description: t('progress.sections.chatDesc', 'Get answers'),
        path: '/chat',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
        isCompleted: progress.chatUsed,
      },
    ],
    [t, progress]
  );

  // Get encouragement message based on progress
  const encouragementMessage = useMemo(() => {
    if (progress.overallProgress === 0) {
      return t('progress.encouragement.start', 'Start your journey by exploring treatment options');
    }
    if (progress.overallProgress < 25) {
      return t('progress.encouragement.beginning', 'Great start! Keep exploring to learn more');
    }
    if (progress.overallProgress < 50) {
      return t('progress.encouragement.making', 'You are making good progress!');
    }
    if (progress.overallProgress < 75) {
      return t('progress.encouragement.halfway', 'More than halfway there - well done!');
    }
    if (progress.overallProgress < 100) {
      return t('progress.encouragement.almost', 'Almost complete! Just a few more sections');
    }
    return t('progress.encouragement.complete', 'Excellent! You have explored everything');
  }, [progress.overallProgress, t]);

  // Compact variant - just a progress bar
  if (variant === 'mini') {
    return (
      <div className="flex items-center gap-3 p-3 bg-nhs-blue/5 rounded-xl">
        <div className="relative">
          <ProgressRing progress={progress.overallProgress} size={40} strokeWidth={4} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-nhs-blue">
            {progress.overallProgress}%
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {t('progress.yourProgress', 'Your Progress')}
          </p>
          <p className="text-xs text-text-secondary truncate">
            {progress.treatmentsViewed}/{progress.totalTreatments} {t('progress.treatments', 'treatments')}
          </p>
        </div>
      </div>
    );
  }

  // Compact variant - horizontal progress
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl border border-nhs-pale-grey p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">
            {t('progress.yourProgress', 'Your Progress')}
          </h3>
          <span className="text-nhs-blue font-bold">{progress.overallProgress}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-nhs-pale-grey rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-nhs-blue to-nhs-green rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress.overallProgress}%` }}
          />
        </div>

        {/* Section indicators */}
        <div className="flex justify-between">
          {sections.map((section) => (
            <Link
              key={section.id}
              to={section.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                section.isCompleted
                  ? 'text-nhs-green'
                  : section.isInProgress
                  ? 'text-nhs-blue'
                  : 'text-text-muted hover:text-nhs-blue'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  section.isCompleted
                    ? 'bg-nhs-green/20'
                    : section.isInProgress
                    ? 'bg-nhs-blue/20'
                    : 'bg-nhs-pale-grey'
                }`}
              >
                {section.isCompleted ? <CheckIcon className="w-4 h-4" /> : section.icon}
              </div>
              <span className="text-xs text-center">{section.title}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Full variant - detailed progress view
  return (
    <div className="bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden">
      {/* Header with overall progress */}
      <div className="p-6 bg-gradient-to-r from-nhs-blue/5 to-nhs-green/5 border-b border-nhs-pale-grey">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <ProgressRing progress={progress.overallProgress} size={100} strokeWidth={10} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-nhs-blue">{progress.overallProgress}%</span>
              <span className="text-xs text-text-secondary">{t('progress.complete', 'complete')}</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-text-primary mb-2">
              {t('progress.title', 'Your Learning Journey')}
            </h2>
            {showEncouragement && (
              <p className="text-text-secondary">{encouragementMessage}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sections list */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          {t('progress.sections.title', 'Sections to Explore')}
        </h3>

        <div className="space-y-3">
          {sections.map((section) => (
            <Link
              key={section.id}
              to={section.path}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                section.isCompleted
                  ? 'bg-nhs-green/5 border-nhs-green/30'
                  : section.isInProgress
                  ? 'bg-nhs-blue/5 border-nhs-blue/30'
                  : 'bg-white border-nhs-pale-grey hover:border-nhs-blue/50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  section.isCompleted
                    ? 'bg-nhs-green text-white'
                    : section.isInProgress
                    ? 'bg-nhs-blue/20 text-nhs-blue'
                    : 'bg-nhs-pale-grey text-text-secondary'
                }`}
              >
                {section.isCompleted ? <CheckIcon className="w-6 h-6" /> : section.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary">{section.title}</p>
                <p className="text-sm text-text-secondary">{section.description}</p>
              </div>

              <div className="flex-shrink-0">
                {section.isCompleted ? (
                  <span className="text-xs font-medium text-nhs-green bg-nhs-green/10 px-2 py-1 rounded-full">
                    {t('progress.status.completed', 'Completed')}
                  </span>
                ) : section.isInProgress ? (
                  <span className="text-xs font-medium text-nhs-blue bg-nhs-blue/10 px-2 py-1 rounded-full">
                    {t('progress.status.inProgress', 'In Progress')}
                  </span>
                ) : (
                  <svg
                    className="w-5 h-5 text-text-muted"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Badges section */}
      <div className="p-6 bg-gradient-to-r from-nhs-pale-grey/50 to-white border-t border-nhs-pale-grey">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          {t('progress.badges.title', 'Your Badges')}
        </h3>

        <div className="flex justify-around flex-wrap gap-4">
          <Badge
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
            label={t('progress.badges.explorer', 'Explorer')}
            isEarned={progress.treatmentsViewed >= 1}
          />
          <Badge
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z" />
              </svg>
            }
            label={t('progress.badges.allTreatments', 'All Treatments')}
            isEarned={progress.treatmentsViewed === progress.totalTreatments}
          />
          <Badge
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            }
            label={t('progress.badges.values', 'Values Clear')}
            isEarned={progress.valuesCompleted}
          />
          <Badge
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
            label={t('progress.badges.curious', 'Curious Mind')}
            isEarned={progress.chatUsed}
          />
          <Badge
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            }
            label={t('progress.badges.complete', 'Journey Complete')}
            isEarned={progress.overallProgress === 100}
          />
        </div>
      </div>

      {/* Summary action */}
      {progress.overallProgress >= 50 && (
        <div className="p-4 bg-nhs-green/5 border-t border-nhs-green/20">
          <Link
            to="/summary"
            className="flex items-center justify-center gap-2 w-full py-3 bg-nhs-green text-white font-semibold rounded-xl hover:bg-nhs-green-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            {t('progress.viewSummary', 'View Your Summary')}
          </Link>
        </div>
      )}
    </div>
  );
}
