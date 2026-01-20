/**
 * Questionnaire Data Structure
 * Defines the questions for the kidney treatment decision aid
 */

export type QuestionType = 'single-choice' | 'multiple-choice' | 'slider' | 'text';

export interface QuestionOption {
  id: string;
  labelKey: string; // i18n key
  value: string | number;
}

export interface Question {
  id: string;
  type: QuestionType;
  titleKey: string; // i18n key
  descriptionKey?: string; // i18n key
  options?: QuestionOption[];
  min?: number; // for slider
  max?: number; // for slider
  step?: number; // for slider
  required: boolean;
  helpTextKey?: string; // i18n key
}

export const QUESTIONNAIRE_QUESTIONS: Question[] = [
  {
    id: 'age-range',
    type: 'single-choice',
    titleKey: 'questionnaire.questions.ageRange.title',
    descriptionKey: 'questionnaire.questions.ageRange.description',
    required: true,
    options: [
      { id: 'under-50', labelKey: 'questionnaire.questions.ageRange.options.under50', value: 'under-50' },
      { id: '50-65', labelKey: 'questionnaire.questions.ageRange.options.50to65', value: '50-65' },
      { id: '65-75', labelKey: 'questionnaire.questions.ageRange.options.65to75', value: '65-75' },
      { id: 'over-75', labelKey: 'questionnaire.questions.ageRange.options.over75', value: 'over-75' },
    ],
  },
  {
    id: 'living-situation',
    type: 'single-choice',
    titleKey: 'questionnaire.questions.livingSituation.title',
    descriptionKey: 'questionnaire.questions.livingSituation.description',
    required: true,
    options: [
      { id: 'alone', labelKey: 'questionnaire.questions.livingSituation.options.alone', value: 'alone' },
      { id: 'with-partner', labelKey: 'questionnaire.questions.livingSituation.options.withPartner', value: 'with-partner' },
      { id: 'with-family', labelKey: 'questionnaire.questions.livingSituation.options.withFamily', value: 'with-family' },
      { id: 'care-facility', labelKey: 'questionnaire.questions.livingSituation.options.careFacility', value: 'care-facility' },
    ],
  },
  {
    id: 'work-status',
    type: 'single-choice',
    titleKey: 'questionnaire.questions.workStatus.title',
    descriptionKey: 'questionnaire.questions.workStatus.description',
    required: true,
    options: [
      { id: 'working-full', labelKey: 'questionnaire.questions.workStatus.options.workingFull', value: 'working-full' },
      { id: 'working-part', labelKey: 'questionnaire.questions.workStatus.options.workingPart', value: 'working-part' },
      { id: 'retired', labelKey: 'questionnaire.questions.workStatus.options.retired', value: 'retired' },
      { id: 'unable', labelKey: 'questionnaire.questions.workStatus.options.unable', value: 'unable' },
    ],
  },
  {
    id: 'support-available',
    type: 'single-choice',
    titleKey: 'questionnaire.questions.supportAvailable.title',
    descriptionKey: 'questionnaire.questions.supportAvailable.description',
    required: true,
    options: [
      { id: 'yes-regular', labelKey: 'questionnaire.questions.supportAvailable.options.yesRegular', value: 'yes-regular' },
      { id: 'yes-sometimes', labelKey: 'questionnaire.questions.supportAvailable.options.yesSometimes', value: 'yes-sometimes' },
      { id: 'limited', labelKey: 'questionnaire.questions.supportAvailable.options.limited', value: 'limited' },
      { id: 'no', labelKey: 'questionnaire.questions.supportAvailable.options.no', value: 'no' },
    ],
  },
  {
    id: 'important-factors',
    type: 'multiple-choice',
    titleKey: 'questionnaire.questions.importantFactors.title',
    descriptionKey: 'questionnaire.questions.importantFactors.description',
    required: true,
    helpTextKey: 'questionnaire.questions.importantFactors.helpText',
    options: [
      { id: 'independence', labelKey: 'questionnaire.questions.importantFactors.options.independence', value: 'independence' },
      { id: 'travel', labelKey: 'questionnaire.questions.importantFactors.options.travel', value: 'travel' },
      { id: 'family-time', labelKey: 'questionnaire.questions.importantFactors.options.familyTime', value: 'family-time' },
      { id: 'work-life', labelKey: 'questionnaire.questions.importantFactors.options.workLife', value: 'work-life' },
      { id: 'minimal-hospital', labelKey: 'questionnaire.questions.importantFactors.options.minimalHospital', value: 'minimal-hospital' },
      { id: 'best-outcomes', labelKey: 'questionnaire.questions.importantFactors.options.bestOutcomes', value: 'best-outcomes' },
    ],
  },
  {
    id: 'health-concerns',
    type: 'multiple-choice',
    titleKey: 'questionnaire.questions.healthConcerns.title',
    descriptionKey: 'questionnaire.questions.healthConcerns.description',
    required: false,
    options: [
      { id: 'diabetes', labelKey: 'questionnaire.questions.healthConcerns.options.diabetes', value: 'diabetes' },
      { id: 'heart-disease', labelKey: 'questionnaire.questions.healthConcerns.options.heartDisease', value: 'heart-disease' },
      { id: 'mobility', labelKey: 'questionnaire.questions.healthConcerns.options.mobility', value: 'mobility' },
      { id: 'vision', labelKey: 'questionnaire.questions.healthConcerns.options.vision', value: 'vision' },
      { id: 'none', labelKey: 'questionnaire.questions.healthConcerns.options.none', value: 'none' },
    ],
  },
];

/**
 * Get question by ID
 */
export function getQuestionById(id: string): Question | undefined {
  return QUESTIONNAIRE_QUESTIONS.find((q) => q.id === id);
}

/**
 * Get total number of questions
 */
export function getTotalQuestions(): number {
  return QUESTIONNAIRE_QUESTIONS.length;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(currentIndex: number): number {
  return Math.round(((currentIndex + 1) / QUESTIONNAIRE_QUESTIONS.length) * 100);
}
