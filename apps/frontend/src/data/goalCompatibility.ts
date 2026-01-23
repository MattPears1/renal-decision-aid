/**
 * @fileoverview Life Goals compatibility scoring data for the NHS Renal Decision Aid.
 * Maps patient life goals to compatibility scores for each treatment type.
 * Scores are based on realistic medical knowledge about how treatments affect daily life.
 *
 * @module data/goalCompatibility
 * @version 1.0.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 */

/**
 * Treatment types for compatibility scoring.
 * More granular than the main TreatmentType to distinguish sub-types.
 */
export type GoalTreatmentType =
  | 'transplant-living'
  | 'transplant-deceased'
  | 'home-hd'
  | 'unit-hd'
  | 'apd'
  | 'capd'
  | 'conservative';

/**
 * Goal category identifiers.
 */
export type GoalCategory =
  | 'work'
  | 'family'
  | 'travel'
  | 'hobbies'
  | 'independence'
  | 'religious';

/**
 * A single life goal within a category.
 */
export interface LifeGoal {
  id: string;
  category: GoalCategory;
  labelKey: string;
}

/**
 * Compatibility score for a single goal-treatment pair.
 * Score is 1-5 where 5 is highly compatible.
 */
export interface GoalCompatibilityScore {
  goalId: string;
  scores: Record<GoalTreatmentType, number>;
  explanationKeys: Record<GoalTreatmentType, string>;
}

/**
 * Category metadata for display.
 */
export interface GoalCategoryInfo {
  id: GoalCategory;
  titleKey: string;
  descriptionKey: string;
  icon: string;
}

/**
 * Category definitions with display metadata.
 */
export const GOAL_CATEGORIES: GoalCategoryInfo[] = [
  {
    id: 'work',
    titleKey: 'lifeGoals.categories.work.title',
    descriptionKey: 'lifeGoals.categories.work.description',
    icon: 'work',
  },
  {
    id: 'family',
    titleKey: 'lifeGoals.categories.family.title',
    descriptionKey: 'lifeGoals.categories.family.description',
    icon: 'family',
  },
  {
    id: 'travel',
    titleKey: 'lifeGoals.categories.travel.title',
    descriptionKey: 'lifeGoals.categories.travel.description',
    icon: 'travel',
  },
  {
    id: 'hobbies',
    titleKey: 'lifeGoals.categories.hobbies.title',
    descriptionKey: 'lifeGoals.categories.hobbies.description',
    icon: 'hobbies',
  },
  {
    id: 'independence',
    titleKey: 'lifeGoals.categories.independence.title',
    descriptionKey: 'lifeGoals.categories.independence.description',
    icon: 'independence',
  },
  {
    id: 'religious',
    titleKey: 'lifeGoals.categories.religious.title',
    descriptionKey: 'lifeGoals.categories.religious.description',
    icon: 'religious',
  },
];

/**
 * All life goals grouped by category.
 */
