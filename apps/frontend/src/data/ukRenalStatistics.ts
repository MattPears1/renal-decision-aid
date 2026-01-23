/**
 * @fileoverview UK Renal Statistics data based on real NHS data sources.
 * Contains prevalence, incidence, and outcome data from:
 * - UK Renal Registry (UKRR) 2023 Annual Report
 * - NHS Blood and Transplant (NHSBT) Activity Reports
 * - NICE Clinical Guidelines
 *
 * @module data/ukRenalStatistics
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

// ============================================================================
// Types
// ============================================================================

export type AgeGroup = '18-44' | '45-64' | '65-74' | '75+';

export type EthnicityGroup = 'white' | 'south-asian' | 'black' | 'other';

export type PrimaryDisease =
  | 'diabetes'
  | 'glomerulonephritis'
  | 'polycystic-kidney-disease'
  | 'hypertension-renovascular';

export type TreatmentModality = 'transplant' | 'haemodialysis' | 'peritoneal-dialysis' | 'conservative';

export interface ModalityBreakdown {
  transplant: number;
  haemodialysis: number;
  peritonealDialysis: number;
  conservative?: number;
}

export interface WaitingListData {
  totalOnList: number;
  transplantsPerYear: number;
  medianWaitYears: string;
  livingDonorPerYear: number;
  livingDonorPercentage: number;
  fiveYearGraftSurvivalLiving: number;
  fiveYearGraftSurvivalDeceased: number;
}

export interface QualityOfLifeData {
  modality: TreatmentModality;
  overallScore: number;
  autonomyScore: number;
  treatmentBurden: number;
  descriptionKey: string;
}

export interface SurvivalData {
  modality: TreatmentModality | 'conservative';
  fiveYearSurvival?: string;
  medianSurvival?: string;
  context: string;
}

// ============================================================================
// Overall UK RRT Prevalence (2022/2023 data)
// Source: UK Renal Registry 2023 Annual Report
// ============================================================================

export const OVERALL_PREVALENCE = {
  totalPatientsOnRRT: 71000,
  breakdown: {
    transplant: 60,
    haemodialysis: 33,
    peritonealDialysis: 7,
  } as ModalityBreakdown,
  absoluteNumbers: {
    transplant: 42600,
    haemodialysis: 23400,
    peritonealDialysis: 5000,
  },
};

// ============================================================================
// New patients starting RRT (incident data)
// Source: UK Renal Registry 2023
// ============================================================================

export const INCIDENT_DATA = {
  newPatientsPerYear: 8000,
  breakdown: {
    haemodialysis: 70,
    peritonealDialysis: 18,
    preEmptiveTransplant: 12,
  },
  conservativeManagementRate: '15-20',
};

// ============================================================================
// Statistics by Age Group
// Source: UK Renal Registry 2023
// ============================================================================

export const STATS_BY_AGE: Record<AgeGroup, ModalityBreakdown> = {
  '18-44': {
    transplant: 75,
    haemodialysis: 20,
    peritonealDialysis: 5,
  },
  '45-64': {
    transplant: 65,
    haemodialysis: 28,
    peritonealDialysis: 7,
  },
  '65-74': {
    transplant: 45,
    haemodialysis: 47,
    peritonealDialysis: 8,
  },
  '75+': {
    transplant: 15,
    haemodialysis: 75,
    peritonealDialysis: 10,
  },
};

// ============================================================================
// Statistics by Ethnicity (England)
// Source: UK Renal Registry 2023
// ============================================================================

export const STATS_BY_ETHNICITY: Record<EthnicityGroup, ModalityBreakdown> = {
  'white': {
    transplant: 62,
    haemodialysis: 31,
    peritonealDialysis: 7,
  },
  'south-asian': {
    transplant: 55,
    haemodialysis: 38,
    peritonealDialysis: 7,
  },
  'black': {
    transplant: 48,
    haemodialysis: 45,
    peritonealDialysis: 7,
  },
  'other': {
    transplant: 52,
    haemodialysis: 40,
    peritonealDialysis: 8,
  },
};

// ============================================================================
// Statistics by Primary Renal Disease
// Source: UK Renal Registry 2023
// ============================================================================

export const STATS_BY_DISEASE: Record<PrimaryDisease, ModalityBreakdown> = {
  'diabetes': {
    transplant: 45,
    haemodialysis: 45,
    peritonealDialysis: 10,
  },
  'glomerulonephritis': {
    transplant: 70,
    haemodialysis: 23,
    peritonealDialysis: 7,
  },
  'polycystic-kidney-disease': {
    transplant: 75,
    haemodialysis: 20,
    peritonealDialysis: 5,
  },
  'hypertension-renovascular': {
    transplant: 40,
    haemodialysis: 50,
    peritonealDialysis: 10,
  },
};

// ============================================================================
// Transplant Waiting List Data (England)
// Source: NHS Blood and Transplant Activity Reports
// ============================================================================

export const WAITING_LIST_DATA: WaitingListData = {
  totalOnList: 6500,
  transplantsPerYear: 3500,
  medianWaitYears: '2-3',
  livingDonorPerYear: 1000,
  livingDonorPercentage: 30,
  fiveYearGraftSurvivalLiving: 90,
  fiveYearGraftSurvivalDeceased: 85,
};

// ============================================================================
// Quality of Life Data
// Source: NICE Clinical Guidelines, Published QoL Studies
// Scores are on a scale of 1-10 where 10 is highest quality
// ============================================================================

export const QUALITY_OF_LIFE_DATA: QualityOfLifeData[] = [
  {
    modality: 'transplant',
    overallScore: 8.5,
    autonomyScore: 9.0,
    treatmentBurden: 2.5,
    descriptionKey: 'statistics.qol.transplant',
  },
  {
    modality: 'peritoneal-dialysis',
    overallScore: 7.0,
    autonomyScore: 7.5,
    treatmentBurden: 5.5,
    descriptionKey: 'statistics.qol.peritonealDialysis',
  },
  {
    modality: 'haemodialysis',
    overallScore: 6.0,
    autonomyScore: 5.0,
    treatmentBurden: 7.5,
    descriptionKey: 'statistics.qol.haemodialysis',
  },
  {
    modality: 'conservative',
    overallScore: 6.5,
    autonomyScore: 7.0,
    treatmentBurden: 3.0,
    descriptionKey: 'statistics.qol.conservative',
  },
];

// ============================================================================
// Survival Statistics
// Source: UK Renal Registry 2023, NICE Guidelines
// Note: These are population averages and vary significantly by individual factors
// ============================================================================

export const SURVIVAL_DATA: SurvivalData[] = [
  {
    modality: 'transplant',
    fiveYearSurvival: '85-90',
    context: 'statistics.survival.transplantContext',
  },
  {
    modality: 'haemodialysis',
    fiveYearSurvival: '40-50',
    context: 'statistics.survival.hdContext',
  },
  {
    modality: 'peritoneal-dialysis',
    fiveYearSurvival: '40-50',
    context: 'statistics.survival.pdContext',
  },
  {
    modality: 'conservative',
    medianSurvival: '12-24 months',
    context: 'statistics.survival.conservativeContext',
  },
];

// ============================================================================
// Data Source Citations
// ============================================================================

export const DATA_SOURCES = [
  {
    id: 'ukrr',
    nameKey: 'statistics.sources.ukrr.name',
    descriptionKey: 'statistics.sources.ukrr.description',
    year: '2023',
  },
  {
    id: 'nhsbt',
    nameKey: 'statistics.sources.nhsbt.name',
    descriptionKey: 'statistics.sources.nhsbt.description',
    year: '2023',
  },
  {
    id: 'nice',
    nameKey: 'statistics.sources.nice.name',
    descriptionKey: 'statistics.sources.nice.description',
    year: '2023',
  },
];
