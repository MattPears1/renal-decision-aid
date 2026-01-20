import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

interface TreatmentCardData {
  id: TreatmentType;
  titleKey: string;
  descriptionKey: string;
  facts: string[];
  colorClass: string;
  bgClass: string;
  iconColorClass: string;
  icon: React.ReactNode;
}

const TREATMENTS: TreatmentCardData[] = [
  {
    id: 'kidney-transplant',
    titleKey: 'treatments.types.transplant.title',
    descriptionKey: 'treatments.types.transplant.shortDescription',
    facts: [
      'Best long-term survival outcomes',
      'Requires surgery and recovery time',
      'Lifelong medication needed',
    ],
    colorClass: 'border-nhs-green',
    bgClass: 'bg-[#E6F4EA]',
    iconColorClass: 'text-nhs-green',
    icon: (
      <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M40 10C30 10 22 18 22 28C22 35 26 40 26 45C26 55 35 60 40 60C45 60 54 55 54 45C54 40 58 35 58 28C58 18 50 10 40 10Z" />
        <path d="M35 35C35 32 37 30 40 30C43 30 45 32 45 35C45 38 43 40 40 40C37 40 35 38 35 35Z" strokeWidth="2" />
        <line x1="40" y1="48" x2="40" y2="56" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="52" x2="44" y2="52" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 18L42 16C44 14 47 14 48 16C49 18 49 20 47 22L40 28L33 22C31 20 31 18 32 16C33 14 36 14 38 16L40 18Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'hemodialysis',
    titleKey: 'treatments.types.hemodialysis.title',
    descriptionKey: 'treatments.types.hemodialysis.shortDescription',
    facts: [
      '3-4 times per week, 4-5 hours each',
      'Professional care and monitoring',
      'Travel to centre required',
    ],
    colorClass: 'border-nhs-orange',
    bgClass: 'bg-[#FFF7E6]',
    iconColorClass: 'text-nhs-orange',
    icon: (
      <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="20" y="15" width="40" height="50" rx="4" />
        <rect x="26" y="22" width="28" height="12" rx="2" strokeWidth="2" />
        <circle cx="32" cy="45" r="4" strokeWidth="2" />
        <circle cx="48" cy="45" r="4" strokeWidth="2" />
        <line x1="32" y1="52" x2="32" y2="58" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="52" x2="48" y2="58" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="25" x2="40" y2="31" strokeWidth="2" strokeLinecap="round" />
        <line x1="37" y1="28" x2="43" y2="28" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'peritoneal-dialysis',
    titleKey: 'treatments.types.peritonealDialysis.title',
    descriptionKey: 'treatments.types.peritonealDialysis.shortDescription',
    facts: [
      'Daily treatment at home',
      'Overnight or daytime options',
      'Greater flexibility and independence',
    ],
    colorClass: 'border-nhs-blue',
    bgClass: 'bg-[#E6F0FA]',
    iconColorClass: 'text-nhs-blue',
    icon: (
      <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M15 35L40 15L65 35" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 32V60H60V32" />
        <path d="M45 42C45 47 41 51 36 51C38 49 39 46 39 43C39 38 35 34 30 34C32 32 34 31 37 31C42 31 45 36 45 42Z" strokeWidth="2" />
        <rect x="48" y="38" width="8" height="14" rx="2" strokeWidth="2" />
        <line x1="52" y1="52" x2="52" y2="56" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'conservative-care',
    titleKey: 'treatments.types.conservative.title',
    descriptionKey: 'treatments.types.conservative.shortDescription',
    facts: [
      'Focus on comfort and quality of life',
      'No dialysis treatment required',
      'Active symptom management',
    ],
    colorClass: 'border-nhs-purple',
    bgClass: 'bg-[#F3E8FF]',
    iconColorClass: 'text-nhs-purple',
    icon: (
      <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M40 55L25 42C20 37 20 30 25 26C30 22 36 24 40 28C44 24 50 22 55 26C60 30 60 37 55 42L40 55Z" />
        <path d="M20 60C20 55 25 52 30 52H35" strokeWidth="2" strokeLinecap="round" />
        <path d="M60 60C60 55 55 52 50 52H45" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="40" r="5" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function TreatmentOverviewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-bg-page" id="main-content">
      {/* Breadcrumb */}
      <nav className="bg-bg-page border-b border-nhs-pale-grey" aria-label="Breadcrumb">
        <div className="max-w-container-xl mx-auto px-4 py-3">
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
              {t('treatments.title', 'Treatment Options')}
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-container-xl mx-auto px-4 py-8 md:py-12">
        {/* Page Intro */}
        <section className="max-w-3xl mb-10" aria-labelledby="page-title">
          <h1 id="page-title" className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('treatments.title', 'Understanding Kidney Treatment Options')}
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-4">
            {t(
              'treatments.subtitle',
              'When your kidneys can no longer work well enough on their own, there are several treatment options available. Each option has benefits and considerations, and the right choice depends on your health, lifestyle, and what matters most to you.'
            )}
          </p>

          {/* Audio Button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-nhs-blue rounded-md text-nhs-blue font-semibold text-sm hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
            aria-label={t('accessibility.listenToPage', 'Listen to this page being read aloud')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            <span>{t('common.listenToPage', 'Listen to this page')}</span>
          </button>
        </section>

        {/* Info Box */}
        <div
          className="bg-[#E6F0FA] border-l-4 border-nhs-blue rounded-md p-4 mb-10 flex gap-4"
          role="note"
          aria-labelledby="info-box-title"
        >
          <svg className="w-6 h-6 flex-shrink-0 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <div>
            <p id="info-box-title" className="font-bold text-nhs-blue-dark mb-1">
              {t('treatments.infoBox.title', 'Your kidney team will guide you')}
            </p>
            <p className="text-sm text-nhs-blue-dark">
              {t(
                'treatments.infoBox.text',
                'This information is to help you understand your options. Your kidney team are the experts in your care and will help you decide which treatment is most suitable for your individual situation.'
              )}
            </p>
          </div>
        </div>

        {/* Treatment Cards Grid */}
        <section aria-labelledby="treatments-heading" className="mb-10">
          <h2 id="treatments-heading" className="sr-only">
            {t('treatments.mainChoices', 'Your Main Treatment Choices')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TREATMENTS.map((treatment) => (
              <article
                key={treatment.id}
                className={`bg-white border border-nhs-pale-grey rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col`}
                aria-labelledby={`${treatment.id}-title`}
              >
                {/* Visual/Icon */}
                <div className={`${treatment.bgClass} p-8 flex items-center justify-center min-h-[160px]`}>
                  <div className={treatment.iconColorClass}>{treatment.icon}</div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3
                    id={`${treatment.id}-title`}
                    className="text-xl font-bold text-text-primary mb-2"
                  >
                    {t(treatment.titleKey, treatment.id)}
                  </h3>
                  <p className="text-text-secondary leading-relaxed mb-4">
                    {t(treatment.descriptionKey, '')}
                  </p>

                  {/* Key Facts */}
                  <div className="mb-6 flex-1">
                    {treatment.facts.map((fact, idx) => (
                      <div key={idx} className="flex items-start gap-2 py-1 text-sm text-text-primary">
                        <svg
                          className={`w-[18px] h-[18px] flex-shrink-0 mt-0.5 ${treatment.iconColorClass}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto">
                    <Link
                      to={`/treatments/${treatment.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-nhs-blue text-white font-semibold rounded-md hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[44px]"
                    >
                      <span>{t('common.learnMore', 'Learn More')}</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Compare All Treatments Section */}
        <section
          className="bg-white border-2 border-nhs-blue rounded-lg p-8 text-center mb-10"
          aria-labelledby="compare-heading"
        >
          <h2 id="compare-heading" className="text-2xl font-bold text-text-primary mb-2">
            {t('compare.cta.title', 'Compare All Treatments')}
          </h2>
          <p className="text-text-secondary mb-6 max-w-xl mx-auto">
            {t(
              'compare.cta.description',
              'See all treatment options side by side to understand how they differ on the factors that matter most to you.'
            )}
          </p>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 px-6 py-3 bg-nhs-blue text-white font-semibold rounded-md hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>{t('compare.cta.button', 'Compare All Treatments')}</span>
          </Link>
        </section>

        {/* Navigation Buttons */}
        <nav
          className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-nhs-pale-grey"
          aria-label="Page navigation"
        >
          <button
            onClick={() => navigate('/hub')}
            className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-3 text-nhs-blue font-medium hover:underline focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 rounded"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>{t('nav.backToHub', 'Back to Your Hub')}</span>
          </button>
          <Link
            to="/values"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-nhs-blue text-nhs-blue font-semibold rounded-md hover:bg-nhs-blue hover:text-white transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
          >
            <span>{t('values.cta', "What Matters to You?")}</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </nav>
      </div>
    </main>
  );
}