export const LIFE_GOALS: LifeGoal[] = [
  // Work & Career
  { id: 'return-to-work', category: 'work', labelKey: 'lifeGoals.goals.returnToWork' },
  { id: 'career-progression', category: 'work', labelKey: 'lifeGoals.goals.careerProgression' },
  { id: 'flexible-hours', category: 'work', labelKey: 'lifeGoals.goals.flexibleHours' },
  { id: 'physical-job', category: 'work', labelKey: 'lifeGoals.goals.physicalJob' },

  // Family & Relationships
  { id: 'childcare', category: 'family', labelKey: 'lifeGoals.goals.childcare' },
  { id: 'family-time', category: 'family', labelKey: 'lifeGoals.goals.familyTime' },
  { id: 'milestones', category: 'family', labelKey: 'lifeGoals.goals.milestones' },
  { id: 'intimacy', category: 'family', labelKey: 'lifeGoals.goals.intimacy' },

  // Travel & Holidays
  { id: 'travel-freedom', category: 'travel', labelKey: 'lifeGoals.goals.travelFreedom' },
  { id: 'holiday-planning', category: 'travel', labelKey: 'lifeGoals.goals.holidayPlanning' },
  { id: 'spontaneous-trips', category: 'travel', labelKey: 'lifeGoals.goals.spontaneousTrips' },

  // Hobbies & Activities
  { id: 'sports', category: 'hobbies', labelKey: 'lifeGoals.goals.sports' },
  { id: 'creative-activities', category: 'hobbies', labelKey: 'lifeGoals.goals.creativeActivities' },
  { id: 'social-activities', category: 'hobbies', labelKey: 'lifeGoals.goals.socialActivities' },
  { id: 'gardening-outdoors', category: 'hobbies', labelKey: 'lifeGoals.goals.gardeningOutdoors' },

  // Independence
  { id: 'self-care', category: 'independence', labelKey: 'lifeGoals.goals.selfCare' },
  { id: 'driving', category: 'independence', labelKey: 'lifeGoals.goals.driving' },
  { id: 'living-alone', category: 'independence', labelKey: 'lifeGoals.goals.livingAlone' },
  { id: 'managing-home', category: 'independence', labelKey: 'lifeGoals.goals.managingHome' },

  // Religious & Cultural
  { id: 'dietary-needs', category: 'religious', labelKey: 'lifeGoals.goals.dietaryNeeds' },
  { id: 'prayer-times', category: 'religious', labelKey: 'lifeGoals.goals.prayerTimes' },
  { id: 'community-participation', category: 'religious', labelKey: 'lifeGoals.goals.communityParticipation' },
  { id: 'fasting', category: 'religious', labelKey: 'lifeGoals.goals.fasting' },
];

/**
 * Compatibility scores for each goal-treatment combination.
 * Scores are 1 (low compatibility) to 5 (high compatibility).
 * Based on realistic medical knowledge about treatment impacts.
 */
