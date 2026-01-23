/**
 * @fileoverview Session summary page for the NHS Renal Decision Aid.
 * Displays a comprehensive summary of the user's session including journey stage,
 * value priorities, treatments explored, and questions for their healthcare team.
 * Supports printing, sharing, and PDF download functionality.
 *
 * @module pages/SummaryPage
 * @version 2.6.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 *
 * @requires react
 * @requires react-i18next
 * @requires react-router-dom
 * @requires @/context/SessionContext
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import {
  NHSLogoIcon,
  CalendarIcon,
  ProgressIcon,
  CheckCircleIcon,
  TeamIcon,
  CopyIcon,
  PrintIcon,
  ShareIcon,
  EditIcon,
  JourneyIcon,
  StageIcon,
  HeartIcon,
  TreatmentIcon,
  CheckIcon,
  QuestionIcon,
  NextStepsIcon,
  LockIcon,
  WarningIcon,
  RefreshIcon,
  BackIcon,
  ForwardIcon,
  HomeIcon,
} from './SummaryIcons';
import { QuestionsGenerator, FamilyDiscussionPrompts, WhatOthersChose } from '@/components/decision';

/**
 * Session summary page component.
 * Provides a printable summary of the user's decision aid session including
 * their journey stage, value priorities, viewed treatments, and questions
 * for their healthcare team.
 *
 * @component
 * @returns {JSX.Element} The summary page with print and share functionality
 */
