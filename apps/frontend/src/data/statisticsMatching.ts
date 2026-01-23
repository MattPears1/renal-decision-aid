/**
 * @fileoverview Statistics matching algorithm for personalized statistics.
 * Connects user profile data from the session to relevant UK renal statistics,
 * producing personalized insights based on age, ethnicity, and primary disease.
 *
 * @module data/statisticsMatching
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

import {
  OVERALL_PREVALENCE,
  STATS_BY_AGE,
  STATS_BY_ETHNICITY,
  STATS_BY_DISEASE,
  WAITING_LIST_DATA,
  QUALITY_OF_LIFE_DATA,
  SURVIVAL_DATA,
  type AgeGroup,
  type EthnicityGroup,
  type PrimaryDisease,
  type ModalityBreakdown,
  type WaitingListData,
  type QualityOfLifeData,
  type SurvivalData,
} from './ukRenalStatistics';

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  ageGroup?: AgeGroup;
  ethnicity?: EthnicityGroup;
  primaryDisease?: PrimaryDisease;
  diabetesStatus?: boolean;
  hasLivingDonor?: boolean;
}

export interface PersonalizedStats {
  /** The treatment modality breakdown percentages */
  modalityBreakdown: ModalityBreakdown;
  /** Which data was used to generate the breakdown */
  dataSource: 'overall' | 'age' | 'ethnicity' | 'disease';
  /** Description key for the personalization basis */
  personalizationBasisKey: string;
  /** The age group used, if any */
  ageGroup?: AgeGroup;
  /** Whether data is personalized beyond overall statistics */
  isPersonalized: boolean;
  /** Waiting list data */
  waitingList: WaitingListData;
  /** Quality of life comparisons */
  qualityOfLife: QualityOfLifeData[];
  /** Survival data */
  survival: SurvivalData[];
  /** Additional contextual insights */
  insights: PersonalizedInsight[];
}

export interface PersonalizedInsight {
  id: string;
  titleKey: string;
  descriptionKey: string;
  type: 'info' | 'positive' | 'context';
  relevance: 'high' | 'medium' | 'low';
}

// ============================================================================
// Matching Algorithm
// ============================================================================

/**
 * Generates personalized statistics based on the user's profile.
 * Uses a layered approach:
 * 1. Start with overall UK statistics as baseline
 * 2. Refine based on age group if known
 * 3. Further refine based on primary disease if known
 * 4. Add ethnicity-based context
 * 5. Add insights for diabetes and living donor availability
 *
 * @param profile - The user's demographic and clinical profile
 * @returns Personalized statistics with breakdown and insights
 */
export function getPersonalizedStatistics(profile: UserProfile): PersonalizedStats {
  let modalityBreakdown: ModalityBreakdown = { ...OVERALL_PREVALENCE.breakdown };
  let dataSource: PersonalizedStats['dataSource'] = 'overall';
  let personalizationBasisKey = 'statistics.basis.overall';
  const insights: PersonalizedInsight[] = [];

  // Layer 1: Age group refinement (primary factor)
  if (profile.ageGroup && STATS_BY_AGE[profile.ageGroup]) {
    modalityBreakdown = { ...STATS_BY_AGE[profile.ageGroup] };
    dataSource = 'age';
    personalizationBasisKey = 'statistics.basis.ageGroup';
  }

  // Layer 2: Primary disease refinement (overrides age if available)
  if (profile.primaryDisease && STATS_BY_DISEASE[profile.primaryDisease]) {
    modalityBreakdown = { ...STATS_BY_DISEASE[profile.primaryDisease] };
    dataSource = 'disease';
    personalizationBasisKey = 'statistics.basis.disease';
  }

  // Layer 3: Ethnicity context (adds insights but doesn't override breakdown)
  if (profile.ethnicity && STATS_BY_ETHNICITY[profile.ethnicity]) {
    const ethnicityStats = STATS_BY_ETHNICITY[profile.ethnicity];

    // If we only have overall data, use ethnicity data
    if (dataSource === 'overall') {
      modalityBreakdown = { ...ethnicityStats };
      dataSource = 'ethnicity';
      personalizationBasisKey = 'statistics.basis.ethnicity';
    }

    // Add ethnicity insight if transplant rate differs significantly
    const overallTransplant = OVERALL_PREVALENCE.breakdown.transplant;
    const diff = ethnicityStats.transplant - overallTransplant;
    if (Math.abs(diff) >= 5) {
      insights.push({
        id: 'ethnicity-transplant',
        titleKey: 'statistics.insights.ethnicityTransplant.title',
        descriptionKey: diff < 0
          ? 'statistics.insights.ethnicityTransplant.lowerRate'
          : 'statistics.insights.ethnicityTransplant.higherRate',
        type: 'context',
        relevance: 'medium',
      });
    }
  }

  // Layer 4: Diabetes-specific insights
  if (profile.diabetesStatus) {
    insights.push({
      id: 'diabetes-context',
      titleKey: 'statistics.insights.diabetes.title',
      descriptionKey: 'statistics.insights.diabetes.description',
      type: 'info',
      relevance: 'high',
    });

    // If no disease-specific data yet, apply diabetes stats
    if (dataSource !== 'disease') {
      modalityBreakdown = { ...STATS_BY_DISEASE['diabetes'] };
      dataSource = 'disease';
      personalizationBasisKey = 'statistics.basis.diabetes';
    }
  }

  // Layer 5: Living donor availability context
  if (profile.hasLivingDonor) {
    insights.push({
      id: 'living-donor',
      titleKey: 'statistics.insights.livingDonor.title',
      descriptionKey: 'statistics.insights.livingDonor.description',
      type: 'positive',
      relevance: 'high',
    });
  }

  // Layer 6: Age-specific insights
  if (profile.ageGroup) {
    if (profile.ageGroup === '75+') {
      insights.push({
        id: 'age-conservative',
        titleKey: 'statistics.insights.ageConservative.title',
        descriptionKey: 'statistics.insights.ageConservative.description',
        type: 'context',
        relevance: 'medium',
      });
    }

    if (profile.ageGroup === '18-44') {
      insights.push({
        id: 'age-transplant',
        titleKey: 'statistics.insights.ageTransplant.title',
        descriptionKey: 'statistics.insights.ageTransplant.description',
        type: 'positive',
        relevance: 'medium',
      });
    }
  }

  const isPersonalized = dataSource !== 'overall';

  return {
    modalityBreakdown,
    dataSource,
    personalizationBasisKey,
    ageGroup: profile.ageGroup,
    isPersonalized,
    waitingList: WAITING_LIST_DATA,
    qualityOfLife: QUALITY_OF_LIFE_DATA,
    survival: SURVIVAL_DATA,
    insights,
  };
}

