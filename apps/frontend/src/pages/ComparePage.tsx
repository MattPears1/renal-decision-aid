/**
 * @fileoverview Treatment comparison page for the NHS Renal Decision Aid.
 * Provides a side-by-side comparison of kidney treatment options with
 * filtering, highlighting based on user values, and detailed criteria ratings.
 *
 * @module pages/ComparePage
 * @version 2.6.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 *
 * @requires react
 * @requires react-router-dom
 * @requires react-i18next
 * @requires @renal-decision-aid/shared-types
 * @requires @/context/SessionContext
 */

import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TreatmentType } from '@renal-decision-aid/shared-types';
import { useSession } from '../context/SessionContext';

/**
 * Rating level indicating how well a treatment performs for a given criterion.
 */
type RatingLevel = 'excellent' | 'good' | 'moderate' | 'challenging' | 'varies';

/**
 * Value categories that map to treatment criteria
 */
type ValueCategory = 'independence' | 'flexibility' | 'time' | 'comfort' | 'longevity' | 'quality';

/**
 * Data for a single cell in the comparison table.
 */
interface ComparisonCell {
  level: RatingLevel;
  text: string;
  subtext?: string;
}

/**
 * A row of comparison data for a specific criterion.
 */
interface ComparisonRow {
  id: string;
  criteriaKey: string;
  hintKey: string;
  tooltipKey: string;
  relatedValues: ValueCategory[];
  values: Record<TreatmentType, ComparisonCell>;
}

/**
 * A category header row in the comparison table.
 */
interface CategoryRow {
  type: 'category';
  id: string;
  titleKey: string;
}

type TableRow = ComparisonRow | CategoryRow;

/**
 * Treatment header configuration for table columns.
 */
const TREATMENT_HEADERS: { id: TreatmentType; nameKey: string; typeKey: string; iconColor: string }[] = [
  { id: 'kidney-transplant', nameKey: 'compare.treatments.transplant.name', typeKey: 'compare.treatments.transplant.type', iconColor: 'bg-nhs-green' },
  { id: 'hemodialysis', nameKey: 'compare.treatments.hemodialysis.name', typeKey: 'compare.treatments.hemodialysis.type', iconColor: 'bg-nhs-blue' },
  { id: 'peritoneal-dialysis', nameKey: 'compare.treatments.peritoneal.name', typeKey: 'compare.treatments.peritoneal.type', iconColor: 'bg-nhs-aqua-green' },
  { id: 'conservative-care', nameKey: 'compare.treatments.conservative.name', typeKey: 'compare.treatments.conservative.type', iconColor: 'bg-nhs-warm-yellow' },
];

/**
 * Value filter options for the quick filter.
 */
