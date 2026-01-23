/**
 * @fileoverview Statistics page for the NHS Renal Decision Aid.
 * Displays personalized UK renal statistics showing what people in
 * similar situations chose, based on real NHS data sources.
 *
 * @module pages/StatisticsPage
 * @version 1.0.0
 * @since 2.7.0
 * @lastModified 23 January 2026
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import { getPersonalizedStatistics, buildProfileFromSession } from '@/data/statisticsMatching';
import {
  StatisticsDisclaimer,
  TreatmentChoiceChart,
  PersonalizedInsightList,
  QualityOfLifeComparison,
  WaitingListInfo,
  SourceCitation,
} from '@/components/statistics';

/**
 * Statistics page showing personalized UK renal treatment statistics.
 * Data is personalized based on the user's session answers (age, ethnicity,
 * primary disease, etc.) and drawn from real UK Renal Registry data.
 *
 * @component
 * @returns {JSX.Element} The rendered statistics page
 */
export default function StatisticsPage() {
  const { t } = useTranslation();
  const { session } = useSession();
  const [showSurvival, setShowSurvival] = useState(false);

  // Build user profile from session data
  const userProfile = useMemo(() => {
    const answers = session?.questionnaireAnswers || [];
    return buildProfileFromSession(answers, session?.journeyStage);
  }, [session?.questionnaireAnswers, session?.journeyStage]);

  // Get personalized statistics
  const stats = useMemo(() => {
    return getPersonalizedStatistics(userProfile);
  }, [userProfile]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-bg-page to-bg-surface">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Back navigation */}
        <nav className="mb-6" aria-label={t('nav.back', 'Back')}>
          <Link
            to="/hub"
            className="inline-flex items-center gap-2 text-sm text-nhs-blue hover:text-nhs-blue-dark font-medium transition-colors min-h-[44px] px-2 -ml-2 rounded-lg hover:bg-nhs-blue/5 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <BackIcon className="w-4 h-4" />
            {t('nav.backToHub', 'Back to Hub')}
          </Link>
        </nav>

        {/* Page header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 bg-nhs-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <StatsIcon className="w-6 h-6 text-nhs-blue" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
                {t('statistics.page.title', 'What others in similar situations chose')}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary mt-2 leading-relaxed">
                {t('statistics.page.introduction', 'Understanding what others have chosen can help you feel less alone in your decision. These are real statistics from UK kidney patients.')}
              </p>
            </div>
          </div>

          {/* Personalization indicator */}
          {stats.isPersonalized && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-nhs-blue/10 rounded-full text-xs sm:text-sm font-medium text-nhs-blue">
              <PersonalizedIcon className="w-4 h-4" />
              {t('statistics.page.personalized', 'Personalised to your profile')}
            </div>
          )}
        </header>

        {/* Disclaimer */}
        <StatisticsDisclaimer className="mb-6 sm:mb-8" />

        {/* Treatment choice chart */}
        <TreatmentChoiceChart
          breakdown={stats.modalityBreakdown}
          isPersonalized={stats.isPersonalized}
          personalizationBasisKey={stats.personalizationBasisKey}
          className="mb-6 sm:mb-8"
        />

        {/* Personalized insights */}
        {stats.insights.length > 0 && (
          <PersonalizedInsightList
            insights={stats.insights}
            className="mb-6 sm:mb-8"
          />
        )}

        {/* Quality of Life Comparison */}
        <QualityOfLifeComparison
          data={stats.qualityOfLife}
          className="mb-6 sm:mb-8"
        />

        {/* Waiting List Info */}
        <WaitingListInfo
          data={stats.waitingList}
          hasLivingDonor={userProfile.hasLivingDonor}
          className="mb-6 sm:mb-8"
        />

        {/* Survival data - behind expandable with content warning */}
        <div className="bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden mb-6 sm:mb-8">
          <button
            onClick={() => setShowSurvival(!showSurvival)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left min-h-[56px] hover:bg-bg-surface/50 transition-colors focus:outline-none focus:ring-2 focus:ring-focus focus:ring-inset"
            aria-expanded={showSurvival}
            aria-controls="survival-data-section"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-nhs-pale-grey rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldIcon className="w-5 h-5 text-text-secondary" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-sm sm:text-base">
                  {t('statistics.survival.title', 'Survival information')}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {t('statistics.survival.subtitle', 'Contains sensitive statistical information')}
                </p>
              </div>
            </div>
            <ChevronIcon
              className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${showSurvival ? 'rotate-180' : ''}`}
            />
          </button>

          {showSurvival && (
            <div
              id="survival-data-section"
              className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-nhs-pale-grey"
            >
              {/* Content warning */}
              <div className="mt-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs sm:text-sm text-amber-800">
                  {t('statistics.survival.warning', 'The following information contains survival statistics. These are population averages and vary greatly based on age, overall health, and many other individual factors. They should not be interpreted as predictions about your personal outlook.')}
                </p>
              </div>

              {/* Survival stats */}
              <div className="space-y-3">
                {stats.survival.map((item) => (
                  <div
                    key={item.modality}
                    className="p-3 bg-bg-surface rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-text-primary text-sm">
                        {t(`statistics.modalities.${item.modality === 'conservative' ? 'conservative' : item.modality}`,
                          item.modality)}
                      </span>
                      <span className="text-sm font-semibold text-text-primary">
                        {item.fiveYearSurvival
                          ? t('statistics.survival.fiveYear', '5-year: {{rate}}%', { rate: item.fiveYearSurvival })
                          : t('statistics.survival.median', 'Median: {{time}}', { time: item.medianSurvival || '' })
                        }
                      </span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {t(item.context, '')}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-text-muted mt-4 leading-relaxed">
                {t('statistics.survival.note', 'Survival rates have improved significantly over recent decades and continue to improve with advances in treatment. Your kidney team can discuss what these figures mean in the context of your individual health.')}
              </p>
            </div>
          )}
        </div>

        {/* Discuss with your team callout */}
        <div className="bg-gradient-to-r from-nhs-blue/5 to-nhs-green/5 border border-nhs-blue/20 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-nhs-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <TeamIcon className="w-6 h-6 text-nhs-blue" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary text-base sm:text-lg mb-2">
                {t('statistics.team.title', 'Discuss with your kidney team')}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {t('statistics.team.description', 'These statistics provide general context, but your kidney team knows your individual situation best. They can help you understand what these numbers mean for you and answer any questions you have.')}
              </p>
              <ul className="space-y-1.5" role="list">
                <li className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-nhs-green mt-0.5 flex-shrink-0">-</span>
                  {t('statistics.team.point1', 'Ask about your individual risk factors and expected outcomes')}
                </li>
                <li className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-nhs-green mt-0.5 flex-shrink-0">-</span>
                  {t('statistics.team.point2', 'Discuss which treatments are realistic options for you')}
                </li>
                <li className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-nhs-green mt-0.5 flex-shrink-0">-</span>
                  {t('statistics.team.point3', 'Explore how your lifestyle and preferences fit with each option')}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Source citations */}
        <SourceCitation className="mb-6 sm:mb-8" />

        {/* Bottom navigation */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            to="/hub"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] bg-white border border-nhs-pale-grey text-text-primary font-semibold rounded-xl hover:border-nhs-blue hover:text-nhs-blue transition-all focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <BackIcon className="w-4 h-4" />
            {t('nav.backToHub', 'Back to Hub')}
          </Link>
          <Link
            to="/compare"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] bg-nhs-blue text-white font-semibold rounded-xl hover:bg-nhs-blue-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
          >
            {t('statistics.page.compareTreatments', 'Compare treatments')}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

// Icon components
function BackIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function StatsIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PersonalizedIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function TeamIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}
