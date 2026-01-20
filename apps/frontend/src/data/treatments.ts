/**
 * Treatment Data Structure
 * Defines the kidney treatment options and their details
 */

import type { TreatmentType } from '@renal-decision-aid/shared-types';

export interface TreatmentInfo {
  id: TreatmentType;
  titleKey: string;
  shortDescriptionKey: string;
  descriptionKey: string;
  benefitsKeys: string[];
  considerationsKeys: string[];
  iconPath: string;
  color: string;
  learnMoreUrl?: string;
}

export const TREATMENTS: TreatmentInfo[] = [
  {
    id: 'kidney-transplant',
    titleKey: 'treatments.types.transplant.title',
    shortDescriptionKey: 'treatments.types.transplant.shortDescription',
    descriptionKey: 'treatments.types.transplant.description',
    benefitsKeys: [
      'treatments.types.transplant.benefits.0',
      'treatments.types.transplant.benefits.1',
      'treatments.types.transplant.benefits.2',
      'treatments.types.transplant.benefits.3',
    ],
    considerationsKeys: [
      'treatments.types.transplant.considerations.0',
      'treatments.types.transplant.considerations.1',
      'treatments.types.transplant.considerations.2',
      'treatments.types.transplant.considerations.3',
    ],
    iconPath: '/icons/transplant.svg',
    color: 'nhs-blue',
    learnMoreUrl: 'https://www.nhs.uk/conditions/kidney-transplant/',
  },
  {
    id: 'hemodialysis',
    titleKey: 'treatments.types.hemodialysis.title',
    shortDescriptionKey: 'treatments.types.hemodialysis.shortDescription',
    descriptionKey: 'treatments.types.hemodialysis.description',
    benefitsKeys: [
      'treatments.types.hemodialysis.benefits.0',
      'treatments.types.hemodialysis.benefits.1',
      'treatments.types.hemodialysis.benefits.2',
      'treatments.types.hemodialysis.benefits.3',
    ],
    considerationsKeys: [
      'treatments.types.hemodialysis.considerations.0',
      'treatments.types.hemodialysis.considerations.1',
      'treatments.types.hemodialysis.considerations.2',
      'treatments.types.hemodialysis.considerations.3',
    ],
    iconPath: '/icons/hemodialysis.svg',
    color: 'nhs-purple',
    learnMoreUrl: 'https://www.nhs.uk/conditions/dialysis/how-it-is-performed/',
  },
  {
    id: 'peritoneal-dialysis',
    titleKey: 'treatments.types.peritonealDialysis.title',
    shortDescriptionKey: 'treatments.types.peritonealDialysis.shortDescription',
    descriptionKey: 'treatments.types.peritonealDialysis.description',
    benefitsKeys: [
      'treatments.types.peritonealDialysis.benefits.0',
      'treatments.types.peritonealDialysis.benefits.1',
      'treatments.types.peritonealDialysis.benefits.2',
      'treatments.types.peritonealDialysis.benefits.3',
    ],
    considerationsKeys: [
      'treatments.types.peritonealDialysis.considerations.0',
      'treatments.types.peritonealDialysis.considerations.1',
      'treatments.types.peritonealDialysis.considerations.2',
      'treatments.types.peritonealDialysis.considerations.3',
    ],
    iconPath: '/icons/peritoneal.svg',
    color: 'nhs-green',
    learnMoreUrl: 'https://www.nhs.uk/conditions/dialysis/how-it-is-performed/',
  },
  {
    id: 'conservative-care',
    titleKey: 'treatments.types.conservative.title',
    shortDescriptionKey: 'treatments.types.conservative.shortDescription',
    descriptionKey: 'treatments.types.conservative.description',
    benefitsKeys: [
      'treatments.types.conservative.benefits.0',
      'treatments.types.conservative.benefits.1',
      'treatments.types.conservative.benefits.2',
      'treatments.types.conservative.benefits.3',
    ],
    considerationsKeys: [
      'treatments.types.conservative.considerations.0',
      'treatments.types.conservative.considerations.1',
      'treatments.types.conservative.considerations.2',
      'treatments.types.conservative.considerations.3',
    ],
    iconPath: '/icons/conservative.svg',
    color: 'nhs-warm-yellow',
    learnMoreUrl: 'https://www.nhs.uk/conditions/kidney-disease/',
  },
];

/**
 * Get treatment by ID
 */
export function getTreatmentById(id: TreatmentType): TreatmentInfo | undefined {
  return TREATMENTS.find((t) => t.id === id);
}

/**
 * Get all treatments
 */
export function getAllTreatments(): TreatmentInfo[] {
  return TREATMENTS;
}

/**
 * Comparison matrix data structure
 */
export interface ComparisonCategory {
  id: string;
  titleKey: string;
  items: {
    labelKey: string;
    values: Record<TreatmentType, string>;
  }[];
}

export const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    id: 'lifestyle',
    titleKey: 'comparison.categories.lifestyle',
    items: [
      {
        labelKey: 'comparison.items.scheduleFlexibility',
        values: {
          'kidney-transplant': 'comparison.values.high',
          'hemodialysis': 'comparison.values.low',
          'peritoneal-dialysis': 'comparison.values.medium',
          'conservative-care': 'comparison.values.high',
        },
      },
      {
        labelKey: 'comparison.items.travelAbility',
        values: {
          'kidney-transplant': 'comparison.values.high',
          'hemodialysis': 'comparison.values.limited',
          'peritoneal-dialysis': 'comparison.values.medium',
          'conservative-care': 'comparison.values.varies',
        },
      },
      {
        labelKey: 'comparison.items.dietRestrictions',
        values: {
          'kidney-transplant': 'comparison.values.fewer',
          'hemodialysis': 'comparison.values.more',
          'peritoneal-dialysis': 'comparison.values.moderate',
          'conservative-care': 'comparison.values.moderate',
        },
      },
    ],
  },
  {
    id: 'medical',
    titleKey: 'comparison.categories.medical',
    items: [
      {
        labelKey: 'comparison.items.hospitalVisits',
        values: {
          'kidney-transplant': 'comparison.values.periodic',
          'hemodialysis': 'comparison.values.threePerWeek',
          'peritoneal-dialysis': 'comparison.values.monthly',
          'conservative-care': 'comparison.values.asNeeded',
        },
      },
      {
        labelKey: 'comparison.items.surgeryRequired',
        values: {
          'kidney-transplant': 'comparison.values.major',
          'hemodialysis': 'comparison.values.minor',
          'peritoneal-dialysis': 'comparison.values.minor',
          'conservative-care': 'comparison.values.none',
        },
      },
      {
        labelKey: 'comparison.items.medications',
        values: {
          'kidney-transplant': 'comparison.values.lifelong',
          'hemodialysis': 'comparison.values.several',
          'peritoneal-dialysis': 'comparison.values.several',
          'conservative-care': 'comparison.values.symptomBased',
        },
      },
    ],
  },
];
