import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TreatmentType } from '@renal-decision-aid/shared-types';
import { useSession } from '../context/SessionContext';

type RatingLevel = 'excellent' | 'good' | 'moderate' | 'challenging' | 'varies';

interface ComparisonCell {
  level: RatingLevel;
  text: string;
  subtext?: string;
}

interface ComparisonRow {
  id: string;
  criteriaKey: string;
  hintKey: string;
  values: Record<TreatmentType, ComparisonCell>;
}

interface CategoryRow {
  type: 'category';
  id: string;
  titleKey: string;
}

type TableRow = ComparisonRow | CategoryRow;

const TREATMENT_HEADERS: { id: TreatmentType; nameKey: string; typeKey: string }[] = [
  { id: 'kidney-transplant', nameKey: 'compare.treatments.transplant.name', typeKey: 'compare.treatments.transplant.type' },
  { id: 'hemodialysis', nameKey: 'compare.treatments.hemodialysis.name', typeKey: 'compare.treatments.hemodialysis.type' },
  { id: 'peritoneal-dialysis', nameKey: 'compare.treatments.peritoneal.name', typeKey: 'compare.treatments.peritoneal.type' },
  { id: 'conservative-care', nameKey: 'compare.treatments.conservative.name', typeKey: 'compare.treatments.conservative.type' },
];

const COMPARISON_DATA: TableRow[] = [
  // Daily Life Impact Category
  { type: 'category', id: 'daily-life', titleKey: 'compare.categories.dailyLife' },
  {
    id: 'time-commitment',
    criteriaKey: 'compare.criteria.timeCommitment',
    hintKey: 'compare.criteria.timeCommitmentHint',
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
    values: {
      'kidney-transplant': { level: 'excellent', text: 'compare.values.oftenExcellent', subtext: 'compare.values.energyRestored' },
      'hemodialysis': { level: 'moderate', text: 'compare.values.variable', subtext: 'compare.values.fatigueAfterSessions' },
      'peritoneal-dialysis': { level: 'good', text: 'compare.values.generallyGood', subtext: 'compare.values.steadyEnergyLevels' },
      'conservative-care': { level: 'varies', text: 'compare.values.varies', subtext: 'compare.values.managedWithSupport' },
    },
  },
];

const LEGEND_ITEMS: { level: RatingLevel; labelKey: string }[] = [
  { level: 'excellent', labelKey: 'compare.legend.excellentDesc' },
  { level: 'good', labelKey: 'compare.legend.goodDesc' },
  { level: 'moderate', labelKey: 'compare.legend.moderateDesc' },
  { level: 'challenging', labelKey: 'compare.legend.challengingDesc' },
  { level: 'varies', labelKey: 'compare.legend.variesDesc' },
];

function RatingIcon({ level }: { level: RatingLevel }) {
  const iconClasses: Record<RatingLevel, string> = {
    excellent: 'bg-[#E6F4EA] text-nhs-green',
    good: 'bg-[#d4edda] text-nhs-green',
    moderate: 'bg-[#FFF7E6] text-[#856404]',
    challenging: 'bg-[#FDEBE9] text-nhs-red',
    varies: 'bg-nhs-pale-grey text-nhs-dark-grey',
  };

  const icons: Record<RatingLevel, React.ReactNode> = {
    excellent: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    good: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
      </svg>
    ),
    moderate: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
    challenging: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
      </svg>
    ),
    varies: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
      </svg>
    ),
  };

  return (
    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${iconClasses[level]}`}>
      {icons[level]}
    </span>
  );
}

export default function ComparePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();

  const [selectedTreatments, setSelectedTreatments] = useState<Set<TreatmentType>>(
    new Set(['kidney-transplant', 'hemodialysis', 'peritoneal-dialysis', 'conservative-care'])
  );
  const [highlightValues, setHighlightValues] = useState(false);

  const toggleTreatment = (treatment: TreatmentType) => {
    setSelectedTreatments((prev) => {
      const next = new Set(prev);
      if (next.has(treatment)) {
        // Don't allow deselecting if only one remains
        if (next.size > 1) {
          next.delete(treatment);
        }
      } else {
        next.add(treatment);
      }
      return next;
    });
  };

  const visibleTreatments = TREATMENT_HEADERS.filter((t) => selectedTreatments.has(t.id));

  // Determine recommended treatment based on user values (simplified logic)
  const getRecommendedTreatment = (): TreatmentType | null => {
    if (!session?.valueRatings || session.valueRatings.length === 0) return null;
    // Simple recommendation logic - could be more sophisticated
    const travelRating = session.valueRatings.find(r => r.statementId === 'travel')?.rating || 0;
    const independenceRating = session.valueRatings.find(r => r.statementId === 'independence')?.rating || 0;
    if (travelRating >= 4 && independenceRating >= 4) return 'kidney-transplant';
    if (independenceRating >= 4) return 'peritoneal-dialysis';
    return null;
  };

  const recommendedTreatment = highlightValues ? getRecommendedTreatment() : null;

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
                  <span className="text-xs sm:text-sm">{t(treatment.nameKey)}</span>
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
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                      <span className="text-sm sm:text-base">{t('compare.criteria', 'Criteria')}</span>
                    </div>
                  </th>
                  {visibleTreatments.map((treatment, index) => (
                    <th
                      key={treatment.id}
                      scope="col"
                      className={`text-white font-bold text-center p-3 sm:p-5 min-w-[130px] sm:min-w-[180px] ${
                        index % 2 === 0 ? 'bg-nhs-blue' : 'bg-nhs-blue/90'
                      }`}
                    >
                      <span className="block text-sm sm:text-lg mb-1">{t(treatment.nameKey)}</span>
                      <span className="block text-[10px] sm:text-xs font-normal opacity-80">{t(treatment.typeKey)}</span>
                      {recommendedTreatment === treatment.id && (
                        <span className="inline-flex items-center gap-1 mt-2 sm:mt-3 px-2 sm:px-3 py-1 bg-nhs-green text-white text-[10px] sm:text-xs font-semibold rounded-full shadow-md">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                          {t('compare.recommended', 'Recommended')}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row) => {
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
                  return (
                    <tr
                      key={dataRow.id}
                      className="border-b border-nhs-pale-grey hover:bg-nhs-blue/5 transition-all duration-200 group"
                    >
                      <th
                        scope="row"
                        className="bg-white group-hover:bg-nhs-blue/5 p-3 sm:p-5 sticky left-0 z-[5] text-left font-semibold border-r border-nhs-pale-grey transition-colors"
                      >
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          <span className="text-text-primary font-semibold text-xs sm:text-sm">{t(dataRow.criteriaKey)}</span>
                          <span className="text-[10px] sm:text-xs font-normal text-text-muted hidden sm:block">{t(dataRow.hintKey)}</span>
                        </div>
                      </th>
                      {visibleTreatments.map((treatment, index) => {
                        const cell = dataRow.values[treatment.id];
                        return (
                          <td
                            key={treatment.id}
                            className={`p-2 sm:p-5 text-center align-middle ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            } group-hover:bg-nhs-blue/5 transition-colors`}
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