/**
 * Maps questionnaire answers to a UserProfile for statistics matching.
 * Extracts relevant demographic and clinical information from session answers.
 *
 * @param answers - Array of questionnaire answers from the session
 * @param journeyStage - The user's current journey stage
 * @returns A UserProfile derived from the available session data
 */
export function buildProfileFromSession(
  answers: Array<{ questionId: string; value: string | number | string[] }>,
  journeyStage?: string
): UserProfile {
  const profile: UserProfile = {};

  // Extract age group from questionnaire if available
  const ageAnswer = answers.find(a => a.questionId === 'age-group');
  if (ageAnswer && typeof ageAnswer.value === 'string') {
    const ageMap: Record<string, AgeGroup> = {
      '18-44': '18-44',
      '45-64': '45-64',
      '65-74': '65-74',
      '75+': '75+',
      'young-adult': '18-44',
      'middle-aged': '45-64',
      'older-adult': '65-74',
      'elderly': '75+',
    };
    profile.ageGroup = ageMap[ageAnswer.value];
  }

  // Extract ethnicity from questionnaire if available
  const ethnicityAnswer = answers.find(a => a.questionId === 'ethnicity');
  if (ethnicityAnswer && typeof ethnicityAnswer.value === 'string') {
    const ethnicityMap: Record<string, EthnicityGroup> = {
      'white': 'white',
      'white-british': 'white',
      'white-irish': 'white',
      'white-other': 'white',
      'south-asian': 'south-asian',
      'asian-indian': 'south-asian',
      'asian-pakistani': 'south-asian',
      'asian-bangladeshi': 'south-asian',
      'black': 'black',
      'black-african': 'black',
      'black-caribbean': 'black',
      'mixed': 'other',
      'other': 'other',
      'prefer-not-say': undefined as unknown as EthnicityGroup,
    };
    const mapped = ethnicityMap[ethnicityAnswer.value];
    if (mapped) {
      profile.ethnicity = mapped;
    }
  }

  // Extract primary disease from questionnaire if available
  const diseaseAnswer = answers.find(a => a.questionId === 'primary-disease');
  if (diseaseAnswer && typeof diseaseAnswer.value === 'string') {
    const diseaseMap: Record<string, PrimaryDisease> = {
      'diabetes': 'diabetes',
      'diabetes-type-1': 'diabetes',
      'diabetes-type-2': 'diabetes',
      'glomerulonephritis': 'glomerulonephritis',
      'iga-nephropathy': 'glomerulonephritis',
      'polycystic': 'polycystic-kidney-disease',
      'pkd': 'polycystic-kidney-disease',
      'hypertension': 'hypertension-renovascular',
      'renovascular': 'hypertension-renovascular',
    };
    profile.primaryDisease = diseaseMap[diseaseAnswer.value];
  }

  // Check diabetes status
  const diabetesAnswer = answers.find(a => a.questionId === 'has-diabetes');
  if (diabetesAnswer) {
    profile.diabetesStatus = diabetesAnswer.value === 'yes';
  }

  // If primary disease is diabetes, also set diabetes status
  if (profile.primaryDisease === 'diabetes') {
    profile.diabetesStatus = true;
  }

  // Check living donor availability
  const donorAnswer = answers.find(a => a.questionId === 'living-donor');
  if (donorAnswer) {
    profile.hasLivingDonor = donorAnswer.value === 'yes';
  }

  // Infer from journey stage if transplant-waiting, donor may be available
  if (journeyStage === 'transplant-waiting') {
    // Don't override explicit answer, but note potential relevance
    if (profile.hasLivingDonor === undefined) {
      profile.hasLivingDonor = false;
    }
  }

  return profile;
}
