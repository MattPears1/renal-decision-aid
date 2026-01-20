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
  { type: 'category', id: 'daily-life', titleKey: 'Daily Life Impact' },
  {
    id: 'time-commitment',
    criteriaKey: 'Time commitment per week',
    hintKey: 'Hours spent on treatment',
    values: {
      'kidney-transplant': { level: 'excellent', text: 'Minimal after recovery', subtext: 'Regular checkups only' },
      'hemodialysis': { level: 'challenging', text: '12-15 hrs weekly', subtext: 'Plus travel time' },
      'peritoneal-dialysis': { level: 'good', text: 'Daily exchanges', subtext: 'Can be done overnight' },
      'conservative-care': { level: 'excellent', text: 'Minimal', subtext: 'Clinic visits as needed' },
    },
  },
  {
    id: 'location',
    criteriaKey: 'Treatment location',
    hintKey: 'Where treatment takes place',
    values: {
      'kidney-transplant': { level: 'excellent', text: 'No restrictions', subtext: 'After recovery' },
      'hemodialysis': { level: 'challenging', text: 'Hospital/clinic', subtext: 'Dialysis unit' },
      'peritoneal-dialysis': { level: 'excellent', text: 'Home', subtext: 'Any clean space' },
      'conservative-care': { level: 'excellent', text: 'Home', subtext: 'No equipment needed' },
    },
  },
  {
    id: 'travel',
    criteriaKey: 'Impact on travel',
    hintKey: 'Ability to travel and holiday',
    values: {
      'kidney-transplant': { level: 'excellent', text: 'Very flexible', subtext: 'Take medications only' },
      'hemodialysis': { level: 'challenging', text: 'Difficult', subtext: 'Must arrange holiday dialysis' },
      'peritoneal-dialysis': { level: 'good', text: 'Good flexibility', subtext: 'Supplies can be sent ahead' },
      'conservative-care': { level: 'good', text: 'Good flexibility', subtext: 'No equipment needed' },
    },
  },
  {
    id: 'diet',
    criteriaKey: 'Diet restrictions',
    hintKey: 'Limitations on food and drink',
    values: {
      'kidney-transplant': { level: 'excellent', text: 'Few restrictions', subtext: 'Near-normal diet' },
      'hemodialysis': { level: 'moderate', text: 'Moderate restrictions', subtext: 'Fluid and potassium limits' },
      'peritoneal-dialysis': { level: 'good', text: 'Less strict', subtext: 'More flexibility' },
      'conservative-care': { level: 'good', text: 'Managed diet', subtext: 'Tailored to symptoms' },
    },
  },

  // Practical Considerations Category
  { type: 'category', id: 'practical', titleKey: 'Practical Considerations' },
  {
    id: 'surgery',
    criteriaKey: 'Surgery required',
    hintKey: 'Initial procedures needed',
    values: {
      'kidney-transplant': { level: 'moderate', text: 'Major surgery', subtext: 'Transplant operation required' },
      'hemodialysis': { level: 'moderate', text: 'Minor surgery', subtext: 'Fistula or graft creation' },
      'peritoneal-dialysis': { level: 'good', text: 'Minor procedure', subtext: 'PD catheter insertion' },
      'conservative-care': { level: 'excellent', text: 'None required', subtext: 'No surgical procedures' },
    },
  },
  {
    id: 'support-needed',
    criteriaKey: 'Support needed',
    hintKey: 'Help from family or carers',
    values: {
      'kidney-transplant': { level: 'moderate', text: 'Initial support', subtext: 'During recovery period' },
      'hemodialysis': { level: 'excellent', text: 'None needed', subtext: 'Professional staff provide care' },
      'peritoneal-dialysis': { level: 'good', text: 'Minimal', subtext: 'Can do independently' },
      'conservative-care': { level: 'varies', text: 'Varies', subtext: 'Depends on symptoms' },
    },
  },
  {
    id: 'flexibility',
    criteriaKey: 'Schedule flexibility',
    hintKey: 'Control over your schedule',
    values: {
      'kidney-transplant': { level: 'excellent', text: 'High', subtext: 'Normal daily life possible' },
      'hemodialysis': { level: 'challenging', text: 'Low', subtext: 'Fixed hospital slots' },
      'peritoneal-dialysis': { level: 'excellent', text: 'High', subtext: 'Choose your schedule' },
      'conservative-care': { level: 'excellent', text: 'High', subtext: 'No fixed schedule' },
    },
  },
  {
    id: 'training',
    criteriaKey: 'Training required',
    hintKey: 'Learning time needed',
    values: {
      'kidney-transplant': { level: 'good', text: 'Medication training', subtext: 'Learning your new routine' },
      'hemodialysis': { level: 'excellent', text: 'None required', subtext: 'Staff do everything' },
      'peritoneal-dialysis': { level: 'moderate', text: '1-2 weeks training', subtext: 'Learn the technique' },
      'conservative-care': { level: 'good', text: 'Symptom management', subtext: 'Medication guidance' },
    },
  },

  // Health Outcomes Category
  { type: 'category', id: 'health', titleKey: 'Health Outcomes' },
  {
    id: 'survival',
    criteriaKey: 'Survival rates',
    hintKey: 'General outcomes (varies by person)',
    values: {
      'kidney-transplant': { level: 'excellent', text: 'Best outcomes', subtext: 'For suitable candidates' },
      'hemodialysis': { level: 'good', text: 'Good', subtext: 'Well-established treatment' },
      'peritoneal-dialysis': { level: 'good', text: 'Good', subtext: 'Similar to haemodialysis' },
      'conservative-care': { level: 'varies', text: 'Quality focused', subtext: 'Comfort over longevity' },
    },
  },
  {
    id: 'quality-of-life',
    criteriaKey: 'Quality of life',
    hintKey: 'Overall wellbeing',
    values: {
      'kidney-transplant': { level: 'excellent', text: 'Excellent', subtext: 'Near-normal life possible' },
      'hemodialysis': { level: 'moderate', text: 'Moderate', subtext: 'Treatment affects daily routine' },
      'peritoneal-dialysis': { level: 'good', text: 'Good', subtext: 'More independence' },
      'conservative-care': { level: 'good', text: 'Focus on comfort', subtext: 'Symptom management priority' },
    },
  },
  {
    id: 'energy-levels',
    criteriaKey: 'Energy levels',
    hintKey: 'Typical energy and fatigue',
    values: {
      'kidney-transplant': { level: 'excellent', text: 'Often excellent', subtext: 'Energy restored' },
      'hemodialysis': { level: 'moderate', text: 'Variable', subtext: 'Fatigue after sessions' },
      'peritoneal-dialysis': { level: 'good', text: 'Generally good', subtext: 'Steady energy levels' },
      'conservative-care': { level: 'varies', text: 'Varies', subtext: 'Managed with support' },
    },
  },
];

