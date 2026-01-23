/**
 * @fileoverview Questions to Ask Doctor Generator for the NHS Renal Decision Aid.
 * Generates personalized questions for users to ask their kidney care team based on
 * their exploration, journey stage, values, and treatment interests.
 *
 * @module components/decision/QuestionsGenerator
 * @version 1.0.0
 * @since 2.6.0
 * @lastModified 23 January 2026
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import type { TreatmentType, JourneyStage } from '@renal-decision-aid/shared-types';

/**
 * Question category configuration
 */
interface QuestionCategory {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
}

const CATEGORIES: QuestionCategory[] = [
  {
    id: 'general',
    labelKey: 'decision.questions.categories.general',
    icon: <GeneralIcon />,
    color: 'nhs-blue',
  },
  {
    id: 'treatment',
    labelKey: 'decision.questions.categories.treatment',
    icon: <TreatmentIcon />,
    color: 'nhs-green',
  },
  {
    id: 'lifestyle',
    labelKey: 'decision.questions.categories.lifestyle',
    icon: <LifestyleIcon />,
    color: 'nhs-aqua-green',
  },
  {
    id: 'support',
    labelKey: 'decision.questions.categories.support',
    icon: <SupportIcon />,
    color: 'nhs-purple',
  },
];

/**
 * Generated question structure
 */
interface GeneratedQuestion {
  id: string;
  text: string;
  category: string;
  reason?: string;
  isSelected: boolean;
  isCustom?: boolean;
}