export const COMPATIBILITY_SCORES: GoalCompatibilityScore[] = [
  // Work & Career goals
  {
    goalId: 'return-to-work',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.returnToWork.transplant',
      'transplant-deceased': 'lifeGoals.explanations.returnToWork.transplant',
      'home-hd': 'lifeGoals.explanations.returnToWork.homeHd',
      'unit-hd': 'lifeGoals.explanations.returnToWork.unitHd',
      'apd': 'lifeGoals.explanations.returnToWork.apd',
      'capd': 'lifeGoals.explanations.returnToWork.capd',
      'conservative': 'lifeGoals.explanations.returnToWork.conservative',
    },
  },
  {
    goalId: 'career-progression',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 2,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.careerProgression.transplant',
      'transplant-deceased': 'lifeGoals.explanations.careerProgression.transplant',
      'home-hd': 'lifeGoals.explanations.careerProgression.homeHd',
      'unit-hd': 'lifeGoals.explanations.careerProgression.unitHd',
      'apd': 'lifeGoals.explanations.careerProgression.apd',
      'capd': 'lifeGoals.explanations.careerProgression.capd',
      'conservative': 'lifeGoals.explanations.careerProgression.conservative',
    },
  },
  {
    goalId: 'flexible-hours',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 4,
      'unit-hd': 2,
      'apd': 5,
      'capd': 3,
      'conservative': 4,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.flexibleHours.transplant',
      'transplant-deceased': 'lifeGoals.explanations.flexibleHours.transplant',
      'home-hd': 'lifeGoals.explanations.flexibleHours.homeHd',
      'unit-hd': 'lifeGoals.explanations.flexibleHours.unitHd',
      'apd': 'lifeGoals.explanations.flexibleHours.apd',
      'capd': 'lifeGoals.explanations.flexibleHours.capd',
      'conservative': 'lifeGoals.explanations.flexibleHours.conservative',
    },
  },
  {
    goalId: 'physical-job',
    scores: {
      'transplant-living': 4,
      'transplant-deceased': 4,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 3,
      'capd': 2,
      'conservative': 2,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.physicalJob.transplant',
      'transplant-deceased': 'lifeGoals.explanations.physicalJob.transplant',
      'home-hd': 'lifeGoals.explanations.physicalJob.homeHd',
      'unit-hd': 'lifeGoals.explanations.physicalJob.unitHd',
      'apd': 'lifeGoals.explanations.physicalJob.apd',
      'capd': 'lifeGoals.explanations.physicalJob.capd',
      'conservative': 'lifeGoals.explanations.physicalJob.conservative',
    },
  },

  // Family & Relationships goals
  {
    goalId: 'childcare',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.childcare.transplant',
      'transplant-deceased': 'lifeGoals.explanations.childcare.transplant',
      'home-hd': 'lifeGoals.explanations.childcare.homeHd',
      'unit-hd': 'lifeGoals.explanations.childcare.unitHd',
      'apd': 'lifeGoals.explanations.childcare.apd',
      'capd': 'lifeGoals.explanations.childcare.capd',
      'conservative': 'lifeGoals.explanations.childcare.conservative',
    },
  },
  {
    goalId: 'family-time',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 4,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.familyTime.transplant',
      'transplant-deceased': 'lifeGoals.explanations.familyTime.transplant',
      'home-hd': 'lifeGoals.explanations.familyTime.homeHd',
      'unit-hd': 'lifeGoals.explanations.familyTime.unitHd',
      'apd': 'lifeGoals.explanations.familyTime.apd',
      'capd': 'lifeGoals.explanations.familyTime.capd',
      'conservative': 'lifeGoals.explanations.familyTime.conservative',
    },
  },
  {
    goalId: 'milestones',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 4,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.milestones.transplantLiving',
      'transplant-deceased': 'lifeGoals.explanations.milestones.transplantDeceased',
      'home-hd': 'lifeGoals.explanations.milestones.homeHd',
      'unit-hd': 'lifeGoals.explanations.milestones.unitHd',
      'apd': 'lifeGoals.explanations.milestones.apd',
      'capd': 'lifeGoals.explanations.milestones.capd',
      'conservative': 'lifeGoals.explanations.milestones.conservative',
    },
  },
  {
    goalId: 'intimacy',
    scores: {
      'transplant-living': 4,
      'transplant-deceased': 4,
      'home-hd': 3,
      'unit-hd': 3,
      'apd': 3,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.intimacy.transplant',
      'transplant-deceased': 'lifeGoals.explanations.intimacy.transplant',
      'home-hd': 'lifeGoals.explanations.intimacy.homeHd',
      'unit-hd': 'lifeGoals.explanations.intimacy.unitHd',
      'apd': 'lifeGoals.explanations.intimacy.apd',
      'capd': 'lifeGoals.explanations.intimacy.capd',
      'conservative': 'lifeGoals.explanations.intimacy.conservative',
    },
  },

  // Travel & Holidays goals
  {
    goalId: 'travel-freedom',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 2,
      'unit-hd': 1,
      'apd': 3,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.travelFreedom.transplant',
      'transplant-deceased': 'lifeGoals.explanations.travelFreedom.transplant',
      'home-hd': 'lifeGoals.explanations.travelFreedom.homeHd',
      'unit-hd': 'lifeGoals.explanations.travelFreedom.unitHd',
      'apd': 'lifeGoals.explanations.travelFreedom.apd',
      'capd': 'lifeGoals.explanations.travelFreedom.capd',
      'conservative': 'lifeGoals.explanations.travelFreedom.conservative',
    },
  },
  {
    goalId: 'holiday-planning',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 2,
      'unit-hd': 2,
      'apd': 3,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.holidayPlanning.transplant',
      'transplant-deceased': 'lifeGoals.explanations.holidayPlanning.transplant',
      'home-hd': 'lifeGoals.explanations.holidayPlanning.homeHd',
      'unit-hd': 'lifeGoals.explanations.holidayPlanning.unitHd',
      'apd': 'lifeGoals.explanations.holidayPlanning.apd',
      'capd': 'lifeGoals.explanations.holidayPlanning.capd',
      'conservative': 'lifeGoals.explanations.holidayPlanning.conservative',
    },
  },
  {
    goalId: 'spontaneous-trips',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 2,
      'unit-hd': 1,
      'apd': 2,
      'capd': 2,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.spontaneousTrips.transplant',
      'transplant-deceased': 'lifeGoals.explanations.spontaneousTrips.transplant',
      'home-hd': 'lifeGoals.explanations.spontaneousTrips.homeHd',
      'unit-hd': 'lifeGoals.explanations.spontaneousTrips.unitHd',
      'apd': 'lifeGoals.explanations.spontaneousTrips.apd',
      'capd': 'lifeGoals.explanations.spontaneousTrips.capd',
      'conservative': 'lifeGoals.explanations.spontaneousTrips.conservative',
    },
  },

  // Hobbies & Activities goals
  {
    goalId: 'sports',
    scores: {
      'transplant-living': 4,
      'transplant-deceased': 4,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 3,
      'capd': 2,
      'conservative': 2,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.sports.transplant',
      'transplant-deceased': 'lifeGoals.explanations.sports.transplant',
      'home-hd': 'lifeGoals.explanations.sports.homeHd',
      'unit-hd': 'lifeGoals.explanations.sports.unitHd',
      'apd': 'lifeGoals.explanations.sports.apd',
      'capd': 'lifeGoals.explanations.sports.capd',
      'conservative': 'lifeGoals.explanations.sports.conservative',
    },
  },
  {
    goalId: 'creative-activities',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 4,
      'unit-hd': 3,
      'apd': 4,
      'capd': 4,
      'conservative': 4,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.creativeActivities.transplant',
      'transplant-deceased': 'lifeGoals.explanations.creativeActivities.transplant',
      'home-hd': 'lifeGoals.explanations.creativeActivities.homeHd',
      'unit-hd': 'lifeGoals.explanations.creativeActivities.unitHd',
      'apd': 'lifeGoals.explanations.creativeActivities.apd',
      'capd': 'lifeGoals.explanations.creativeActivities.capd',
      'conservative': 'lifeGoals.explanations.creativeActivities.conservative',
    },
  },
  {
    goalId: 'social-activities',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.socialActivities.transplant',
      'transplant-deceased': 'lifeGoals.explanations.socialActivities.transplant',
      'home-hd': 'lifeGoals.explanations.socialActivities.homeHd',
      'unit-hd': 'lifeGoals.explanations.socialActivities.unitHd',
      'apd': 'lifeGoals.explanations.socialActivities.apd',
      'capd': 'lifeGoals.explanations.socialActivities.capd',
      'conservative': 'lifeGoals.explanations.socialActivities.conservative',
    },
  },
  {
    goalId: 'gardening-outdoors',
    scores: {
      'transplant-living': 4,
      'transplant-deceased': 4,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.gardeningOutdoors.transplant',
      'transplant-deceased': 'lifeGoals.explanations.gardeningOutdoors.transplant',
      'home-hd': 'lifeGoals.explanations.gardeningOutdoors.homeHd',
      'unit-hd': 'lifeGoals.explanations.gardeningOutdoors.unitHd',
      'apd': 'lifeGoals.explanations.gardeningOutdoors.apd',
      'capd': 'lifeGoals.explanations.gardeningOutdoors.capd',
      'conservative': 'lifeGoals.explanations.gardeningOutdoors.conservative',
    },
  },

  // Independence goals
  {
    goalId: 'self-care',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 4,
      'unit-hd': 3,
      'apd': 4,
      'capd': 4,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.selfCare.transplant',
      'transplant-deceased': 'lifeGoals.explanations.selfCare.transplant',
      'home-hd': 'lifeGoals.explanations.selfCare.homeHd',
      'unit-hd': 'lifeGoals.explanations.selfCare.unitHd',
      'apd': 'lifeGoals.explanations.selfCare.apd',
      'capd': 'lifeGoals.explanations.selfCare.capd',
      'conservative': 'lifeGoals.explanations.selfCare.conservative',
    },
  },
  {
    goalId: 'driving',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 4,
      'unit-hd': 3,
      'apd': 4,
      'capd': 4,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.driving.transplant',
      'transplant-deceased': 'lifeGoals.explanations.driving.transplant',
      'home-hd': 'lifeGoals.explanations.driving.homeHd',
      'unit-hd': 'lifeGoals.explanations.driving.unitHd',
      'apd': 'lifeGoals.explanations.driving.apd',
      'capd': 'lifeGoals.explanations.driving.capd',
      'conservative': 'lifeGoals.explanations.driving.conservative',
    },
  },
  {
    goalId: 'living-alone',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 3,
      'unit-hd': 4,
      'apd': 4,
      'capd': 4,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.livingAlone.transplant',
      'transplant-deceased': 'lifeGoals.explanations.livingAlone.transplant',
      'home-hd': 'lifeGoals.explanations.livingAlone.homeHd',
      'unit-hd': 'lifeGoals.explanations.livingAlone.unitHd',
      'apd': 'lifeGoals.explanations.livingAlone.apd',
      'capd': 'lifeGoals.explanations.livingAlone.capd',
      'conservative': 'lifeGoals.explanations.livingAlone.conservative',
    },
  },
  {
    goalId: 'managing-home',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.managingHome.transplant',
      'transplant-deceased': 'lifeGoals.explanations.managingHome.transplant',
      'home-hd': 'lifeGoals.explanations.managingHome.homeHd',
      'unit-hd': 'lifeGoals.explanations.managingHome.unitHd',
      'apd': 'lifeGoals.explanations.managingHome.apd',
      'capd': 'lifeGoals.explanations.managingHome.capd',
      'conservative': 'lifeGoals.explanations.managingHome.conservative',
    },
  },

  // Religious & Cultural goals
  {
    goalId: 'dietary-needs',
    scores: {
      'transplant-living': 4,
      'transplant-deceased': 4,
      'home-hd': 3,
      'unit-hd': 3,
      'apd': 3,
      'capd': 3,
      'conservative': 4,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.dietaryNeeds.transplant',
      'transplant-deceased': 'lifeGoals.explanations.dietaryNeeds.transplant',
      'home-hd': 'lifeGoals.explanations.dietaryNeeds.homeHd',
      'unit-hd': 'lifeGoals.explanations.dietaryNeeds.unitHd',
      'apd': 'lifeGoals.explanations.dietaryNeeds.apd',
      'capd': 'lifeGoals.explanations.dietaryNeeds.capd',
      'conservative': 'lifeGoals.explanations.dietaryNeeds.conservative',
    },
  },
  {
    goalId: 'prayer-times',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 4,
      'unit-hd': 2,
      'apd': 5,
      'capd': 3,
      'conservative': 4,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.prayerTimes.transplant',
      'transplant-deceased': 'lifeGoals.explanations.prayerTimes.transplant',
      'home-hd': 'lifeGoals.explanations.prayerTimes.homeHd',
      'unit-hd': 'lifeGoals.explanations.prayerTimes.unitHd',
      'apd': 'lifeGoals.explanations.prayerTimes.apd',
      'capd': 'lifeGoals.explanations.prayerTimes.capd',
      'conservative': 'lifeGoals.explanations.prayerTimes.conservative',
    },
  },
  {
    goalId: 'community-participation',
    scores: {
      'transplant-living': 5,
      'transplant-deceased': 5,
      'home-hd': 3,
      'unit-hd': 2,
      'apd': 4,
      'capd': 3,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.communityParticipation.transplant',
      'transplant-deceased': 'lifeGoals.explanations.communityParticipation.transplant',
      'home-hd': 'lifeGoals.explanations.communityParticipation.homeHd',
      'unit-hd': 'lifeGoals.explanations.communityParticipation.unitHd',
      'apd': 'lifeGoals.explanations.communityParticipation.apd',
      'capd': 'lifeGoals.explanations.communityParticipation.capd',
      'conservative': 'lifeGoals.explanations.communityParticipation.conservative',
    },
  },
  {
    goalId: 'fasting',
    scores: {
      'transplant-living': 3,
      'transplant-deceased': 3,
      'home-hd': 2,
      'unit-hd': 2,
      'apd': 3,
      'capd': 2,
      'conservative': 3,
    },
    explanationKeys: {
      'transplant-living': 'lifeGoals.explanations.fasting.transplant',
      'transplant-deceased': 'lifeGoals.explanations.fasting.transplant',
      'home-hd': 'lifeGoals.explanations.fasting.homeHd',
      'unit-hd': 'lifeGoals.explanations.fasting.unitHd',
      'apd': 'lifeGoals.explanations.fasting.apd',
      'capd': 'lifeGoals.explanations.fasting.capd',
      'conservative': 'lifeGoals.explanations.fasting.conservative',
    },
  },
];