const LEGEND_ITEMS: { level: RatingLevel; label: string }[] = [
  { level: 'excellent', label: 'Excellent - Generally very favourable' },
  { level: 'good', label: 'Good - Generally favourable' },
  { level: 'moderate', label: 'Moderate - Some limitations to consider' },
  { level: 'challenging', label: 'Challenging - Significant considerations' },
  { level: 'varies', label: 'Varies - Depends on individual circumstances' },
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
      <nav className="bg-bg-page border-b border-nhs-pale-grey" aria-label="Breadcrumb">
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
          className="bg-white border border-nhs-pale-grey rounded-lg p-6 mb-8"
          aria-labelledby="filter-heading"
        >
          <h2 id="filter-heading" className="text-lg font-bold mb-4">
            {t('compare.customise', 'Customise Your Comparison')}
          </h2>

          {/* Treatment Filters */}
          <div className="mb-4">
            <span className="block text-sm font-semibold text-text-secondary mb-2">
              {t('compare.showTreatments', 'Show treatments:')}
            </span>
            <div className="flex flex-wrap gap-3" role="group" aria-label={t('compare.showTreatments', 'Show treatments')}>
              {TREATMENT_HEADERS.map((treatment) => (
                <label
                  key={treatment.id}
                  className={`flex items-center gap-2 px-3 py-2 border-2 rounded-md text-sm cursor-pointer transition-colors ${
                    selectedTreatments.has(treatment.id)
                      ? 'border-nhs-blue bg-[#E6F0FA]'
                      : 'border-nhs-pale-grey bg-bg-surface-secondary hover:border-nhs-blue'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTreatments.has(treatment.id)}
                    onChange={() => toggleTreatment(treatment.id)}
                    className="w-[18px] h-[18px] accent-nhs-blue"
                  />
                  <span>{treatment.nameKey}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Highlight Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#E6F0FA] border border-nhs-blue rounded-md">
            <label className="flex items-center gap-3 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={highlightValues}
                onChange={(e) => setHighlightValues(e.target.checked)}
                className="sr-only"
              />
              <span
                className={`relative w-12 h-[26px] rounded-full transition-colors ${
                  highlightValues ? 'bg-nhs-green' : 'bg-nhs-mid-grey'
                }`}
                role="switch"
                aria-checked={highlightValues}
              >
                <span
                  className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full transition-transform ${
                    highlightValues ? 'translate-x-[22px]' : ''
                  }`}
                />
              </span>
              <span>{t('compare.highlightForMe', 'Highlight treatments for me')}</span>
            </label>
            <span className="text-sm text-text-secondary">
              {t('compare.highlightHint', 'Based on your values and priorities from the questionnaire')}
            </span>
          </div>
        </section>

        {/* Legend Section */}
        <section
          className="bg-white border border-nhs-pale-grey rounded-lg p-6 mb-8"
          aria-labelledby="legend-heading"
        >
          <h2 id="legend-heading" className="text-base font-bold mb-4">
            {t('compare.understandingIcons', 'Understanding the Icons')}
          </h2>
          <div className="flex flex-wrap gap-6" role="list">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.level} className="flex items-center gap-3" role="listitem">
                <RatingIcon level={item.level} />
                <span className="text-sm text-text-secondary">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Scroll Indicator */}
        <div
          className="flex lg:hidden items-center justify-center gap-2 p-3 bg-[#FFF7E6] rounded-md mb-4 text-sm text-[#856404]"
          role="status"
          aria-live="polite"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
          </svg>
          {t('compare.scrollHint', 'Scroll horizontally to see all treatments')}
        </div>

        {/* Comparison Table - Enhanced */}
        <section
          className="bg-white border border-nhs-pale-grey rounded-2xl overflow-hidden mb-8 shadow-lg"
          aria-labelledby="table-heading"
        >
          <h2 id="table-heading" className="sr-only">
            {t('compare.tableHeading', 'Treatment Comparison Table')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]" aria-label={t('compare.tableLabel', 'Comparison of kidney treatment options')}>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="bg-gradient-to-r from-nhs-blue-dark to-nhs-blue text-white font-bold text-left p-5 sticky left-0 z-10 min-w-[200px]"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                      </svg>
                      {t('compare.criteria', 'Criteria')}
                    </div>
                  </th>
                  {visibleTreatments.map((treatment, index) => (
                    <th
                      key={treatment.id}
                      scope="col"
                      className={`text-white font-bold text-center p-5 min-w-[180px] ${
                        index % 2 === 0 ? 'bg-nhs-blue' : 'bg-nhs-blue/90'
                      }`}
                    >
                      <span className="block text-lg mb-1">{treatment.nameKey}</span>
                      <span className="block text-xs font-normal opacity-80">{treatment.typeKey}</span>
                      {recommendedTreatment === treatment.id && (
                        <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-nhs-green text-white text-xs font-semibold rounded-full shadow-md">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
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
                          className="font-bold text-sm uppercase tracking-wider text-nhs-blue-dark p-4 border-l-4 border-nhs-blue"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-nhs-blue rounded-full" />
                            {row.titleKey}
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
                        className="bg-white group-hover:bg-nhs-blue/5 p-5 sticky left-0 z-[5] text-left font-semibold border-r border-nhs-pale-grey transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-text-primary font-semibold">{dataRow.criteriaKey}</span>
                          <span className="text-xs font-normal text-text-muted">{dataRow.hintKey}</span>
                        </div>
                      </th>
                      {visibleTreatments.map((treatment, index) => {
                        const cell = dataRow.values[treatment.id];
                        return (
                          <td
                            key={treatment.id}
                            className={`p-5 text-center align-middle ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            } group-hover:bg-nhs-blue/5 transition-colors`}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <RatingIcon level={cell.level} />
                              <div className="text-sm text-text-primary font-medium leading-snug">
                                {cell.text}
                              </div>
                              {cell.subtext && (
                                <span className="text-xs text-text-muted">
                                  {cell.subtext}
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
          className="bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 border-l-4 border-nhs-blue rounded-xl p-6 mb-8 flex gap-5 shadow-sm"
          aria-labelledby="guidance-heading"
        >
          <div className="w-12 h-12 bg-nhs-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <div>
            <h2 id="guidance-heading" className="text-lg font-bold text-text-primary mb-2">
              {t('compare.remember', 'Remember')}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t(
                'compare.guidance',
                'No treatment is perfect for everyone. The best choice depends on your personal situation, health, and values. This comparison is a starting point for discussions with your kidney team.'
              )}
            </p>
          </div>
        </section>

        {/* Navigation Section - Enhanced */}
        <nav
          className="bg-white rounded-2xl p-6 border border-nhs-pale-grey shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4"
          aria-label="Page navigation"
        >
          <button
            onClick={() => navigate('/hub')}
            className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-3 text-nhs-blue font-medium hover:bg-nhs-blue/5 rounded-lg transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            <span>{t('nav.backToHub', 'Back to Your Hub')}</span>
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/values"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {t('values.startExercise', 'Start Values Exercise')}
            </Link>
            <Link
              to="/summary"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-nhs-blue to-nhs-blue-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
            >
              {t('compare.addToSummary', 'Add to My Summary')}
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
