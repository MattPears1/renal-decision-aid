/**
 * @fileoverview Treatment overview page for the NHS Renal Decision Aid.
 * Displays all available kidney treatment options with summary cards
 * and links to detailed information for each treatment type.
 *
 * @module pages/TreatmentOverviewPage
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires react-router-dom
 * @requires react-i18next
 * @requires @renal-decision-aid/shared-types
 */

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

/**
 * Configuration data for a treatment card.
 * @interface TreatmentCardData
 * @property {TreatmentType} id - Unique treatment identifier
 * @property {string} titleKey - i18n key for the treatment title
 * @property {string} descriptionKey - i18n key for the description
 * @property {string[]} factKeys - i18n keys for key facts
 * @property {string} colorClass - CSS border color class
 * @property {string} bgClass - CSS background color class
 * @property {string} iconColorClass - CSS icon color class
 * @property {React.ReactNode} icon - Treatment icon component
 */
interface TreatmentCardData {
  id: TreatmentType;
  titleKey: string;
  descriptionKey: string;
  factKeys: string[];
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
    factKeys: [
      'treatments.facts.transplant.survival',
      'treatments.facts.transplant.surgery',
      'treatments.facts.transplant.medication',
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
    factKeys: [
      'treatments.facts.hemodialysis.frequency',
      'treatments.facts.hemodialysis.professionalCare',
      'treatments.facts.hemodialysis.travel',
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
    factKeys: [
      'treatments.facts.peritoneal.dailyHome',
      'treatments.facts.peritoneal.timingOptions',
      'treatments.facts.peritoneal.flexibility',
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
    factKeys: [
      'treatments.facts.conservative.comfort',
      'treatments.facts.conservative.noDialysis',
      'treatments.facts.conservative.symptomManagement',
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

/**
 * Treatment overview page component.
 * Displays a grid of treatment option cards with key facts and links
 * to detailed information. Includes a comparison feature CTA.
 *
 * @component
 * @returns {JSX.Element} The rendered treatment overview page
 *
 * @example
 * // Usage in router
 * <Route path="/treatments" element={<TreatmentOverviewPage />} />
 */
export default function TreatmentOverviewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-bg-page" id="main-content">
      {/* Breadcrumb */}
      <nav className="bg-bg-page border-b border-nhs-pale-grey" aria-label={t('accessibility.breadcrumb')}>
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

      <div className="max-w-container-xl mx-auto px-4 py-6 md:py-10">
        {/* Page Intro - Enhanced hero style */}
        <section className="max-w-3xl mb-8" aria-labelledby="page-title">
          <div className="flex items-start gap-4 mb-4">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-nhs-blue/10 items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h1 id="page-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3">
                {t('treatments.title', 'Understanding Kidney Treatment Options')}
              </h1>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                {t(
                  'treatments.subtitle',
                  'When your kidneys can no longer work well enough on their own, there are several treatment options available. Each option has benefits and considerations, and the right choice depends on your health, lifestyle, and what matters most to you.'
                )}
              </p>
            </div>
          </div>

          {/* Audio Button - Enhanced */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-nhs-blue text-white rounded-xl font-semibold text-sm hover:bg-nhs-blue-dark transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[44px]"
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

        {/* Info Box - Enhanced */}
        <div
          className="bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 border border-nhs-blue/20 rounded-xl p-5 mb-8 flex gap-4"
          role="note"
          aria-labelledby="info-box-title"
        >
          <div className="w-10 h-10 rounded-xl bg-nhs-blue/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <div>
            <p id="info-box-title" className="font-bold text-text-primary mb-1">
              {t('treatments.infoBox.title', 'Your kidney team will guide you')}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t(
                'treatments.infoBox.text',
                'This information is to help you understand your options. Your kidney team are the experts in your care and will help you decide which treatment is most suitable for your individual situation.'
              )}
            </p>
          </div>
        </div>

        {/* Treatment Cards Grid - Enhanced */}
        <section aria-labelledby="treatments-heading" className="mb-10">
          <h2 id="treatments-heading" className="sr-only">
            {t('treatments.mainChoices', 'Your Main Treatment Choices')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {TREATMENTS.map((treatment) => (
              <article
                key={treatment.id}
                className="group bg-white border border-nhs-pale-grey rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                aria-labelledby={`${treatment.id}-title`}
              >
                {/* Visual/Icon - Enhanced with gradient overlay */}
                <div className={`relative ${treatment.bgClass} p-6 sm:p-8 flex items-center justify-center min-h-[140px] sm:min-h-[180px]`}>
                  {/* Decorative background circles */}
                  <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-white/30 blur-xl" aria-hidden="true" />
                  <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/20 blur-lg" aria-hidden="true" />

                  <div className={`relative z-10 ${treatment.iconColorClass} transform group-hover:scale-110 transition-transform duration-300`}>
                    <div className="scale-75 sm:scale-100">{treatment.icon}</div>
                  </div>

                  {/* Colored accent bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${treatment.colorClass.replace('border-', 'bg-')}`} aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <h3
                    id={`${treatment.id}-title`}
                    className="text-lg sm:text-xl font-bold text-text-primary mb-2 group-hover:text-nhs-blue transition-colors"
                  >
                    {t(treatment.titleKey, treatment.id)}
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4">
                    {t(treatment.descriptionKey, '')}
                  </p>

                  {/* Key Facts - Enhanced styling */}
                  <div className="mb-5 flex-1 space-y-2">
                    {treatment.factKeys.map((factKey, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-text-primary">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${treatment.bgClass}`}>
                          <svg
                            className={`w-3 h-3 ${treatment.iconColorClass}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="leading-snug">{t(factKey)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer - Enhanced button */}
                  <div className="mt-auto">
                    <Link
                      to={`/treatments/${treatment.id}`}
                      className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 font-semibold rounded-xl transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation group/btn ${treatment.colorClass.replace('border-', 'bg-')} text-white hover:opacity-90 shadow-md hover:shadow-lg`}
                    >
                      <span>{t('common.learnMore', 'Learn More')}</span>
                      <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        {/* Compare All Treatments Section - Enhanced */}
        <section
          className="bg-gradient-to-br from-nhs-blue/5 to-nhs-blue/10 border border-nhs-blue/20 rounded-2xl p-6 sm:p-8 text-center mb-10"
          aria-labelledby="compare-heading"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-nhs-blue/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <h2 id="compare-heading" className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
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
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-nhs-blue text-white font-semibold rounded-xl hover:bg-nhs-blue-dark transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation"
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

        {/* Navigation Buttons - Enhanced */}
        <nav
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-nhs-pale-grey"
          aria-label={t('accessibility.pageNavigation')}
        >
          <button
            onClick={() => navigate('/hub')}
            className="inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-3 text-nhs-blue font-medium hover:bg-nhs-blue/5 rounded-xl focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>{t('nav.backToHub', 'Back to Your Hub')}</span>
          </button>
          <Link
            to="/values"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation"
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