/**
 * Treatment display metadata.
 */
export const TREATMENT_DISPLAY: Record<GoalTreatmentType, { labelKey: string; shortKey: string }> = {
  'transplant-living': {
    labelKey: 'lifeGoals.treatments.transplantLiving',
    shortKey: 'lifeGoals.treatments.transplantLivingShort',
  },
  'transplant-deceased': {
    labelKey: 'lifeGoals.treatments.transplantDeceased',
    shortKey: 'lifeGoals.treatments.transplantDeceasedShort',
  },
  'home-hd': {
    labelKey: 'lifeGoals.treatments.homeHd',
    shortKey: 'lifeGoals.treatments.homeHdShort',
  },
  'unit-hd': {
    labelKey: 'lifeGoals.treatments.unitHd',
    shortKey: 'lifeGoals.treatments.unitHdShort',
  },
  'apd': {
    labelKey: 'lifeGoals.treatments.apd',
    shortKey: 'lifeGoals.treatments.apdShort',
  },
  'capd': {
    labelKey: 'lifeGoals.treatments.capd',
    shortKey: 'lifeGoals.treatments.capdShort',
  },
  'conservative': {
    labelKey: 'lifeGoals.treatments.conservative',
    shortKey: 'lifeGoals.treatments.conservativeShort',
  },
};

