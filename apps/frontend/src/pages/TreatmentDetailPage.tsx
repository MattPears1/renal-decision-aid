/**
 * Treatment detail page - displays comprehensive information about each treatment option.
 * Includes "In Simple Terms" explanations, visual explainers, day-in-life summaries,
 * FAQs, and categorised common questions for improved clarity.
 * @module pages/TreatmentDetailPage
 */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import TreatmentTimeline from '@/components/TreatmentTimeline';
import { TREATMENT_DETAIL_DATA } from '@/data/treatmentDetailData';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

/** Treatment detail page component */
export default function TreatmentDetailPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { markTreatmentViewed } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [questionFilter, setQuestionFilter] = useState<'all' | 'general' | 'practical' | 'medical' | 'lifestyle' | 'emotional'>('all');
  const treatment = TREATMENT_DETAIL_DATA[type as TreatmentType];

  // Merge FAQs and Common Questions into a single array with categories
  const allFaqs = treatment ? [
    // Original FAQs get 'general' category
    ...treatment.faqs.map(faq => ({ ...faq, category: 'general' as const })),
    // Common questions already have categories
    ...treatment.commonQuestions,
  ] : [];

  useEffect(() => { if (treatment) markTreatmentViewed(treatment.id); }, [treatment, markTreatmentViewed]);

  if (!treatment) {
    return (
      <main className="min-h-screen bg-bg-page flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-nhs-pale-grey flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">
            {t('error.treatmentNotFound', 'Treatment Not Found')}
          </h1>
          <p className="text-text-secondary mb-6">
            {t('error.treatmentNotFoundDesc', 'The treatment you are looking for could not be found.')}
          </p>
          <Link
            to="/treatments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-nhs-blue text-white font-semibold rounded-md hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {t('nav.backToTreatments', 'Back to treatments')}
          </Link>
        </div>
      </main>
    );
  }

  const quickNavItems = [
    { id: 'overview', label: t('treatment.nav.overview', 'Overview') },
    { id: 'simple-terms', label: t('treatment.nav.simpleTerms', 'In Simple Terms') },
    { id: 'how-it-works', label: t('treatment.nav.howItWorks', 'How It Works') },
    { id: 'day-summary', label: t('treatment.nav.daySummary', 'Typical Day') },
    { id: 'benefits', label: t('treatment.nav.benefits', 'Benefits') },
    { id: 'faq', label: t('treatment.nav.faq', 'FAQs') },
  ];

  return (
    <main className="min-h-screen bg-bg-page" id="main-content" aria-label={t('treatments.detailedInfoAriaLabel', { treatment: treatment.title })}>
      {/* Breadcrumb */}
      <nav className="bg-bg-page border-b border-nhs-pale-grey" aria-label={t('accessibility.breadcrumb')}>
        <div className="max-w-container-xl mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li><Link to="/" className="text-nhs-blue hover:underline">{t('nav.home', 'Home')}</Link></li>
            <li className="text-nhs-mid-grey">/</li>
            <li><Link to="/treatments" className="text-nhs-blue hover:underline">{t('treatments.title', 'Treatment Options')}</Link></li>
            <li className="text-nhs-mid-grey">/</li>
            <li className="text-text-secondary" aria-current="page">{treatment.title}</li>
          </ol>
        </div>
      </nav>

      <div className="max-w-container-xl mx-auto px-4 py-6 md:py-10">
        {/* Hero Section */}
        <section className={`bg-gradient-to-br ${treatment.bgGradient} rounded-2xl p-5 sm:p-8 md:p-10 mb-6 sm:mb-8 shadow-sm`} aria-labelledby="treatment-title">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/50 rounded-full blur-xl transform scale-110" aria-hidden="true" />
              <div className={`relative ${treatment.iconColor} p-4 bg-white/70 rounded-full shadow-md`}>
                <div className="scale-75 sm:scale-90 md:scale-100">{treatment.icon}</div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 id="treatment-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3">{treatment.title}</h1>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-4 max-w-2xl">{treatment.subtitle}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-5">
                {treatment.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-nhs-pale-grey rounded-full text-xs sm:text-sm text-text-primary shadow-sm">
                    <span className={treatment.iconColor}>{tag.icon}</span>
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button type="button" className="inline-flex items-center gap-2 px-5 py-2.5 bg-nhs-blue text-white rounded-lg font-semibold text-sm hover:bg-nhs-blue-dark transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[44px] touch-manipulation" aria-label={t('accessibility.listenToPage', 'Listen to this page being read aloud')}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                  <span>{t('common.listenToPage', 'Listen to this page')}</span>
                </button>
                <Link to="/compare" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 text-nhs-blue rounded-lg font-semibold text-sm border border-nhs-blue/30 hover:bg-white hover:border-nhs-blue transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[44px] touch-manipulation">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  <span>{t('common.compareTreatments', 'Compare')}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <nav className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border border-nhs-pale-grey rounded-xl p-2 mb-8 shadow-sm hidden md:block" aria-label={t('treatment.nav.quickNav', 'Quick navigation')}>
          <ul className="flex flex-wrap gap-1 justify-center">
            {quickNavItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}-heading`} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-nhs-pale-grey hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1" onClick={(e) => { e.preventDefault(); document.getElementById(`${item.id}-heading`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Overview Section */}
        <section className="mb-10" aria-labelledby="overview-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
            </div>
            <h2 id="overview-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.overview', `What is ${treatment.title}?`)}</h2>
          </header>
          <div className="bg-white rounded-xl border border-nhs-pale-grey p-5 sm:p-6 shadow-sm">
            <div className="text-text-primary leading-relaxed space-y-4">
              {treatment.overview.map((para, idx) => (<p key={idx} className="text-base sm:text-lg">{para}</p>))}
            </div>
          </div>
        </section>

        {/* In Simple Terms Section */}
        <section className="mb-10" aria-labelledby="simple-terms-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-purple/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /><path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" /></svg>
            </div>
            <div>
              <h2 id="simple-terms-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.inSimpleTerms', 'In Simple Terms')}</h2>
              <p className="text-sm text-text-muted">{t('treatment.inSimpleTermsDesc', 'A plain-language explanation')}</p>
            </div>
          </header>
          <div className="bg-gradient-to-br from-nhs-purple/5 to-nhs-purple/10 rounded-xl border-2 border-nhs-purple/20 p-5 sm:p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex-shrink-0 hidden sm:block">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-nhs-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg text-text-primary leading-relaxed">{treatment.inSimpleTerms}</p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-nhs-purple/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-nhs-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-nhs-purple mb-1">{t('treatment.visualExplainer', 'Picture it like this:')}</p>
                  <p className="text-text-secondary leading-relaxed">{treatment.visualExplainer.simpleVisual}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-10" aria-labelledby="how-it-works-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h2 id="how-it-works-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.howItWorks', 'How Does It Work?')}</h2>
          </header>
          <div className="bg-white rounded-xl border border-nhs-pale-grey overflow-hidden shadow-sm">
            <div className="divide-y divide-nhs-pale-grey">
              {treatment.howItWorks.map((item, idx) => (
                <div key={idx} className="p-5 sm:p-6 flex gap-4 hover:bg-bg-surface-secondary/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${treatment.iconColor.replace('text-', 'bg-')}`}>{idx + 1}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary mb-1 text-base sm:text-lg">{item.title}</h3>
                    <p className="text-text-secondary leading-relaxed mb-2">{item.content}</p>
                    <div className="bg-nhs-pale-grey/50 rounded-lg p-3 mt-2">
                      <p className="text-sm text-text-primary flex items-start gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-nhs-purple/20 text-nhs-purple flex-shrink-0 mt-0.5" aria-hidden="true">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                        <span><strong>{t('treatment.simplyPut', 'Simply put')}:</strong> {item.simpleExplanation}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Day in the Life Summary */}
        <section className="mb-10" aria-labelledby="day-summary-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-orange/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
            </div>
            <h2 id="day-summary-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.quickDaySummary', 'What a Typical Day Looks Like')}</h2>
          </header>
          <div className="bg-gradient-to-br from-nhs-orange/5 to-nhs-warm-yellow/10 rounded-xl border border-nhs-orange/20 p-5 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {[{ time: 'morning', emoji: '🌅', label: t('treatment.morning', 'Morning'), text: treatment.dayInLifeSummary.morning },
                { time: 'afternoon', emoji: '☀️', label: t('treatment.afternoon', 'Afternoon'), text: treatment.dayInLifeSummary.afternoon },
                { time: 'evening', emoji: '🌙', label: t('treatment.evening', 'Evening'), text: treatment.dayInLifeSummary.evening }].map(({ time, emoji, label, text }) => (
                <div key={time} className="bg-white/80 rounded-lg p-4 border border-nhs-orange/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" role="img" aria-label={label}>{emoji}</span>
                    <span className="font-semibold text-text-primary text-sm">{label}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-nhs-orange/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-nhs-orange/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-nhs-orange" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-text-primary mb-1">{t('treatment.keyTakeaway', 'Key takeaway')}</p>
                  <p className="text-text-secondary">{treatment.dayInLifeSummary.keyMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Day in the Life Timeline */}
        <section className="mb-10" aria-labelledby="timeline-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <h2 id="timeline-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.dayInLife', 'A Day in the Life')}</h2>
          </header>
          <TreatmentTimeline treatmentType={treatment.id} />
        </section>

        {/* Benefits & Considerations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <section aria-labelledby="benefits-heading">
            <header className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-nhs-green/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-nhs-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h2 id="benefits-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.benefits', 'Benefits')}</h2>
            </header>
            <div className="bg-white rounded-xl border-2 border-nhs-green/30 overflow-hidden shadow-sm h-full">
              <div className="bg-gradient-to-r from-nhs-green/5 to-nhs-green/10 px-5 py-3 border-b border-nhs-green/20">
                <span className="text-sm font-medium text-nhs-green-dark">{t('treatment.keyBenefits', 'Key benefits of this treatment')}</span>
              </div>
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {treatment.benefits.map((benefit, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-[#E6F4EA] to-[#d4edda] rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                          <div className="text-nhs-green scale-75">{benefit.icon}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-nhs-green-dark text-sm leading-tight block mb-1">{benefit.title}</span>
                          <p className="text-xs text-text-secondary leading-relaxed">{benefit.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section aria-labelledby="considerations-heading">
            <header className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-nhs-warm-yellow/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-nhs-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              </div>
              <h2 id="considerations-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.considerations', 'Things to Consider')}</h2>
            </header>
            <div className="bg-white rounded-xl border-2 border-nhs-warm-yellow/40 overflow-hidden shadow-sm h-full">
              <div className="bg-gradient-to-r from-nhs-warm-yellow/10 to-nhs-warm-yellow/20 px-5 py-3 border-b border-nhs-warm-yellow/30">
                <span className="text-sm font-medium text-[#856404]">{t('treatment.importantToKnow', 'Important things to know')}</span>
              </div>
              <ul className="p-4 sm:p-5 space-y-3" role="list">
                {treatment.considerations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#FFF8E6] to-[#fff3cd] rounded-lg border border-nhs-warm-yellow/30">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-nhs-warm-yellow/30 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-[#856404]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    </div>
                    <span className="text-sm sm:text-base text-[#856404] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Lifestyle Section */}
        <section className="mb-10" aria-labelledby="lifestyle-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <h2 id="lifestyle-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.lifestyle', 'Lifestyle Impact')}</h2>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {treatment.lifestyle.map((item, idx) => (
              <div key={idx} className="bg-white border border-nhs-pale-grey rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-nhs-blue/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-nhs-blue/10 flex items-center justify-center mb-4 group-hover:bg-nhs-blue/15 transition-colors">
                  <div className="text-nhs-blue scale-75">{item.icon}</div>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Getting Started Steps */}
        <section className="mb-10" aria-labelledby="steps-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            </div>
            <h2 id="steps-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.gettingStarted', 'Getting Started')}</h2>
          </header>
          <div className="bg-white rounded-xl border border-nhs-pale-grey p-4 sm:p-6 shadow-sm">
            <ol className="relative">
              {treatment.steps.map((step, idx) => (
                <li key={idx} className="flex gap-4 sm:gap-5 pb-6 last:pb-0 relative">
                  {idx < treatment.steps.length - 1 && <div className="absolute left-4 sm:left-5 top-10 w-0.5 h-[calc(100%-2.5rem)] bg-gradient-to-b from-nhs-blue/40 to-nhs-blue/10" aria-hidden="true" />}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-sm ${idx === 0 ? 'bg-nhs-blue text-white' : 'bg-nhs-blue/10 text-nhs-blue border-2 border-nhs-blue/30'}`}>{idx + 1}</div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-semibold text-text-primary mb-1 text-sm sm:text-base">{step.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Frequently Asked Questions Section - Merged FAQs and Common Questions */}
        <section className="mb-10" aria-labelledby="faq-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>
            </div>
            <div>
              <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.faq', 'Frequently Asked Questions')}</h2>
              <p className="text-sm text-text-muted">{t('treatment.faqDesc', 'Questions that patients often ask about this treatment')}</p>
            </div>
          </header>
          <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label={t('treatment.filterByCategory', 'Filter by category')}>
            {(['all', 'general', 'practical', 'medical', 'lifestyle', 'emotional'] as const).map((category) => (
              <button key={category} role="tab" aria-selected={questionFilter === category} onClick={() => setQuestionFilter(category)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] touch-manipulation ${questionFilter === category ? 'bg-nhs-blue text-white shadow-sm' : 'bg-nhs-pale-grey text-text-primary hover:bg-nhs-blue/10 hover:text-nhs-blue'}`}>
                {category === 'all' && t('treatment.categoryAll', 'All questions')}
                {category === 'general' && t('treatment.categoryGeneral', 'General')}
                {category === 'practical' && t('treatment.categoryPractical', 'Practical')}
                {category === 'medical' && t('treatment.categoryMedical', 'Medical')}
                {category === 'lifestyle' && t('treatment.categoryLifestyle', 'Lifestyle')}
                {category === 'emotional' && t('treatment.categoryEmotional', 'Emotional')}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-nhs-pale-grey overflow-hidden shadow-sm" role="list" aria-label={t('accessibility.faq')}>
            {allFaqs.filter(q => questionFilter === 'all' || q.category === questionFilter).map((faq, idx) => {
              const originalIdx = allFaqs.findIndex(q => q.question === faq.question);
              const categoryColorClass = faq.category === 'general' ? 'bg-nhs-mid-grey/10 text-nhs-dark-grey' : faq.category === 'practical' ? 'bg-nhs-blue/10 text-nhs-blue' : faq.category === 'medical' ? 'bg-nhs-purple/10 text-nhs-purple' : faq.category === 'lifestyle' ? 'bg-nhs-green/10 text-nhs-green' : 'bg-nhs-orange/10 text-nhs-orange';
              return (
                <div key={originalIdx} className={`border-b border-nhs-pale-grey last:border-b-0 ${openFaq === originalIdx ? 'bg-nhs-blue/5' : ''}`} role="listitem">
                  <button className="w-full px-5 sm:px-6 py-4 flex justify-between items-center gap-3 text-left font-semibold text-text-primary focus:outline-none focus:ring-3 focus:ring-focus focus:ring-inset min-h-[56px] touch-manipulation transition-colors hover:bg-nhs-blue/5" aria-expanded={openFaq === originalIdx} aria-controls={`faq-answer-${originalIdx}`} onClick={() => setOpenFaq(openFaq === originalIdx ? null : originalIdx)}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${categoryColorClass}`}>
                        {faq.category === 'general' && t('treatment.categoryGeneral', 'General')}
                        {faq.category === 'practical' && t('treatment.categoryPractical', 'Practical')}
                        {faq.category === 'medical' && t('treatment.categoryMedical', 'Medical')}
                        {faq.category === 'lifestyle' && t('treatment.categoryLifestyle', 'Lifestyle')}
                        {faq.category === 'emotional' && t('treatment.categoryEmotional', 'Emotional')}
                      </span>
                      <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
                    </div>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${openFaq === originalIdx ? 'bg-nhs-blue text-white rotate-180' : 'bg-nhs-pale-grey text-nhs-blue'}`}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                  </button>
                  <div id={`faq-answer-${originalIdx}`} className={`overflow-hidden transition-all duration-300 ${openFaq === originalIdx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-text-secondary leading-relaxed">{faq.answer}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Patient Stories Section */}
        <section className="mb-10" aria-labelledby="stories-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div>
              <h2 id="stories-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.stories', 'Hear from Others')}</h2>
              <p className="text-sm text-text-secondary mt-0.5">{t('treatment.storiesIntro', "These are experiences from real patients. Everyone's journey is different.")}</p>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {treatment.patientStories.map((story, idx) => (
              <article key={idx} className={`relative bg-gradient-to-br ${treatment.bgGradient} rounded-xl p-6 shadow-sm border border-white/50`}>
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/60 flex items-center justify-center" aria-hidden="true">
                  <svg className={`w-5 h-5 ${treatment.iconColor}`} viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
                </div>
                <blockquote className="text-base sm:text-lg text-text-primary leading-relaxed mb-5 pr-10">&ldquo;{story.quote}&rdquo;</blockquote>
                <footer className="flex items-center gap-3 pt-4 border-t border-text-primary/10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${treatment.iconColor.replace('text-', 'bg-')} text-white`} aria-hidden="true">{story.name[0]}</div>
                  <div>
                    <div className="font-semibold text-text-primary">{story.name}, {story.age}</div>
                    <div className="text-sm text-text-muted flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {story.duration}
                    </div>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>

        {/* Action Section */}
        <section className="bg-gradient-to-br from-nhs-blue/5 to-nhs-blue/10 border border-nhs-blue/20 rounded-2xl p-6 sm:p-8 mb-8" aria-labelledby="action-heading">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </div>
            <h2 id="action-heading" className="text-xl sm:text-2xl font-bold text-text-primary mb-2">{t('treatment.readyToLearnMore', 'Ready to Learn More?')}</h2>
            <p className="text-text-secondary mb-6">{t('treatment.readyDescription', 'Compare this treatment with others or ask questions to help with your decision.')}</p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
              <Link to="/compare" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                <span>{t('compare.withOthers', 'Compare with Other Treatments')}</span>
              </Link>
              <Link to="/chat" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-nhs-blue text-white font-semibold rounded-xl hover:bg-nhs-blue-dark transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                <span>{t('chat.askQuestion', 'Ask a Question About This')}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Related Treatments */}
        <section className="mb-8" aria-labelledby="related-heading">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
            </div>
            <h2 id="related-heading" className="text-xl sm:text-2xl font-bold text-text-primary">{t('treatment.exploreOthers', 'Explore Other Treatments')}</h2>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.values(TREATMENT_DETAIL_DATA).filter((t) => t.id !== treatment.id).map((relatedTreatment) => (
              <Link key={relatedTreatment.id} to={`/treatments/${relatedTreatment.id}`} className={`group bg-gradient-to-br ${relatedTreatment.bgGradient} rounded-xl p-4 sm:p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[72px] touch-manipulation border border-white/50`}>
                <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-white/70 flex items-center justify-center ${relatedTreatment.iconColor} shadow-sm group-hover:shadow-md transition-shadow`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-text-primary text-sm sm:text-base block">{relatedTreatment.title}</span>
                  <span className="text-xs text-text-secondary">{t('common.learnMore', 'Learn more')}</span>
                </div>
                <svg className={`w-5 h-5 ${relatedTreatment.iconColor} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Navigation Buttons */}
        <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-nhs-pale-grey" aria-label={t('accessibility.pageNavigation')}>
          <button onClick={() => navigate('/treatments')} className="inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-3 text-nhs-blue font-medium hover:bg-nhs-blue/5 rounded-xl focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] touch-manipulation transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            <span>{t('nav.backToTreatments', 'Back to All Treatments')}</span>
          </button>
          <Link to="/summary" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-nhs-blue text-white font-semibold rounded-xl hover:bg-nhs-blue-dark transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px] touch-manipulation">
            <span>{t('summary.addToMy', 'Add to My Summary')}</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </Link>
        </nav>
      </div>
    </main>
  );
}