export default function SummaryPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session, endSession } = useSession();
  const [linkCopied, setLinkCopied] = useState(false);
  const userRole = session?.userRole || 'patient';
  const isCarer = userRole === 'carer';

  /**
   * Triggers the browser print dialog.
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Copies the current page URL to clipboard.
   */
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.origin;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, []);

  /**
   * Handles starting over - confirms with user and resets session.
   */
  const handleStartOver = () => {
    if (window.confirm(t('summary.confirmReset', 'Are you sure you want to start over? All your progress will be lost.'))) {
      endSession();
      navigate('/');
    }
  };

  /**
   * Gets the translated label for a journey stage.
   */
  const getJourneyStageLabel = (stage: string): string => {
    return t(`summary.journeyStages.${stage}`, stage);
  };

  /**
   * Gets the translated description for a journey stage.
   */
  const getJourneyStageDescription = (stage: string): string => {
    return t(`summary.journeyDescriptions.${stage}`, t('summary.journeyDescriptions.default'));
  };

  /**
   * Gets the translated label for a value rating.
   */
  const getValueLabel = (value: number): string => {
    return t(`summary.valueLabels.${value}`, t('summary.valueLabels.default'));
  };

  /**
   * Gets the translated label for a treatment type.
   */
  const getTreatmentLabel = (treatment: string): string => {
    return t(`summary.treatmentLabels.${treatment}`, treatment);
  };

  const sessionDate = useMemo(() => {
    const locale = i18n.language || 'en-GB';
    return new Date().toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [i18n.language]);

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const totalTreatments = 4; // transplant, hemodialysis, peritoneal, conservative
    const viewedCount = session?.viewedTreatments?.length || 0;
    const topPriorities = session?.valueRatings?.filter(v => v.rating >= 4)?.length || 0;

    return {
      treatmentsViewed: viewedCount,
      totalTreatments,
      treatmentPercentage: Math.round((viewedCount / totalTreatments) * 100),
      topPriorities,
      questionsCount: 3, // Base questions - user additions tracked by QuestionsGenerator
      hasCompletedValues: (session?.valueRatings?.length || 0) > 0,
      hasExploredTreatments: viewedCount > 0,
    };
  }, [session]);

  // Get sorted top priorities
  const sortedPriorities = useMemo(() => {
    if (!session?.valueRatings) return [];
    return [...session.valueRatings]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }, [session?.valueRatings]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30 print:bg-white" role="main">
      {/* Print Header - Enhanced NHS branding */}
      <div className="hidden print:block print:mb-6 print-nhs-header print-keep-together">
        <div className="flex items-start justify-between pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <NHSLogoIcon className="w-16 h-8" />
              <span className="text-2xl font-bold text-nhs-blue">|</span>
              <span className="text-lg font-semibold text-text-secondary">Kidney Care</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{t('summary.printHeader.title')}</h1>
            <p className="text-base text-text-secondary mt-1">{t('summary.printHeader.subtitle')}</p>
          </div>
          <div className="text-right text-sm text-text-secondary">
            <p className="font-semibold">{t('summary.printHeader.dateLabel', { date: sessionDate })}</p>
            <p className="font-mono text-xs mt-1 bg-nhs-pale-grey px-2 py-0.5 rounded">
              {t('summary.sessionId')}: {session?.id?.slice(0, 8) || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 print:py-0 print:px-0">
        {/* Screen Header */}
        <div className="print:hidden">
          <header className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-nhs-pale-grey mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 bg-nhs-green/10 rounded-full text-xs sm:text-sm font-medium text-nhs-green mb-3 sm:mb-4">
                  <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {t('summary.readyToReview')}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-2 sm:mb-3">
                  {t('summary.title', 'Your Session Summary')}
                </h1>
                <p className="text-sm sm:text-base text-text-secondary flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {sessionDate}
                </p>
                <p className="text-[10px] sm:text-xs text-text-muted font-mono mt-2 bg-nhs-pale-grey/50 px-2 sm:px-3 py-1 rounded-full inline-block">
                  {t('summary.sessionId', 'Session ID')}: {session?.id?.slice(0, 8) || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="group inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 min-h-[48px] bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2 text-sm sm:text-base"
                >
                  <PrintIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('summary.print', 'Print Summary')}
                </button>
                <button
                  onClick={() => navigator.share?.({
                    title: t('summary.shareTitle'),
                    text: t('summary.shareText'),
                    url: window.location.href,
                  }).catch(() => {})}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 min-h-[48px] border-2 border-nhs-blue text-nhs-blue font-bold rounded-xl hover:bg-nhs-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2 text-sm sm:text-base"
                >
                  <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('summary.share', 'Share')}
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Progress Overview - Visual summary of session */}
        <section className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg print:mb-4 print-keep-together" aria-labelledby="progress-heading">
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-nhs-blue/5 to-transparent border-b border-nhs-pale-grey print:bg-gray-50">
            <h2 id="progress-heading" className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
              <ProgressIcon className="w-5 h-5 text-nhs-blue" />
              {t('summary.progressOverview.title', 'Your Journey Progress')}
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <ProgressCard
                icon={<TreatmentIcon className="w-5 h-5" />}
                value={`${progressStats.treatmentsViewed}/${progressStats.totalTreatments}`}
                label={t('summary.progressOverview.treatmentsExplored')}
                color="blue"
                percentage={progressStats.treatmentPercentage}
              />
              <ProgressCard
                icon={<HeartIcon className="w-5 h-5" />}
                value={progressStats.topPriorities.toString()}
                label={t('summary.progressOverview.valuesIdentified')}
                color="pink"
              />
              <ProgressCard
                icon={<QuestionIcon className="w-5 h-5" />}
                value={progressStats.questionsCount.toString()}
                label={t('summary.progressOverview.questionsReady')}
                color="yellow"
              />
              <ProgressCard
                icon={<CheckCircleIcon className="w-5 h-5" />}
                value={progressStats.hasCompletedValues && progressStats.hasExploredTreatments ? t('summary.completionBadge') : t('summary.explorationBadge')}
                label=""
                color="green"
                isBadge
              />
            </div>
          </div>
        </section>

        {/* Journey Stage Section */}
        <section className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg summary-section print-keep-together" aria-labelledby="journey-heading">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-nhs-blue/5 to-transparent border-b border-nhs-pale-grey summary-section-header">
            <h2 id="journey-heading" className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-nhs-blue/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <JourneyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-blue" />
              </div>
              {t('summary.sections.journey', 'Your Journey Stage')}
            </h2>
            <Link
              to="/journey"
              className="text-xs sm:text-sm text-nhs-blue hover:bg-nhs-blue/5 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors print:hidden min-h-[44px] touch-manipulation no-underline"
            >
              <EditIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              {t('common.edit', 'Edit')}
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 rounded-lg sm:rounded-xl border-l-4 border-nhs-blue print:bg-gray-50">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-nhs-blue text-white rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md print:shadow-none">
                <StageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-text-primary">
                  {session?.journeyStage
                    ? getJourneyStageLabel(session.journeyStage)
                    : t('summary.notSpecified', 'Not specified')}
                </p>
                {session?.journeyStage && (
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                    {getJourneyStageDescription(session.journeyStage)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Your Priorities Section - Enhanced visualization */}
        <section className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg summary-section print-keep-together" aria-labelledby="priorities-heading">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-nhs-pink/5 to-transparent border-b border-nhs-pale-grey summary-section-header">
            <h2 id="priorities-heading" className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-nhs-pink/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-pink" />
              </div>
              {t('summary.sections.priorities', 'Your Priorities')}
            </h2>
            <Link
              to="/values"
              className="text-xs sm:text-sm text-nhs-blue hover:bg-nhs-blue/5 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors print:hidden min-h-[44px] touch-manipulation no-underline"
            >
              <EditIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              {t('common.edit', 'Edit')}
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            {sortedPriorities.length > 0 ? (
              <div className="space-y-3">
                {sortedPriorities.map((value, index) => (
                  <div key={value.statementId} className="flex items-center gap-3 sm:gap-4">
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                      index < 3 ? 'bg-nhs-green text-white' : 'bg-nhs-pale-grey text-text-primary'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm sm:text-base text-text-primary truncate pr-2">
                          {t(`values.statements.${value.statementId}`, value.statementId)}
                        </span>
                        <span className="text-xs text-text-muted flex-shrink-0">
                          {getValueLabel(value.rating)}
                        </span>
                      </div>
                      <div className="h-2 bg-nhs-pale-grey rounded-full overflow-hidden print-value-bar">
                        <div
                          className="h-full bg-gradient-to-r from-nhs-pink to-nhs-pink/70 rounded-full transition-all duration-500 print-value-bar-fill"
                          style={{ width: `${(value.rating / 5) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={value.rating}
                          aria-valuemin={1}
                          aria-valuemax={5}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-nhs-pale-grey/30 rounded-xl">
                <HeartIcon className="w-10 h-10 mx-auto text-nhs-mid-grey mb-3" />
                <p className="text-sm sm:text-base text-text-secondary">
                  {t('summary.noValues', 'You have not completed the values exercise yet.')}
                </p>
                <Link to="/values" className="inline-flex items-center gap-2 text-nhs-blue hover:underline mt-2 print:hidden text-sm font-medium">
                  {t('summary.completeValues', 'Complete now')}
                  <ForwardIcon className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Treatments Explored Section */}
        <section className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg summary-section print-keep-together" aria-labelledby="treatments-heading">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-nhs-green/5 to-transparent border-b border-nhs-pale-grey summary-section-header">
            <h2 id="treatments-heading" className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-nhs-green/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <TreatmentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-green" />
              </div>
              {t('summary.sections.viewed', 'Treatments Explored')}
            </h2>
            <Link
              to="/treatments"
              className="text-xs sm:text-sm text-nhs-blue hover:bg-nhs-blue/5 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors print:hidden min-h-[44px] touch-manipulation no-underline"
            >
              {t('summary.seeAll', 'See all')}
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            {session?.viewedTreatments && session.viewedTreatments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {session.viewedTreatments.map((treatment) => (
                  <div key={treatment} className="flex items-center gap-3 p-3 border border-nhs-pale-grey rounded-lg print-treatment-card">
                    <div className="w-10 h-10 bg-nhs-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TreatmentIcon className="w-5 h-5 text-nhs-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-text-primary block truncate">
                        {getTreatmentLabel(treatment)}
                      </span>
                      <span className="text-xs text-nhs-green font-medium flex items-center gap-1 mt-0.5">
                        <CheckIcon className="w-3 h-3" />
                        {t('summary.treatmentInterest.viewed', 'Explored')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-nhs-pale-grey/30 rounded-xl">
                <TreatmentIcon className="w-10 h-10 mx-auto text-nhs-mid-grey mb-3" />
                <p className="text-sm sm:text-base text-text-secondary">
                  {t('summary.noTreatments', 'You have not explored any treatments yet.')}
                </p>
                <Link to="/treatments" className="inline-flex items-center gap-2 text-nhs-blue hover:underline mt-2 print:hidden text-sm font-medium">
                  {t('summary.exploreTreatments', 'Explore treatments')}
                  <ForwardIcon className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Life Goals Compatibility Section - Conditional */}
        {session?.lifeGoals && session.lifeGoals.length > 0 && (
          <LifeGoalsSummarySection
            lifeGoalsData={{ selectedGoals: session.lifeGoals }}
          />
        )}

        {/* Statistics Section - Conditional */}
        {!!(session as unknown as Record<string, unknown>)?.statisticsViewed && (
          <StatisticsSummarySection />
        )}

        {/* Questions Generator - Enhanced decision support component */}
        <div className="mb-4 sm:mb-6 print:mb-4">
          <QuestionsGenerator variant="full" />
        </div>

        {/* Share with Your Kidney Team Section */}
        <section className="bg-gradient-to-r from-nhs-blue/5 to-nhs-aqua-green/5 border-2 border-nhs-blue/20 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden print:border-gray-300 print:rounded-lg print-share-section print-keep-together" aria-labelledby="share-team-heading">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="text-center md:text-left">
              <h2 id="share-team-heading" className="text-lg sm:text-xl font-bold text-text-primary mb-2 flex items-center justify-center md:justify-start gap-2">
                <TeamIcon className="w-6 h-6 text-nhs-blue" />
                {t('summary.shareWithTeam.title', 'Share with Your Kidney Team')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary mb-5">
                {t('summary.shareWithTeam.description', 'Take this summary to your next appointment. Your kidney care team can help you discuss your options and answer your questions.')}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start print:hidden">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] bg-nhs-blue text-white font-semibold rounded-xl hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-2 focus:ring-focus shadow-sm text-sm sm:text-base"
                >
                  <PrintIcon className="w-5 h-5" />
                  {t('summary.printOrSave', 'Print / Save as PDF')}
                </button>
                <button
                  onClick={() => navigator.share?.({
                    title: t('summary.shareTitle', 'My Kidney Treatment Summary'),
                    text: t('summary.shareText', 'Check out this kidney treatment decision tool'),
                    url: window.location.origin,
                  }).catch(() => {})}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue/5 transition-colors focus:outline-none focus:ring-2 focus:ring-focus text-sm sm:text-base"
                >
                  <ShareIcon className="w-5 h-5" />
                  {t('summary.shareToDevice', 'Share to Device')}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] border-2 border-nhs-pale-grey text-text-secondary font-medium rounded-xl hover:bg-nhs-pale-grey/20 transition-colors focus:outline-none focus:ring-2 focus:ring-focus text-sm sm:text-base"
                >
                  {linkCopied ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-nhs-green" />
                      {t('summary.linkCopied', 'Link copied!')}
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      {t('summary.copyLink', 'Copy Link')}
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-4 print:hidden">
                {t('summary.shareWithTeam.saveHint', 'Tip: Use "Print / Save as PDF" to download a copy to your device')}
              </p>
              <p className="text-xs text-text-muted mt-3 hidden print:block">
                {t('summary.shareWithTeam.printTip', 'Printed from the NHS Kidney Treatment Decision Aid')}
              </p>
            </div>
          </div>
        </section>

        {/* What Others Chose - Anonymized statistics */}
        <div className="mb-4 sm:mb-6 print:mb-4 print:hidden">
          <WhatOthersChose variant="full" />
        </div>

        {/* Family Discussion Prompts */}
        <div className="mb-4 sm:mb-6 print:mb-4">
          <FamilyDiscussionPrompts variant="compact" />
        </div>

        {/* Carer Support Section - Only shown in companion mode */}
        {isCarer && (
          <section className="bg-gradient-to-br from-nhs-pink/5 via-nhs-purple/5 to-white border border-nhs-pink/20 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg summary-section print-keep-together" aria-labelledby="carer-support-heading">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-nhs-pink/10 to-transparent border-b border-nhs-pink/20">
              <h2 id="carer-support-heading" className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-nhs-pink/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-pink" />
                </div>
                {t('summary.carer.title', 'Support for You')}
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-text-secondary mb-4 leading-relaxed">
                {t('summary.carer.description', 'As a carer or family member, you deserve support too. Here are resources to help you on this journey.')}
              </p>
              <div className="flex flex-wrap gap-3 print:hidden">
                <Link
                  to="/support-networks"
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-nhs-pink text-white text-sm font-semibold rounded-xl hover:bg-nhs-pink/90 active:scale-[0.98] transition-all shadow-sm"
                >
                  <TeamIcon className="w-4 h-4" />
                  {t('summary.carer.findSupport', 'Find Support Networks')}
                </Link>
                <a
                  href="https://www.carersuk.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white border border-nhs-pink/30 text-nhs-pink text-sm font-semibold rounded-xl hover:bg-nhs-pink/5 active:scale-[0.98] transition-all"
                >
                  {t('summary.carer.carersUK', 'Carers UK')}
                </a>
                <a
                  href="https://www.kidneycareuk.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white border border-nhs-blue/30 text-nhs-blue text-sm font-semibold rounded-xl hover:bg-nhs-blue/5 active:scale-[0.98] transition-all"
                >
                  {t('summary.carer.kidneyCareUK', 'Kidney Care UK')}
                </a>
              </div>
              {/* Print version links */}
              <div className="hidden print:block text-sm text-text-secondary">
                <p className="font-semibold mb-2">{t('summary.carer.printLinks', 'Useful websites:')}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Carers UK: www.carersuk.org</li>
                  <li>Kidney Care UK: www.kidneycareuk.org</li>
                  <li>Carers Trust: www.carers.org</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Next Steps Section */}
        <section className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg summary-section print-keep-together" aria-labelledby="nextsteps-heading">
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-nhs-aqua-green/10 to-transparent border-b border-nhs-pale-grey summary-section-header">
            <h2 id="nextsteps-heading" className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-nhs-aqua-green/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <NextStepsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-aqua-green" />
              </div>
              {t('summary.sections.nextSteps', 'Suggested Next Steps')}
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <ol className="space-y-4" role="list">
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-7 h-7 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-text-primary">
                    {t('summary.step1.title', 'Review this summary')}
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                    {t('summary.step1.description')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-7 h-7 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-text-primary">
                    {t('summary.step2.title', 'Share with family or carers')}
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                    {t('summary.step2.description')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 sm:gap-4">
                <span className="w-7 h-7 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-text-primary">
                    {t('summary.step3.title', 'Discuss with your kidney care team')}
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                    {t('summary.step3.description')}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Privacy and Disclaimer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print-two-column">
          {/* Privacy Reminder */}
          <div className="bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 border border-nhs-blue/20 rounded-xl p-4 flex items-start gap-3 print-info-box print-keep-together">
            <LockIcon className="w-6 h-6 text-nhs-blue flex-shrink-0" />
            <div>
              <p className="font-bold text-text-primary text-sm sm:text-base">
                {t('summary.privacy.title', 'Your Privacy')}
              </p>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                {t('summary.privacy.text')}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gradient-to-r from-nhs-warm-yellow/10 to-nhs-orange/10 border-l-4 border-nhs-warm-yellow rounded-xl p-4 flex items-start gap-3 print-warning-box print-keep-together">
            <WarningIcon className="w-6 h-6 text-nhs-orange flex-shrink-0" />
            <div>
              <p className="font-bold text-text-primary text-sm sm:text-base">
                {t('summary.disclaimer.title', 'Important Reminder')}
              </p>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                {t('summary.disclaimer.text')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-r from-nhs-green/10 to-nhs-green/5 rounded-xl sm:rounded-2xl p-5 sm:p-8 mb-6 text-center print:hidden">
          <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">{t('summary.readyForAppointment', 'Ready for Your Appointment?')}</h3>
          <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">{t('summary.saveInstructions', 'Save or print this summary to bring with you.')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 min-h-[48px] bg-gradient-to-r from-nhs-green to-nhs-green-dark text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
            >
              <PrintIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              {t('summary.printOrSave', 'Print / Save as PDF')}
            </button>
            <button
              onClick={() => navigator.share?.({
                title: t('summary.shareTitle', 'My Kidney Treatment Summary'),
                text: t('summary.shareText', 'Check out this kidney treatment decision tool'),
                url: window.location.origin,
              }).catch(() => {})}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 min-h-[48px] border-2 border-nhs-green text-nhs-green-dark font-bold text-base sm:text-lg rounded-xl hover:bg-nhs-green/10 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
            >
              <ShareIcon className="w-5 h-5" />
              {t('summary.shareToDevice', 'Share to Device')}
            </button>
          </div>
        </div>

        {/* Start Over Button */}
        <div className="text-center print:hidden">
          <button
            onClick={handleStartOver}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 min-h-[48px] text-nhs-red hover:bg-nhs-red/5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-focus text-sm sm:text-base"
          >
            <RefreshIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('summary.startOver', 'Start Over')}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-nhs-pale-grey shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 print:hidden mt-6"
          aria-label={t('accessibility.pageNavigation')}
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/hub')}
              className="inline-flex items-center justify-center gap-2 text-nhs-blue hover:bg-nhs-blue/5 px-4 py-2 min-h-[44px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus text-sm sm:text-base w-full sm:w-auto"
            >
              <BackIcon className="w-4 h-4" />
              {t('nav.backToHub', 'Back to Hub')}
            </button>
            <span className="text-nhs-pale-grey hidden sm:inline">|</span>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 text-text-secondary hover:text-nhs-blue hover:bg-nhs-blue/5 px-4 py-2 min-h-[44px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus text-sm sm:text-base w-full sm:w-auto"
            >
              <HomeIcon className="w-4 h-4" />
              {t('nav.returnToHome', 'Return to Home')}
            </Link>
          </div>
          <Link
            to="/chat"
            className="group inline-flex items-center justify-center gap-2 text-nhs-blue hover:bg-nhs-blue/5 px-4 py-2 min-h-[44px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            {t('summary.askMore', 'Have more questions?')}
            <ForwardIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </nav>

        {/* Print Footer */}
        <div className="hidden print:block print:mt-6 print-nhs-footer">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500">
                {t('summary.printHeader.footer', { date: sessionDate })}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {t('summary.accessibleFormat', 'Need this in a different format? Ask your kidney team.')}
              </p>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              {session?.id?.slice(0, 8) || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface ProgressCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: 'blue' | 'pink' | 'yellow' | 'green';
  percentage?: number;
  isBadge?: boolean;
}

function ProgressCard({ icon, value, label, color, percentage, isBadge }: ProgressCardProps) {
  const colorClasses = {
    blue: 'bg-nhs-blue/10 text-nhs-blue',
    pink: 'bg-nhs-pink/10 text-nhs-pink',
    yellow: 'bg-nhs-warm-yellow/10 text-nhs-warm-yellow',
    green: 'bg-nhs-green/10 text-nhs-green',
  };

  return (
    <div className={`p-3 sm:p-4 rounded-xl ${colorClasses[color]} print:bg-gray-50`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        {!isBadge && (
          <span className="text-lg sm:text-xl font-bold">{value}</span>
        )}
      </div>
      {isBadge ? (
        <span className="text-xs sm:text-sm font-semibold">{value}</span>
      ) : (
        <p className="text-[10px] sm:text-xs text-text-secondary">{label}</p>
      )}
      {percentage !== undefined && (
        <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-current rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}


/**
 * Life Goals summary section component.
 * Shows the user's selected life goals and top compatible treatments.
 */
function LifeGoalsSummarySection({ lifeGoalsData }: { lifeGoalsData: { selectedGoals?: string[]; topTreatments?: Array<{ treatment: string; compatibility: string }> } }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg summary-section print-keep-together" aria-labelledby="life-goals-heading">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#78BE20]/10 to-transparent border-b border-nhs-pale-grey summary-section-header text-left focus:outline-none focus:ring-2 focus:ring-focus focus:ring-inset min-h-[48px]"
        aria-expanded={isExpanded}
        aria-controls="life-goals-content"
      >
        <h2 id="life-goals-heading" className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#78BE20]/10 rounded-lg sm:rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#78BE20]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          {t('summary.sections.lifeGoals', 'Life Goals Compatibility')}
        </h2>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div id="life-goals-content" className="p-4 sm:p-6">
          {lifeGoalsData.selectedGoals && lifeGoalsData.selectedGoals.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                {t('summary.lifeGoals.selectedGoals', 'Your Selected Goals')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {lifeGoalsData.selectedGoals.map((goal) => (
                  <span key={goal} className="inline-flex items-center px-3 py-1.5 bg-[#78BE20]/10 text-[#3D6E0E] text-xs sm:text-sm font-medium rounded-full">
                    {t(`lifeGoals.goals.${goal}`, goal)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {lifeGoalsData.topTreatments && lifeGoalsData.topTreatments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                {t('summary.lifeGoals.topCompatible', 'Most Compatible Treatments')}
              </h3>
              <div className="space-y-2">
                {lifeGoalsData.topTreatments.map((item, index) => (
                  <div key={item.treatment} className="flex items-center gap-3 p-3 border border-nhs-pale-grey rounded-lg">
                    <span className="w-7 h-7 bg-[#78BE20] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-text-primary">
                      {t(`summary.treatmentLabels.${item.treatment}`, item.treatment)}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.compatibility === 'high' ? 'bg-nhs-green/10 text-nhs-green' :
                      item.compatibility === 'medium' ? 'bg-nhs-warm-yellow/10 text-amber-700' :
                      'bg-nhs-pale-grey text-text-muted'
                    }`}>
                      {t(`lifeGoals.compatibility.${item.compatibility}`, item.compatibility)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-nhs-pale-grey print:hidden">
            <Link
              to="/life-goals"
              className="inline-flex items-center gap-2 text-nhs-blue hover:underline text-sm font-medium"
            >
              {t('summary.lifeGoals.reviewGoals', 'Review your life goals')}
              <ForwardIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Statistics summary section component.
 * Shows key statistics relevant to the user.
 */
function StatisticsSummarySection() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section className="bg-white border border-nhs-pale-grey rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-sm print:border-gray-300 print:rounded-lg summary-section print-keep-together" aria-labelledby="statistics-heading">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#41B6E6]/10 to-transparent border-b border-nhs-pale-grey summary-section-header text-left focus:outline-none focus:ring-2 focus:ring-focus focus:ring-inset min-h-[48px]"
        aria-expanded={isExpanded}
        aria-controls="statistics-content"
      >
        <h2 id="statistics-heading" className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#41B6E6]/10 rounded-lg sm:rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#41B6E6]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          {t('summary.sections.statistics', 'What Others Chose')}
        </h2>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div id="statistics-content" className="p-4 sm:p-6">
          <p className="text-sm text-text-secondary mb-4">
            {t('summary.statistics.description', 'You reviewed statistics about what other patients in similar situations chose. This information can provide helpful context for your decision.')}
          </p>
          <div className="bg-nhs-pale-grey/30 rounded-xl p-4">
            <p className="text-xs text-text-muted italic">
              {t('summary.statistics.disclaimer', 'Statistics are based on anonymised NHS data and are shown for informational purposes only. Every person is different and your kidney team will help you make the best decision for your individual circumstances.')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-nhs-pale-grey print:hidden">
            <Link
              to="/statistics"
              className="inline-flex items-center gap-2 text-nhs-blue hover:underline text-sm font-medium"
            >
              {t('summary.statistics.reviewStats', 'Review statistics')}
              <ForwardIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