interface QuestionsGeneratorProps {
  /** Display variant */
  variant?: 'full' | 'compact';
  /** Maximum number of questions to show initially */
  maxInitialQuestions?: number;
  /** Callback when questions change */
  onQuestionsChange?: (questions: GeneratedQuestion[]) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Questions Generator component.
 *
 * Generates personalized questions for users to ask their kidney care team,
 * based on their exploration progress, stated values, and treatment interests.
 *
 * @component
 * @param {QuestionsGeneratorProps} props - Component props
 * @returns {JSX.Element} The rendered questions generator
 */
export default function QuestionsGenerator({
  variant = 'full',
  maxInitialQuestions = 5,
  onQuestionsChange,
  className = '',
}: QuestionsGeneratorProps) {
  const { t } = useTranslation();
  const { session } = useSession();
  const [customQuestion, setCustomQuestion] = useState('');
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Generate personalized questions based on user's session
  const generatedQuestions = useMemo(() => {
    const questions: GeneratedQuestion[] = [];
    const journeyStage = session?.journeyStage;
    const viewedTreatments = session?.viewedTreatments || [];
    const valueRatings = session?.valueRatings || [];

    // General questions everyone should consider
    const generalQuestions = [
      {
        id: 'gen-1',
        textKey: 'decision.questions.general.suitability',
        category: 'general',
        reasonKey: 'decision.questions.reasons.everyoneAsks',
      },
      {
        id: 'gen-2',
        textKey: 'decision.questions.general.timeline',
        category: 'general',
        reasonKey: 'decision.questions.reasons.planAhead',
      },
      {
        id: 'gen-3',
        textKey: 'decision.questions.general.support',
        category: 'support',
        reasonKey: 'decision.questions.reasons.knowYourTeam',
      },
    ];

    generalQuestions.forEach((q) => {
      questions.push({
        id: q.id,
        text: t(q.textKey, q.id),
        category: q.category,
        reason: t(q.reasonKey, ''),
        isSelected: true,
      });
    });

    // Journey stage specific questions
    const stageQuestions: Record<JourneyStage, { textKey: string; category: string; reasonKey: string }[]> = {
      'newly-diagnosed': [
        { textKey: 'decision.questions.stage.newlyDiagnosed.tests', category: 'general', reasonKey: 'decision.questions.reasons.understandDiagnosis' },
        { textKey: 'decision.questions.stage.newlyDiagnosed.next', category: 'general', reasonKey: 'decision.questions.reasons.planAhead' },
      ],
      'monitoring': [
        { textKey: 'decision.questions.stage.monitoring.slowDown', category: 'lifestyle', reasonKey: 'decision.questions.reasons.preserveFunction' },
        { textKey: 'decision.questions.stage.monitoring.frequency', category: 'general', reasonKey: 'decision.questions.reasons.stayInformed' },
      ],
      'preparing': [
        { textKey: 'decision.questions.stage.preparing.timing', category: 'treatment', reasonKey: 'decision.questions.reasons.bePrepared' },
        { textKey: 'decision.questions.stage.preparing.comparison', category: 'treatment', reasonKey: 'decision.questions.reasons.informedChoice' },
      ],
      'on-dialysis': [
        { textKey: 'decision.questions.stage.onDialysis.optimizing', category: 'treatment', reasonKey: 'decision.questions.reasons.optimizeOutcome' },
        { textKey: 'decision.questions.stage.onDialysis.changes', category: 'treatment', reasonKey: 'decision.questions.reasons.flexibility' },
      ],
      'transplant-waiting': [
        { textKey: 'decision.questions.stage.transplantWaiting.waitTime', category: 'treatment', reasonKey: 'decision.questions.reasons.planAhead' },
        { textKey: 'decision.questions.stage.transplantWaiting.preparation', category: 'lifestyle', reasonKey: 'decision.questions.reasons.optimizeOutcome' },
      ],
      'post-transplant': [
        { textKey: 'decision.questions.stage.postTransplant.care', category: 'treatment', reasonKey: 'decision.questions.reasons.maintainHealth' },
        { textKey: 'decision.questions.stage.postTransplant.lifestyle', category: 'lifestyle', reasonKey: 'decision.questions.reasons.qualityOfLife' },
      ],
      'supporting-someone': [
        { textKey: 'decision.questions.stage.supporting.helpHow', category: 'support', reasonKey: 'decision.questions.reasons.supportEffectively' },
        { textKey: 'decision.questions.stage.supporting.carerSupport', category: 'support', reasonKey: 'decision.questions.reasons.lookAfterYourself' },
      ],
    };

    if (journeyStage && stageQuestions[journeyStage]) {
      stageQuestions[journeyStage].forEach((q, idx) => {
        questions.push({
          id: `stage-${idx}`,
          text: t(q.textKey, `stage-${idx}`),
          category: q.category,
          reason: t(q.reasonKey, ''),
          isSelected: true,
        });
      });
    }

    // Treatment-specific questions based on viewed treatments
    const treatmentQuestions: Record<TreatmentType, { textKey: string; category: string }[]> = {
      'kidney-transplant': [
        { textKey: 'decision.questions.treatment.transplant.eligibility', category: 'treatment' },
        { textKey: 'decision.questions.treatment.transplant.livingDonor', category: 'treatment' },
        { textKey: 'decision.questions.treatment.transplant.recovery', category: 'lifestyle' },
      ],
      'hemodialysis': [
        { textKey: 'decision.questions.treatment.hemodialysis.schedule', category: 'treatment' },
        { textKey: 'decision.questions.treatment.hemodialysis.home', category: 'lifestyle' },
        { textKey: 'decision.questions.treatment.hemodialysis.access', category: 'treatment' },
      ],
      'peritoneal-dialysis': [
        { textKey: 'decision.questions.treatment.peritoneal.suitable', category: 'treatment' },
        { textKey: 'decision.questions.treatment.peritoneal.training', category: 'treatment' },
        { textKey: 'decision.questions.treatment.peritoneal.lifestyle', category: 'lifestyle' },
      ],
      'conservative-care': [
        { textKey: 'decision.questions.treatment.conservative.symptoms', category: 'treatment' },
        { textKey: 'decision.questions.treatment.conservative.support', category: 'support' },
        { textKey: 'decision.questions.treatment.conservative.planning', category: 'support' },
      ],
    };

    viewedTreatments.forEach((treatment) => {
      if (treatmentQuestions[treatment]) {
        treatmentQuestions[treatment].forEach((q, idx) => {
          questions.push({
            id: `${treatment}-${idx}`,
            text: t(q.textKey, `${treatment}-${idx}`),
            category: q.category,
            isSelected: false,
          });
        });
      }
    });

    // Values-based questions
    const topValues = valueRatings
      .filter((v) => v.rating >= 4)
      .slice(0, 3);

    const valuesQuestions: Record<string, { textKey: string; category: string }> = {
      'travel': { textKey: 'decision.questions.values.travel', category: 'lifestyle' },
      'hospital-time': { textKey: 'decision.questions.values.hospitalTime', category: 'lifestyle' },
      'independence': { textKey: 'decision.questions.values.independence', category: 'lifestyle' },
      'family-burden': { textKey: 'decision.questions.values.familyBurden', category: 'support' },
      'longevity': { textKey: 'decision.questions.values.longevity', category: 'treatment' },
      'quality-of-life': { textKey: 'decision.questions.values.qualityOfLife', category: 'lifestyle' },
      'home-treatment': { textKey: 'decision.questions.values.homeTreatment', category: 'treatment' },
      'work-activities': { textKey: 'decision.questions.values.workActivities', category: 'lifestyle' },
    };

    topValues.forEach((value) => {
      if (valuesQuestions[value.statementId]) {
        const q = valuesQuestions[value.statementId];
        questions.push({
          id: `value-${value.statementId}`,
          text: t(q.textKey, `value-${value.statementId}`),
          category: q.category,
          reason: t('decision.questions.reasons.basedOnValues', 'Based on what you said matters to you'),
          isSelected: false,
        });
      }
    });

    return questions;
  }, [session, t]);

  // Manage question selection state
  const [questions, setQuestions] = useState<GeneratedQuestion[]>(generatedQuestions);

  // Toggle question selection
  const toggleQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      const updated = prev.map((q) => (q.id === id ? { ...q, isSelected: !q.isSelected } : q));
      onQuestionsChange?.(updated.filter((q) => q.isSelected));
      return updated;
    });
  }, [onQuestionsChange]);

  // Add custom question
  const addCustomQuestion = useCallback(() => {
    if (!customQuestion.trim()) return;

    const newQuestion: GeneratedQuestion = {
      id: `custom-${Date.now()}`,
      text: customQuestion.trim(),
      category: 'general',
      isSelected: true,
      isCustom: true,
    };

    setQuestions((prev) => {
      const updated = [...prev, newQuestion];
      onQuestionsChange?.(updated.filter((q) => q.isSelected));
      return updated;
    });
    setCustomQuestion('');
  }, [customQuestion, onQuestionsChange]);

  // Copy selected questions to clipboard
  const copyToClipboard = useCallback(async () => {
    const selectedQuestions = questions.filter((q) => q.isSelected);
    const text = selectedQuestions.map((q) => `- ${q.text}`).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  }, [questions]);

  // Filter questions by category
  const filteredQuestions = useMemo(() => {
    let filtered = questions;
    if (selectedCategory) {
      filtered = questions.filter((q) => q.category === selectedCategory);
    }
    if (!showAllQuestions && variant === 'compact') {
      filtered = filtered.slice(0, maxInitialQuestions);
    }
    return filtered;
  }, [questions, selectedCategory, showAllQuestions, variant, maxInitialQuestions]);

  const selectedCount = questions.filter((q) => q.isSelected).length;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-nhs-pale-grey p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <QuestionIcon className="w-4 h-4 text-nhs-blue" />
            {t('decision.questions.title', 'Questions for Your Team')}
          </h3>
          <span className="text-xs text-text-muted">{selectedCount} {t('decision.questions.selected', 'selected')}</span>
        </div>

        <ul className="space-y-2 mb-3" role="list">
          {filteredQuestions.slice(0, 3).map((q) => (
            <li key={q.id} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-nhs-blue mt-0.5">-</span>
              <span className="line-clamp-1">{q.text}</span>
            </li>
          ))}
        </ul>

        {questions.length > 3 && (
          <button
            onClick={() => setShowAllQuestions(true)}
            className="text-sm text-nhs-blue font-medium hover:underline"
          >
            {t('decision.questions.viewAll', 'View all {{count}} questions', { count: questions.length })}
          </button>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-nhs-warm-yellow/10 to-nhs-orange/10 border-b border-nhs-pale-grey">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-nhs-warm-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <QuestionIcon className="w-6 h-6 text-nhs-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {t('decision.questions.title', 'Questions for Your Kidney Team')}
            </h2>
            <p className="text-sm text-text-secondary">
              {t('decision.questions.subtitle', 'Based on your exploration, here are personalized questions you might want to ask at your next appointment.')}
            </p>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="p-4 border-b border-nhs-pale-grey bg-nhs-pale-grey/30 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-nhs-blue text-white shadow-sm'
                : 'bg-white text-text-secondary border border-nhs-pale-grey hover:border-nhs-blue/50'
            }`}
          >
            {t('decision.questions.categories.all', 'All')}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? `bg-${cat.color} text-white shadow-sm`
                  : 'bg-white text-text-secondary border border-nhs-pale-grey hover:border-nhs-blue/50'
              }`}
            >
              <span className="w-4 h-4">{cat.icon}</span>
              {t(cat.labelKey, cat.id)}
            </button>
          ))}
        </div>
      </div>

      {/* Questions list */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-muted">
            {t('decision.questions.instructions', 'Select the questions you want to remember to ask.')}
          </p>
          <span className="text-sm font-medium text-nhs-blue">
            {selectedCount} {t('decision.questions.selected', 'selected')}
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {filteredQuestions.map((question) => (
            <button
              key={question.id}
              onClick={() => toggleQuestion(question.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                question.isSelected
                  ? 'bg-nhs-blue/5 border-nhs-blue/40'
                  : 'bg-white border-nhs-pale-grey hover:border-nhs-blue/30 hover:bg-nhs-blue/5'
              }`}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  question.isSelected
                    ? 'bg-nhs-blue text-white'
                    : 'border-2 border-nhs-mid-grey'
                }`}
              >
                {question.isSelected && <CheckIcon className="w-3 h-3" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${question.isSelected ? 'text-nhs-blue' : 'text-text-primary'}`}>
                  {question.text}
                </p>
                {question.reason && (
                  <p className="text-xs text-text-muted mt-1">
                    {question.reason}
                  </p>
                )}
                {question.isCustom && (
                  <span className="inline-block mt-1 text-xs text-nhs-purple bg-nhs-purple/10 px-2 py-0.5 rounded">
                    {t('decision.questions.customLabel', 'Your question')}
                  </span>
                )}
              </div>

              <CategoryBadge category={question.category} />
            </button>
          ))}
        </div>

        {/* Add custom question */}
        <div className="mt-4 pt-4 border-t border-nhs-pale-grey">
          <label className="text-sm font-medium text-text-primary block mb-2">
            {t('decision.questions.addCustom', 'Add your own question')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomQuestion()}
              placeholder={t('decision.questions.customPlaceholder', 'Type your question here...')}
              className="flex-1 px-3 py-2 text-sm border-2 border-nhs-pale-grey rounded-lg focus:outline-none focus:border-nhs-blue focus:ring-2 focus:ring-nhs-blue/20"
            />
            <button
              onClick={addCustomQuestion}
              disabled={!customQuestion.trim()}
              className="px-4 py-2 bg-nhs-blue text-white font-medium text-sm rounded-lg hover:bg-nhs-blue-dark disabled:bg-nhs-mid-grey disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {t('common.add', 'Add')}
            </button>
          </div>
        </div>
      </div>

      {/* Actions footer */}
      <div className="p-4 bg-nhs-pale-grey/30 border-t border-nhs-pale-grey flex flex-wrap gap-3 justify-between items-center">
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-nhs-blue hover:bg-nhs-blue/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
        >
          {copiedToClipboard ? (
            <>
              <CheckIcon className="w-4 h-4" />
              {t('decision.questions.copied', 'Copied!')}
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" />
              {t('decision.questions.copy', 'Copy to clipboard')}
            </>
          )}
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-nhs-blue hover:bg-nhs-blue-dark rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus print:hidden"
        >
          <PrintIcon className="w-4 h-4" />
          {t('decision.questions.print', 'Print questions')}
        </button>
      </div>
    </div>
  );
}

// Category badge component
function CategoryBadge({ category }: { category: string }) {
  const { t } = useTranslation();

  const config: Record<string, { bg: string; text: string }> = {
    general: { bg: 'bg-nhs-blue/10', text: 'text-nhs-blue' },
    treatment: { bg: 'bg-nhs-green/10', text: 'text-nhs-green' },
    lifestyle: { bg: 'bg-nhs-aqua-green/10', text: 'text-nhs-aqua-green' },
    support: { bg: 'bg-nhs-purple/10', text: 'text-nhs-purple' },
  };

  const { bg, text } = config[category] || config.general;

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${bg} ${text} flex-shrink-0`}>
      {t(`decision.questions.categories.${category}`, category)}
    </span>
  );
}

// Icon components
function QuestionIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function PrintIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function GeneralIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function TreatmentIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function LifestyleIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