const VALUE_FILTERS: { id: ValueCategory; labelKey: string; icon: string }[] = [
  { id: 'independence', labelKey: 'compare.filters.independence', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'flexibility', labelKey: 'compare.filters.flexibility', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'time', labelKey: 'compare.filters.time', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'comfort', labelKey: 'compare.filters.comfort', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'longevity', labelKey: 'compare.filters.longevity', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'quality', labelKey: 'compare.filters.quality', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
];

/**
 * Complete comparison data including categories and criteria rows.
 */
const COMPARISON_DATA: TableRow[] = [
  // Daily Life Impact Category
  { type: 'category', id: 'daily-life', titleKey: 'compare.categories.dailyLife' },
  {
    id: 'time-commitment',
    criteriaKey: 'compare.criteria.timeCommitment',
    hintKey: 'compare.criteria.timeCommitmentHint',
    tooltipKey: 'compare.tooltips.timeCommitment',
    relatedValues: ['time', 'flexibility'],
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.minimalAfterRecovery', subtext: 'compare.values.regularCheckupsOnly' },
      'hemodialysis': { level: 'challenging', text: 'compare.values.12to15HrsWeekly', subtext: 'compare.values.plusTravelTime' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.dailyExchanges', subtext: 'compare.values.canBeDoneOvernight' },
      'conservative-care': { level: 'excellent', text: 'compare.values.minimal', subtext: 'compare.values.clinicVisitsAsNeeded' },
    },
  },
  {
    id: 'location',
    criteriaKey: 'compare.criteria.location',
    hintKey: 'compare.criteria.locationHint',
    tooltipKey: 'compare.tooltips.location',
    relatedValues: ['independence', 'comfort'],
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.noRestrictions', subtext: 'compare.values.afterRecovery' },
      'hemodialysis': { level: 'challenging', text: 'compare.values.hospitalClinic', subtext: 'compare.values.dialysisUnit' },
      'peritoneal-dialysis': { level: 'excellent', text: 'compare.values.home', subtext: 'compare.values.anyCleanSpace' },
      'conservative-care': { level: 'excellent', text: 'compare.values.home', subtext: 'compare.values.noEquipmentNeeded' },
    },
  },
  {
    id: 'travel',
    criteriaKey: 'compare.criteria.travel',
    hintKey: 'compare.criteria.travelHint',
    tooltipKey: 'compare.tooltips.travel',
    relatedValues: ['flexibility', 'independence'],
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.veryFlexible', subtext: 'compare.values.takeMedicationsOnly' },
      'hemodialysis': { level: 'challenging', text: 'compare.values.difficult', subtext: 'compare.values.mustArrangeHolidayDialysis' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.goodFlexibility', subtext: 'compare.values.suppliesCanBeSentAhead' },
      'conservative-care': { level: 'good', text: 'compare.values.goodFlexibility', subtext: 'compare.values.noEquipmentNeeded' },
    },
  },
  {
    id: 'diet',
    criteriaKey: 'compare.criteria.diet',
    hintKey: 'compare.criteria.dietHint',
    tooltipKey: 'compare.tooltips.diet',
    relatedValues: ['quality', 'comfort'],
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.fewRestrictions', subtext: 'compare.values.nearNormalDiet' },
      'hemodialysis': { level: 'moderate', text: 'compare.values.moderateRestrictions', subtext: 'compare.values.fluidAndPotassiumLimits' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.lessStrict', subtext: 'compare.values.moreFlexibility' },
      'conservative-care': { level: 'good', text: 'compare.values.managedDiet', subtext: 'compare.values.tailoredToSymptoms' },
    },
  },

  // Practical Considerations Category
  { type: 'category', id: 'practical', titleKey: 'compare.categories.practical' },
  {
    id: 'surgery',
    criteriaKey: 'compare.criteria.surgery',
    hintKey: 'compare.criteria.surgeryHint',
    tooltipKey: 'compare.tooltips.surgery',
    relatedValues: ['comfort'],
    values: {
      'kidney-transplant': { level: 'moderate', text: 'compare.values.majorSurgery', subtext: 'compare.values.transplantOperationRequired' },
      'hemodialysis': { level: 'moderate', text: 'compare.values.minorSurgery', subtext: 'compare.values.fistulaOrGraftCreation' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.minorProcedure', subtext: 'compare.values.pdCatheterInsertion' },
      'conservative-care': { level: 'excellent', text: 'compare.values.noneRequired', subtext: 'compare.values.noSurgicalProcedures' },
    },
  },
  {
    id: 'support-needed',
    criteriaKey: 'compare.criteria.supportNeeded',
    hintKey: 'compare.criteria.supportNeededHint',
    tooltipKey: 'compare.tooltips.supportNeeded',
    relatedValues: ['independence'],
    values: {
      'kidney-transplant': { level: 'moderate', text: 'compare.values.initialSupport', subtext: 'compare.values.duringRecoveryPeriod' },
      'hemodialysis': { level: 'excellent', text: 'compare.values.noneNeeded', subtext: 'compare.values.professionalStaffProvideCare' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.minimal', subtext: 'compare.values.canDoIndependently' },
      'conservative-care': { level: 'varies', text: 'compare.values.varies', subtext: 'compare.values.dependsOnSymptoms' },
    },
  },
  {
    id: 'flexibility',
    criteriaKey: 'compare.criteria.scheduleFlexibility',
    hintKey: 'compare.criteria.scheduleFlexibilityHint',
    tooltipKey: 'compare.tooltips.scheduleFlexibility',
    relatedValues: ['flexibility', 'independence'],
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.high', subtext: 'compare.values.normalDailyLifePossible' },
      'hemodialysis': { level: 'challenging', text: 'compare.values.low', subtext: 'compare.values.fixedHospitalSlots' },
      'peritoneal-dialysis': { level: 'excellent', text: 'compare.values.high', subtext: 'compare.values.chooseYourSchedule' },
      'conservative-care': { level: 'excellent', text: 'compare.values.high', subtext: 'compare.values.noFixedSchedule' },
    },
  },
  {
    id: 'training',
    criteriaKey: 'compare.criteria.trainingRequired',
    hintKey: 'compare.criteria.trainingRequiredHint',
    tooltipKey: 'compare.tooltips.trainingRequired',
    relatedValues: ['independence'],
    values: {
      'kidney-transplant': { level: 'good', text: 'compare.values.medicationTraining', subtext: 'compare.values.learningYourNewRoutine' },
      'hemodialysis': { level: 'excellent', text: 'compare.values.noneRequired', subtext: 'compare.values.staffDoEverything' },
      'peritoneal-dialysis': { level: 'moderate', text: 'compare.values.oneToTwoWeeksTraining', subtext: 'compare.values.learnTheTechnique' },
      'conservative-care': { level: 'good', text: 'compare.values.symptomManagement', subtext: 'compare.values.medicationGuidance' },
    },
  },

  // Health Outcomes Category
  { type: 'category', id: 'health', titleKey: 'compare.categories.health' },
  {
    id: 'survival',
    criteriaKey: 'compare.criteria.survivalRates',
    hintKey: 'compare.criteria.survivalRatesHint',
    tooltipKey: 'compare.tooltips.survivalRates',
    relatedValues: ['longevity'],
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.bestOutcomes', subtext: 'compare.values.forSuitableCandidates' },
      'hemodialysis': { level: 'good', text: 'compare.values.good', subtext: 'compare.values.wellEstablishedTreatment' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.good', subtext: 'compare.values.similarToHaemodialysis' },
      'conservative-care': { level: 'varies', text: 'compare.values.qualityFocused', subtext: 'compare.values.comfortOverLongevity' },
    },
  },
  {
    id: 'quality-of-life',
    criteriaKey: 'compare.criteria.qualityOfLife',
    hintKey: 'compare.criteria.qualityOfLifeHint',
    tooltipKey: 'compare.tooltips.qualityOfLife',
    relatedValues: ['quality', 'comfort'],
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.excellent', subtext: 'compare.values.nearNormalLifePossible' },
      'hemodialysis': { level: 'moderate', text: 'compare.values.moderate', subtext: 'compare.values.treatmentAffectsDailyRoutine' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.good', subtext: 'compare.values.moreIndependence' },
      'conservative-care': { level: 'good', text: 'compare.values.focusOnComfort', subtext: 'compare.values.symptomManagementPriority' },
    },
  },
  {
    id: 'energy-levels',
    criteriaKey: 'compare.criteria.energyLevels',
    hintKey: 'compare.criteria.energyLevelsHint',
    tooltipKey: 'compare.tooltips.energyLevels',
    relatedValues: ['quality'],
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.oftenExcellent', subtext: 'compare.values.energyRestored' },
      'hemodialysis': { level: 'moderate', text: 'compare.values.variable', subtext: 'compare.values.fatigueAfterSessions' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.generallyGood', subtext: 'compare.values.steadyEnergyLevels' },
      'conservative-care': { level: 'varies', text: 'compare.values.varies', subtext: 'compare.values.managedWithSupport' },
    },
  },
];

/**
 * Legend items configuration for rating level explanations.
 */
const LEGEND_ITEMS: { level: RatingLevel; labelKey: string }[] = [
  { level: 'excellent', labelKey: 'compare.legend.excellentDesc' },
  { level: 'good', labelKey: 'compare.legend.goodDesc' },
  { level: 'moderate', labelKey: 'compare.legend.moderateDesc' },
  { level: 'challenging', labelKey: 'compare.legend.challengingDesc' },
  { level: 'varies', labelKey: 'compare.legend.variesDesc' },
];

/**
 * Enhanced rating icon component with better visual design.
 */
function RatingIcon({ level, size = 'normal' }: { level: RatingLevel; size?: 'normal' | 'large' }) {
  const sizeClasses = size === 'large' ? 'w-10 h-10' : 'w-7 h-7';
  const iconSize = size === 'large' ? 'w-6 h-6' : 'w-[18px] h-[18px]';

  const config: Record<RatingLevel, { bg: string; icon: string; iconEl: React.ReactNode }> = {
    excellent: {
      bg: 'bg-gradient-to-br from-nhs-green/20 to-nhs-green/10 ring-2 ring-nhs-green/30',
      icon: 'text-nhs-green',
      iconEl: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
    good: {
      bg: 'bg-gradient-to-br from-[#d4edda] to-[#c3e6cb] ring-2 ring-nhs-green/20',
      icon: 'text-nhs-green',
      iconEl: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
        </svg>
      ),
    },
    moderate: {
      bg: 'bg-gradient-to-br from-[#FFF7E6] to-[#fff3cd] ring-2 ring-nhs-warm-yellow/30',
      icon: 'text-[#856404]',
      iconEl: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
    },
    challenging: {
      bg: 'bg-gradient-to-br from-[#FDEBE9] to-[#f8d7da] ring-2 ring-nhs-red/20',
      icon: 'text-nhs-red',
      iconEl: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
        </svg>
      ),
    },
    varies: {
      bg: 'bg-gradient-to-br from-nhs-pale-grey to-gray-200 ring-2 ring-nhs-mid-grey/20',
      icon: 'text-nhs-dark-grey',
      iconEl: (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
        </svg>
      ),
    },
  };

  const c = config[level];

  return (
    <span className={`${sizeClasses} rounded-full flex items-center justify-center ${c.bg} ${c.icon} shadow-sm`}>
      {c.iconEl}
    </span>
  );
}