/**
 * Calculates the overall compatibility score for a treatment based on selected goals.
 * Returns a score from 0-100.
 */
export function calculateCompatibility(
  selectedGoalIds: string[],
  treatmentType: GoalTreatmentType
): number {
  if (selectedGoalIds.length === 0) return 0;

  const relevantScores = COMPATIBILITY_SCORES.filter(
    (cs) => selectedGoalIds.includes(cs.goalId)
  );

  if (relevantScores.length === 0) return 0;

  const totalScore = relevantScores.reduce(
    (sum, cs) => sum + cs.scores[treatmentType],
    0
  );
  const maxPossible = relevantScores.length * 5;

  return Math.round((totalScore / maxPossible) * 100);
}

/**
 * Gets the top explanations for a treatment's compatibility with selected goals.
 * Returns the goals that are most compatible (score >= 4) and least compatible (score <= 2).
 */
export function getTopExplanations(
  selectedGoalIds: string[],
  treatmentType: GoalTreatmentType
): { strengths: string[]; challenges: string[] } {
  const relevantScores = COMPATIBILITY_SCORES.filter(
    (cs) => selectedGoalIds.includes(cs.goalId)
  );

  const strengths = relevantScores
    .filter((cs) => cs.scores[treatmentType] >= 4)
    .map((cs) => cs.explanationKeys[treatmentType]);

  const challenges = relevantScores
    .filter((cs) => cs.scores[treatmentType] <= 2)
    .map((cs) => cs.explanationKeys[treatmentType]);

  return { strengths: strengths.slice(0, 3), challenges: challenges.slice(0, 2) };
}

/**
 * Discussion prompts based on selected goals.
 */
export function getDiscussionPrompts(selectedGoalIds: string[]): string[] {
  const prompts: string[] = [];
  const selectedGoals = LIFE_GOALS.filter((g) => selectedGoalIds.includes(g.id));
  const categories = new Set(selectedGoals.map((g) => g.category));

  if (categories.has('work')) {
    prompts.push('lifeGoals.discussion.work');
  }
  if (categories.has('family')) {
    prompts.push('lifeGoals.discussion.family');
  }
  if (categories.has('travel')) {
    prompts.push('lifeGoals.discussion.travel');
  }
  if (categories.has('hobbies')) {
    prompts.push('lifeGoals.discussion.hobbies');
  }
  if (categories.has('independence')) {
    prompts.push('lifeGoals.discussion.independence');
  }
  if (categories.has('religious')) {
    prompts.push('lifeGoals.discussion.religious');
  }

  prompts.push('lifeGoals.discussion.general');

  return prompts;
}