/**
 * Tooltip component for criteria explanations.
 */
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-nhs-dark-grey rounded-lg shadow-lg max-w-[200px] text-center whitespace-normal animate-fade-in"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-nhs-dark-grey" />
        </span>
      )}
    </span>
  );
}

/**
 * Best fit badge component.
 */
function BestFitBadge({ matchScore }: { matchScore: number }) {
  if (matchScore < 70) return null;

  return (
    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white text-[10px] sm:text-xs font-semibold rounded-full shadow-md animate-pulse-subtle">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
      {matchScore >= 90 ? 'Best Match' : 'Good Match'}
    </span>
  );
}

/**
 * Treatment comparison page component.
 */
export default function ComparePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();

  const [selectedTreatments, setSelectedTreatments] = useState<Set<TreatmentType>>(
    new Set(['kidney-transplant', 'hemodialysis', 'peritoneal-dialysis', 'conservative-care'])
  );
  const [highlightValues, setHighlightValues] = useState(true);
  const [selectedValueFilters, setSelectedValueFilters] = useState<Set<ValueCategory>>(new Set());
  const [expandedTooltip, setExpandedTooltip] = useState<string | null>(null);

  /**
   * Get user's value priorities from session.
   */
  const userValues = useMemo(() => {
    if (!session?.valueRatings || session.valueRatings.length === 0) return {};

    const valueMap: Record<string, number> = {};
    session.valueRatings.forEach(r => {
      valueMap[r.statementId] = r.rating;
    });
    return valueMap;
  }, [session?.valueRatings]);

  /**
   * Calculate match scores for each treatment based on user values.
   */
  const treatmentMatchScores = useMemo(() => {
    const scores: Record<TreatmentType, number> = {
      'kidney-transplant': 0,
      'hemodialysis': 0,
      'peritoneal-dialysis': 0,
      'conservative-care': 0,
    };

    if (Object.keys(userValues).length === 0) return scores;

    // Map value statement IDs to categories
    const valueToCategory: Record<string, ValueCategory[]> = {
      'travel': ['flexibility'],
      'hospitalTime': ['time', 'comfort'],
      'needles': ['comfort'],
      'independence': ['independence'],
      'familyBurden': ['independence'],
      'longevity': ['longevity'],
      'qualityOfLife': ['quality'],
      'homeTreatment': ['comfort', 'independence'],
      'workActivities': ['flexibility', 'time'],
      'professionalCare': ['comfort'],
    };

    // Calculate scores based on how well each treatment matches high-priority values
    const dataRows = COMPARISON_DATA.filter((row): row is ComparisonRow => !('type' in row));

    TREATMENT_HEADERS.forEach(treatment => {
      let totalScore = 0;
      let maxScore = 0;

      Object.entries(userValues).forEach(([statementId, rating]) => {
        const categories = valueToCategory[statementId] || [];

        // Find rows that match these categories
        dataRows.forEach(row => {
          const hasMatchingCategory = row.relatedValues.some(v => categories.includes(v));
          if (hasMatchingCategory) {
            const cell = row.values[treatment.id];
            const levelScore = { excellent: 5, good: 4, moderate: 3, varies: 3, challenging: 1 }[cell.level];
            totalScore += levelScore * rating;
            maxScore += 5 * rating;
          }
        });
      });

      scores[treatment.id] = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    });

    return scores;
  }, [userValues]);

  /**
   * Get the recommended treatment based on match scores.
   */
  const recommendedTreatment = useMemo(() => {
    if (!highlightValues || Object.keys(userValues).length === 0) return null;

    let best: TreatmentType | null = null;
    let bestScore = 0;

    Object.entries(treatmentMatchScores).forEach(([treatment, score]) => {
      if (score > bestScore && score >= 70) {
        best = treatment as TreatmentType;
        bestScore = score;
      }
    });

    return best;
  }, [highlightValues, userValues, treatmentMatchScores]);

  /**
   * Toggle a value filter.
   */
  const toggleValueFilter = useCallback((value: ValueCategory) => {
    setSelectedValueFilters(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  /**
   * Toggles a treatment's visibility in the comparison table.
   */
  const toggleTreatment = (treatment: TreatmentType) => {
    setSelectedTreatments((prev) => {
      const next = new Set(prev);
      if (next.has(treatment)) {
        if (next.size > 1) {
          next.delete(treatment);
        }
      } else {
        next.add(treatment);
      }
      return next;
    });
  };

  /** Filtered list of treatments to display based on user selection. */
  const visibleTreatments = TREATMENT_HEADERS.filter((t) => selectedTreatments.has(t.id));

  /**
   * Filter comparison rows based on selected value filters.
   */
  const filteredComparisonData = useMemo(() => {
    if (selectedValueFilters.size === 0) return COMPARISON_DATA;

    return COMPARISON_DATA.filter(row => {
      if ('type' in row) return true; // Keep category headers
      return row.relatedValues.some(v => selectedValueFilters.has(v));
    });
  }, [selectedValueFilters]);

  /**
   * Check if a row should be highlighted based on user values.
   */
  const isRowHighlighted = useCallback((row: ComparisonRow) => {
    if (!highlightValues || Object.keys(userValues).length === 0) return false;

    // Map value IDs to categories
    const valueToCategory: Record<string, ValueCategory[]> = {
      'travel': ['flexibility'],
      'hospitalTime': ['time', 'comfort'],
      'needles': ['comfort'],
      'independence': ['independence'],
      'familyBurden': ['independence'],
      'longevity': ['longevity'],
      'qualityOfLife': ['quality'],
      'homeTreatment': ['comfort', 'independence'],
      'workActivities': ['flexibility', 'time'],
      'professionalCare': ['comfort'],
    };

    // Check if any high-priority value (4 or 5) relates to this row
    for (const [statementId, rating] of Object.entries(userValues)) {
      if (rating >= 4) {
        const categories = valueToCategory[statementId] || [];
        if (row.relatedValues.some(v => categories.includes(v))) {
          return true;
        }
      }
    }
    return false;
  }, [highlightValues, userValues]);

  /**
   * Get top priorities from user values.
   */
  const topPriorities = useMemo(() => {
    if (!session?.valueRatings) return [];
    return session.valueRatings
      .filter(r => r.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [session?.valueRatings]);

  const hasCompletedValues = topPriorities.length > 0;

  return (
    <main className="min-h-screen bg-bg-page" id="main-content">
      {/* Breadcrumb */}
      <nav className="bg-bg-page border-b border-nhs-pale-grey" aria-label={t('accessibility.breadcrumb')}>
        <div className="max-w-container-2xl mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/" className="text-nhs-blue hover:underline">
                {t('nav.home', 'Home')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li>
              <Link to="/hub" className="text-nhs-blue hover:underline">
                {t('hub.title', 'Your Hub')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li className="text-text-secondary" aria-current="page">
              {t('compare.title', 'Compare Treatments')}
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-container-2xl mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('compare.title', 'Compare Your Options')}
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed mb-4">
            {t(
              'compare.description',
              'This tool helps you compare kidney treatment options side by side. You can focus on the things that matter most to you. Select the factors you want to compare below.'
            )}
          </p>

          {/* Audio Button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-nhs-blue rounded-md text-nhs-blue font-semibold text-sm hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
            aria-label={t('accessibility.listenToPage', 'Listen to this page being read aloud')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <span>{t('common.listenToPage', 'Listen to this page')}</span>
          </button>
        </header>

        {/* What Matters Most Quick Filter - NEW */}
        <section
          className="bg-gradient-to-r from-nhs-pink/5 to-nhs-blue/5 border border-nhs-pale-grey rounded-xl p-4 sm:p-6 mb-6"
          aria-labelledby="values-filter-heading"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 id="values-filter-heading" className="text-lg font-bold text-text-primary flex items-center gap-2">
              <div className="w-8 h-8 bg-nhs-pink/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-nhs-pink" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              {t('compare.whatMatters', 'What Matters Most to You?')}
            </h2>
            {hasCompletedValues && (
              <span className="text-xs text-nhs-green font-medium bg-nhs-green/10 px-3 py-1 rounded-full">
                {t('compare.valuesLoaded', 'Your values loaded')}
              </span>
            )}
          </div>

          <p className="text-sm text-text-secondary mb-4">
            {t('compare.filterByValues', 'Filter the comparison by what matters most to you. Select categories to highlight relevant criteria.')}
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label={t('compare.valueFilters', 'Value filters')}>
            {VALUE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleValueFilter(filter.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 min-h-[44px] touch-manipulation ${
                  selectedValueFilters.has(filter.id)
                    ? 'bg-nhs-pink text-white shadow-md'
                    : 'bg-white border border-nhs-pale-grey text-text-secondary hover:border-nhs-pink hover:text-nhs-pink'
                }`}
                aria-pressed={selectedValueFilters.has(filter.id)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={filter.icon} />
                </svg>
                {t(filter.labelKey)}
              </button>
            ))}
            {selectedValueFilters.size > 0 && (
              <button
                onClick={() => setSelectedValueFilters(new Set())}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-text-secondary hover:text-nhs-red transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('compare.clearFilters', 'Clear')}
              </button>
            )}
          </div>

          {!hasCompletedValues && (
            <div className="mt-4 p-3 bg-nhs-warm-yellow/10 border border-nhs-warm-yellow/30 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-nhs-warm-yellow flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <p className="text-sm text-text-secondary flex-1">
                {t('compare.completeValuesPrompt', 'Complete the values exercise to see personalized recommendations.')}
              </p>
              <Link
                to="/values"
                className="text-sm font-semibold text-nhs-blue hover:underline whitespace-nowrap"
              >
                {t('compare.startValuesExercise', 'Start now')}
              </Link>
            </div>
          )}
        </section>

        {/* Filter Controls Section */}
        <section
          className="bg-white border border-nhs-pale-grey rounded-lg p-4 sm:p-6 mb-6 sm:mb-8"
          aria-labelledby="filter-heading"
        >
          <h2 id="filter-heading" className="text-base sm:text-lg font-bold mb-4">
            {t('compare.customise', 'Customise Your Comparison')}
          </h2>

          {/* Treatment Filters */}
          <div className="mb-4">
            <span className="block text-sm font-semibold text-text-secondary mb-2">
              {t('compare.showTreatments', 'Show treatments:')}
            </span>
            <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label={t('compare.showTreatments', 'Show treatments')}>
              {TREATMENT_HEADERS.map((treatment) => (
                <label
                  key={treatment.id}
                  className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-md text-sm cursor-pointer transition-colors min-h-[44px] touch-manipulation ${
                    selectedTreatments.has(treatment.id)
                      ? 'border-nhs-blue bg-[#E6F0FA]'
                      : 'border-nhs-pale-grey bg-bg-surface-secondary hover:border-nhs-blue'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTreatments.has(treatment.id)}
                    onChange={() => toggleTreatment(treatment.id)}
                    className="w-5 h-5 accent-nhs-blue"
                  />
                  <span className={`w-2 h-2 rounded-full ${treatment.iconColor}`} />
                  <span className="text-xs sm:text-sm">{t(treatment.nameKey)}</span>
                  {highlightValues && treatmentMatchScores[treatment.id] >= 70 && (
                    <span className="text-[10px] text-nhs-green font-semibold">
                      {treatmentMatchScores[treatment.id]}%
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Highlight Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#E6F0FA] border border-nhs-blue rounded-md">
            <label className="flex items-center gap-3 font-semibold cursor-pointer min-h-[44px] touch-manipulation">
              <input
                type="checkbox"
                checked={highlightValues}
                onChange={(e) => setHighlightValues(e.target.checked)}
                className="sr-only"
              />
              <span
                className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
                  highlightValues ? 'bg-nhs-green' : 'bg-nhs-mid-grey'
                }`}
                role="switch"
                aria-checked={highlightValues}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${
                    highlightValues ? 'translate-x-6' : ''
                  }`}
                />
              </span>
              <span className="text-sm sm:text-base">{t('compare.highlightForMe', 'Highlight treatments for me')}</span>
            </label>
            <span className="text-xs sm:text-sm text-text-secondary">
              {t('compare.highlightHint', 'Based on your values and priorities from the questionnaire')}
            </span>
          </div>
        </section>

        {/* Legend Section */}
        <section
          className="bg-white border border-nhs-pale-grey rounded-lg p-4 sm:p-6 mb-6 sm:mb-8"
          aria-labelledby="legend-heading"
        >
          <h2 id="legend-heading" className="text-sm sm:text-base font-bold mb-3 sm:mb-4">
            {t('compare.understandingIcons', 'Understanding the Icons')}
          </h2>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6" role="list">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.level} className="flex items-center gap-2 sm:gap-3" role="listitem">
                <RatingIcon level={item.level} />
                <span className="text-xs sm:text-sm text-text-secondary">{t(item.labelKey)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Scroll Indicator */}
        <div
          className="flex md:hidden items-center justify-center gap-2 p-3 bg-[#FFF7E6] rounded-md mb-4 text-xs sm:text-sm text-[#856404]"
          role="status"
          aria-live="polite"
        >
          <svg className="w-5 h-5 flex-shrink-0 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
          </svg>
          <span>{t('compare.scrollHint', 'Scroll horizontally to see all treatments')}</span>
        </div>

        {/* Comparison Table - Enhanced */}
        <section
          className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-lg"
          aria-labelledby="table-heading"
        >
          <h2 id="table-heading" className="sr-only">
            {t('compare.tableHeading', 'Treatment Comparison Table')}
          </h2>
          <div
            className="overflow-x-auto scroll-container"
            tabIndex={0}
            role="region"
            aria-label={t('compare.scrollableRegion', 'Scrollable comparison table')}
          >
            <table className="w-full border-collapse min-w-[700px] sm:min-w-[900px]" aria-label={t('compare.tableLabel', 'Comparison of kidney treatment options')}>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="bg-gradient-to-r from-nhs-blue-dark to-nhs-blue text-white font-bold text-left p-3 sm:p-5 sticky left-0 z-10 min-w-[140px] sm:min-w-[200px]"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                      </svg>
                      <span className="text-sm sm:text-base">{t('compare.criteriaLabel', 'Criteria')}</span>
                    </div>
                  </th>
                  {visibleTreatments.map((treatment, index) => (
                    <th
                      key={treatment.id}
                      scope="col"
                      className={`text-white font-bold text-center p-3 sm:p-5 min-w-[130px] sm:min-w-[180px] relative ${
                        index % 2 === 0 ? 'bg-nhs-blue' : 'bg-nhs-blue/90'
                      } ${recommendedTreatment === treatment.id ? 'ring-4 ring-nhs-green ring-inset' : ''}`}
                    >
                      <span className="block text-sm sm:text-lg mb-1">{t(treatment.nameKey)}</span>
                      <span className="block text-[10px] sm:text-xs font-normal opacity-80">{t(treatment.typeKey)}</span>
                      {highlightValues && treatmentMatchScores[treatment.id] > 0 && (
                        <div className="mt-2">
                          <span className="inline-block text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            {t('compare.matchScore', 'Match')}: {treatmentMatchScores[treatment.id]}%
                          </span>
                        </div>
                      )}
                      <BestFitBadge matchScore={treatmentMatchScores[treatment.id]} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredComparisonData.map((row) => {
                  if ('type' in row && row.type === 'category') {
                    return (
                      <tr key={row.id} className="bg-gradient-to-r from-nhs-pale-grey to-white">
                        <th
                          scope="row"
                          colSpan={visibleTreatments.length + 1}
                          className="font-bold text-xs sm:text-sm uppercase tracking-wider text-nhs-blue-dark p-3 sm:p-4 border-l-4 border-nhs-blue"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-nhs-blue rounded-full flex-shrink-0" />
                            {t(row.titleKey)}
                          </div>
                        </th>
                      </tr>
                    );
                  }

                  const dataRow = row as ComparisonRow;
                  const isHighlighted = isRowHighlighted(dataRow);

                  return (
                    <tr
                      key={dataRow.id}
                      className={`border-b border-nhs-pale-grey hover:bg-nhs-blue/5 transition-all duration-200 group ${
                        isHighlighted ? 'bg-nhs-pink/5' : ''
                      }`}
                    >
                      <th
                        scope="row"
                        className={`bg-white group-hover:bg-nhs-blue/5 p-3 sm:p-5 sticky left-0 z-[5] text-left font-semibold border-r border-nhs-pale-grey transition-colors ${
                          isHighlighted ? 'bg-nhs-pink/5' : ''
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-text-primary font-semibold text-xs sm:text-sm">
                              {t(dataRow.criteriaKey)}
                            </span>
                            {isHighlighted && (
                              <span className="w-2 h-2 bg-nhs-pink rounded-full animate-pulse" title={t('compare.matchesYourValues', 'Matches your values')} />
                            )}
                            <Tooltip content={t(dataRow.tooltipKey, t(dataRow.hintKey))}>
                              <button
                                type="button"
                                className="w-5 h-5 rounded-full bg-nhs-pale-grey text-nhs-dark-grey flex items-center justify-center hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
                                aria-label={t('compare.moreInfo', 'More information')}
                                onClick={() => setExpandedTooltip(expandedTooltip === dataRow.id ? null : dataRow.id)}
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
                                </svg>
                              </button>
                            </Tooltip>
                          </div>
                          <span className="text-[10px] sm:text-xs font-normal text-text-muted hidden sm:block">
                            {t(dataRow.hintKey)}
                          </span>
                          {expandedTooltip === dataRow.id && (
                            <div className="mt-2 p-2 bg-nhs-pale-grey/50 rounded text-xs text-text-secondary sm:hidden">
                              {t(dataRow.tooltipKey, t(dataRow.hintKey))}
                            </div>
                          )}
                        </div>
                      </th>
                      {visibleTreatments.map((treatment, index) => {
                        const cell = dataRow.values[treatment.id];
                        const isBestInRow = highlightValues &&
                          cell.level === 'excellent' &&
                          treatmentMatchScores[treatment.id] >= 70;

                        return (
                          <td
                            key={treatment.id}
                            className={`p-2 sm:p-5 text-center align-middle ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            } group-hover:bg-nhs-blue/5 transition-colors ${
                              isBestInRow ? 'bg-nhs-green/5' : ''
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1.5 sm:gap-3">
                              <RatingIcon level={cell.level} />
                              <div className="text-[10px] sm:text-sm text-text-primary font-medium leading-snug">
                                {t(cell.text)}
                              </div>
                              {cell.subtext && (
                                <span className="text-[9px] sm:text-xs text-text-muted hidden sm:block">
                                  {t(cell.subtext)}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Decision Summary Section - NEW */}
        {hasCompletedValues && (
          <section
            className="bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-pink/5 border border-nhs-pale-grey rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-sm"
            aria-labelledby="decision-summary-heading"
          >
            <h2 id="decision-summary-heading" className="text-xl sm:text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-nhs-blue to-nhs-blue-dark rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              {t('compare.decisionSummary', 'Your Decision Summary')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Your Top Priorities */}
              <div className="bg-white rounded-xl p-5 border border-nhs-pale-grey">
                <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-nhs-pink" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {t('compare.yourTopPriorities', 'Your Top Priorities')}
                </h3>
                <ul className="space-y-2">
                  {topPriorities.map((priority, index) => (
                    <li key={priority.statementId} className="flex items-center gap-3 p-2 bg-nhs-pink/5 rounded-lg">
                      <span className="w-6 h-6 bg-nhs-pink text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-text-primary">
                        {t(`values.statements.${priority.statementId}.text`, priority.statementId)}
                      </span>
                      <span className="ml-auto text-xs text-nhs-pink font-semibold">
                        {priority.rating}/5
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best Matching Treatments */}
              <div className="bg-white rounded-xl p-5 border border-nhs-pale-grey">
                <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-nhs-green" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  {t('compare.bestMatchingTreatments', 'Best Matching Treatments')}
                </h3>
                <div className="space-y-3">
                  {Object.entries(treatmentMatchScores)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([treatmentId, score]) => {
                      const treatment = TREATMENT_HEADERS.find(t => t.id === treatmentId);
                      if (!treatment) return null;

                      return (
                        <div key={treatmentId} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${treatment.iconColor}`} />
                          <span className="text-sm text-text-primary flex-1">
                            {t(treatment.nameKey)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-nhs-pale-grey rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  score >= 80 ? 'bg-nhs-green' : score >= 60 ? 'bg-nhs-blue' : 'bg-nhs-mid-grey'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${
                              score >= 80 ? 'text-nhs-green' : score >= 60 ? 'text-nhs-blue' : 'text-text-muted'
                            }`}>
                              {score}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Key Insight */}
            {recommendedTreatment && (
              <div className="mt-6 p-4 bg-nhs-green/10 border border-nhs-green/30 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 bg-nhs-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-nhs-green" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-text-primary mb-1">
                    {t('compare.keyInsight', 'Key Insight')}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {t('compare.insightMessage', 'Based on your values, {{treatment}} appears to be the best match for what matters most to you. However, the best choice depends on your individual health situation - discuss this with your kidney team.', {
                      treatment: t(TREATMENT_HEADERS.find(t => t.id === recommendedTreatment)?.nameKey || '')
                    })}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Guidance Section - Enhanced */}
        <section
          className="bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 border-l-4 border-nhs-blue rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex gap-3 sm:gap-5 shadow-sm"
          aria-labelledby="guidance-heading"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-nhs-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <div>
            <h2 id="guidance-heading" className="text-base sm:text-lg font-bold text-text-primary mb-1 sm:mb-2">
              {t('compare.remember', 'Remember')}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t(
                'compare.guidance',
                'No treatment is perfect for everyone. The best choice depends on your personal situation, health, and values. This comparison is a starting point for discussions with your kidney team.'
              )}
            </p>
          </div>
        </section>

        {/* Navigation Section - Enhanced */}
        <nav
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-nhs-pale-grey shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4"
          aria-label={t('accessibility.pageNavigation')}
        >
          <button
            onClick={() => navigate('/hub')}
            className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-3 text-nhs-blue font-medium hover:bg-nhs-blue/5 rounded-lg transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            <span>{t('nav.backToHub', 'Back to Your Hub')}</span>
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/values"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-sm sm:text-base">{t('values.startExercise', 'Start Values Exercise')}</span>
            </Link>
            <Link
              to="/summary"
              className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-nhs-blue to-nhs-blue-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation"
            >
              <span className="text-sm sm:text-base">{t('compare.addToSummary', 'Add to My Summary')}</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
