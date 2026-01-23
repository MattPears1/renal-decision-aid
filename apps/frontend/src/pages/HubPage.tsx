/**
 * @fileoverview Hub page for the NHS Renal Decision Aid.
 * Central navigation hub providing access to all features including
 * treatment information, comparison tools, values exercise, and AI chat.
 *
 * @module pages/HubPage
 * @version 2.6.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 *
 * @requires react-router-dom
 * @requires react-i18next
 * @requires @/context/SessionContext
 * @requires @/components/LearningProgress
 * @requires @/components/ScenarioExplorer
 */

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { useSession, useSessionTimer } from '@/context/SessionContext';
import LearningProgress from '@/components/LearningProgress';
import ScenarioExplorer from '@/components/ScenarioExplorer';
import { DecisionReadinessIndicator, DecisionJournal } from '@/components/decision';

/**
 * Configuration for a hub navigation card.
 * @interface HubCard
 * @property {string} id - Unique card identifier
 * @property {string} titleKey - i18n key for card title
 * @property {string} descriptionKey - i18n key for card description
 * @property {string} href - Navigation target URL
 * @property {string} actionKey - i18n key for action button text
 * @property {React.ReactNode} icon - Icon component
 * @property {string} gradient - CSS gradient classes for card styling
 */
interface HubCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  href: string;
  actionKey: string;
  icon: React.ReactNode;
  gradient: string;
}

const HUB_CARDS: HubCard[] = [
  {
    id: 'treatments',
    titleKey: 'hub.cards.treatments.title',
    descriptionKey: 'hub.cards.treatments.description',
    href: '/treatments',
    actionKey: 'hub.cards.treatments.action',
    icon: <TreatmentsIcon />,
    gradient: 'bg-gradient-to-br from-nhs-blue via-nhs-blue to-nhs-blue-dark',
  },
  {
    id: 'model',
    titleKey: 'hub.cards.model.title',
    descriptionKey: 'hub.cards.model.description',
    href: '/model',
    actionKey: 'hub.cards.model.action',
    icon: <ModelIcon />,
    gradient: 'bg-gradient-to-br from-nhs-aqua-green via-[#00A499] to-[#006653]',
  },
  {
    id: 'compare',
    titleKey: 'hub.cards.compare.title',
    descriptionKey: 'hub.cards.compare.description',
    href: '/compare',
    actionKey: 'hub.cards.compare.action',
    icon: <CompareIcon />,
    gradient: 'bg-gradient-to-br from-nhs-purple via-[#330072] to-[#1a003a]',
  },
  {
    id: 'values',
    titleKey: 'hub.cards.values.title',
    descriptionKey: 'hub.cards.values.description',
    href: '/values',
    actionKey: 'hub.cards.values.action',
    icon: <ValuesIcon />,
    gradient: 'bg-gradient-to-br from-nhs-pink via-[#AE2573] to-[#6d1249]',
  },
  {
    id: 'chat',
    titleKey: 'hub.cards.chat.title',
    descriptionKey: 'hub.cards.chat.description',
    href: '/chat',
    actionKey: 'hub.cards.chat.action',
    icon: <ChatIcon />,
    gradient: 'bg-gradient-to-br from-nhs-orange via-[#ED8B00] to-[#b36800]',
  },
];

/**
 * Hub page component serving as the central navigation point.
 * Displays personalized content based on journey stage, session timer,
 * learning progress, and quick access to all major features.
 *
 * @component
 * @returns {JSX.Element} The rendered hub page
 *
 * @example
 * // Usage in router
 * <Route path="/hub" element={<HubPage />} />
 */
export default function HubPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const { formatted, isWarning, extendSession } = useSessionTimer();
  const [activeNavItem, setActiveNavItem] = useState<string>('home');
  const [isScrolled, setIsScrolled] = useState(false);

  const journeyStage = session?.journeyStage;
  const viewedTreatments = session?.viewedTreatments || [];
  const valueRatings = session?.valueRatings || [];

  // Track scroll position for sticky header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle bottom nav item click with smooth scroll
  const handleNavClick = useCallback((item: string, path?: string) => {
    setActiveNavItem(item);
    if (path) {
      navigate(path);
    } else if (item === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item === 'tools') {
      document.getElementById('content-grid')?.scrollIntoView({ behavior: 'smooth' });
    } else if (item === 'progress') {
      document.getElementById('progress-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [navigate]);

  // Determine card statuses based on session data
  const getCardStatus = (cardId: string): 'new' | 'in-progress' | 'completed' | undefined => {
    switch (cardId) {
      case 'treatments':
        if (viewedTreatments.length >= 4) return 'completed';
        if (viewedTreatments.length > 0) return 'in-progress';
        return 'new';
      case 'values':
        if (valueRatings.length >= 8) return 'completed';
        if (valueRatings.length > 0) return 'in-progress';
        return undefined;
      default:
        return undefined;
    }
  };

  // Get personalized welcome message based on journey stage
  const getWelcomeMessage = () => {
    const stageMessages: Record<string, string> = {
      'newly-diagnosed': 'Based on what you have told us, here are resources to help you understand your kidney condition and explore your options.',
      'monitoring': 'As your kidneys are being monitored, these resources will help you prepare for potential future treatments.',
      'preparing': 'Since you are preparing for treatment soon, here are tools to help you understand and compare your options.',
      'on-dialysis': 'As someone already on dialysis, you may want to explore other treatment options that could work for you.',
      'transplant-waiting': 'While you wait for a transplant, these resources can help you stay informed and prepared.',
      'post-transplant': 'These resources will help you maintain your health and understand your ongoing care after transplant.',
      'supporting-someone': 'Here are resources to help you support your loved one through their kidney treatment journey.',
    };
    return t('hub.welcome.message', stageMessages[journeyStage || 'newly-diagnosed'] || stageMessages['newly-diagnosed']);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-bg-page via-bg-surface/50 to-bg-surface">
      {/* Session Timer Bar - Enhanced with better visual hierarchy */}
      <div
        className={`bg-white/95 backdrop-blur-md border-b border-nhs-pale-grey/80 py-2.5 sm:py-3 px-3 sm:px-4 sticky top-0 z-40 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}
        role="status"
        aria-live="polite"
      >
        <div className="max-w-container-xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
          {/* Session timer with visual indicator */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`relative p-2 rounded-xl transition-all duration-300 ${isWarning ? 'bg-nhs-red/10' : 'bg-nhs-blue/10'}`}>
              <ClockIcon className={isWarning ? 'text-nhs-red' : 'text-nhs-blue'} />
              {isWarning && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-nhs-red rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wide font-medium">
                {t('hub.session.timeRemaining', 'Session time remaining')}
              </span>
              <span className={`font-bold text-sm sm:text-base tabular-nums ${isWarning ? 'text-nhs-red' : 'text-text-primary'}`}>
                {formatted}
              </span>
            </div>
            {isWarning && (
              <button
                onClick={extendSession}
                className="ml-auto sm:ml-3 px-4 py-2 min-h-[40px] bg-nhs-blue text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-nhs-blue-dark active:scale-[0.98] transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
              >
                {t('hub.session.extend', 'Extend session')}
              </button>
            )}
          </div>
          {/* Quick actions - improved styling */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto sm:ml-0">
            <Link
              to="/glossary"
              className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-text-secondary hover:text-nhs-blue hover:bg-nhs-blue/5 transition-all focus:outline-none focus:ring-2 focus:ring-focus rounded-lg px-2.5 sm:px-3 py-2 min-h-[40px]"
            >
              <GlossaryIcon className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-medium">{t('hub.session.glossary', 'Glossary')}</span>
            </Link>
            <span className="text-nhs-pale-grey hidden sm:inline" aria-hidden="true">|</span>
            <Link
              to="/questions"
              className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-nhs-blue hover:text-nhs-blue-dark hover:bg-nhs-blue/5 transition-all focus:outline-none focus:ring-2 focus:ring-focus rounded-lg px-2.5 sm:px-3 py-2 min-h-[40px]"
            >
              <EditIcon className="group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline font-medium">{t('hub.session.updateAnswers', 'Update My Answers')}</span>
              <span className="xs:hidden font-medium">{t('hub.session.update', 'Update')}</span>
            </Link>
            <span className="text-nhs-pale-grey hidden sm:inline" aria-hidden="true">|</span>
            <Link
              to="/"
              className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-text-secondary hover:text-nhs-blue hover:bg-nhs-blue/5 transition-all focus:outline-none focus:ring-2 focus:ring-focus rounded-lg px-2.5 sm:px-3 py-2 min-h-[40px]"
            >
              <HomeIcon className="group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline font-medium">{t('hub.session.startOver', 'Start Over')}</span>
              <span className="xs:hidden font-medium">{t('hub.session.home', 'Home')}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-container-xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 pb-36 sm:pb-32">
        {/* Welcome Section - Enhanced with subtle animation */}
        <section className="mb-6 sm:mb-10 animate-fade-in" aria-labelledby="welcome-heading">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-sm border border-nhs-pale-grey/80 overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-nhs-blue/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-nhs-green/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-nhs-blue/10 to-nhs-green/10 rounded-full text-xs sm:text-sm font-semibold text-nhs-blue mb-4 sm:mb-5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nhs-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-nhs-green" />
                  </span>
                  {t('hub.welcome.badge', 'Your personalised journey')}
                </div>
                <h1 id="welcome-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 sm:mb-5 leading-tight">
                  {t('hub.welcome.title', 'Your Personalised Treatment Options')}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-[700px] leading-relaxed mb-4 sm:mb-5">
                  {getWelcomeMessage()}
                </p>
                <div className="flex items-start gap-3 p-3 bg-nhs-pale-grey/40 rounded-xl">
                  <div className="w-8 h-8 bg-nhs-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <InfoIcon className="w-4 h-4 text-nhs-blue" />
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {t('hub.welcome.reminder', 'Remember, your kidney team will help you make the final decision.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Session Reminder Alert - Enhanced with better visual hierarchy */}
        <div
          className="relative bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border border-nhs-warm-yellow/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-10 flex flex-col sm:flex-row items-start gap-4 shadow-sm overflow-hidden"
          role="alert"
          aria-labelledby="session-alert-title"
        >
          {/* Decorative accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-nhs-warm-yellow to-nhs-orange rounded-l-xl" aria-hidden="true" />

          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-nhs-warm-yellow/20 to-nhs-orange/10 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
            <WarningIcon className="w-5 h-5 sm:w-6 sm:h-6 text-nhs-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text-primary mb-1.5 text-sm sm:text-base" id="session-alert-title">
              {t('hub.alert.title', 'Remember to save your summary')}
            </p>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('hub.alert.message', 'Your information will not be saved after this session. Create a summary before you leave to keep a record of your exploration.')}
            </p>
          </div>
          <Link
            to="/summary"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-nhs-blue to-nhs-blue-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg active:scale-[0.98] transition-all w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0"
          >
            {t('hub.alert.saveNow', 'Save Now')}
            <ChevronRightIcon />
          </Link>
        </div>

        {/* Pathway Selection Section - Enhanced with clearer visual hierarchy */}
        <section className="relative bg-white border border-nhs-pale-grey/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-10 shadow-sm overflow-hidden" aria-labelledby="pathway-heading">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nhs-blue via-nhs-aqua-green to-nhs-green" aria-hidden="true" />

          <div className="text-center mb-6 sm:mb-8">
            <h2 id="pathway-heading" className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
              {t('hub.pathway.title', 'How would you like to explore?')}
            </h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              {t('hub.pathway.subtitle', 'Choose the approach that feels right for you')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" role="list">
            {/* Recommended Journey - Primary CTA */}
            <Link
              to="/treatments"
              className="group relative block bg-gradient-to-br from-nhs-blue/5 via-nhs-blue/10 to-nhs-aqua-green/5 border-2 border-nhs-blue rounded-xl sm:rounded-2xl p-5 sm:p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-nhs-blue-dark focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 overflow-hidden"
              role="listitem"
            >
              {/* Recommended badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-nhs-blue text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-bl-xl">
                  {t('hub.pathway.guided.badge', 'Recommended')}
                </div>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-nhs-blue to-nhs-blue-dark rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                  <ArrowRightIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1">
                    {t('hub.pathway.guided.title', 'Your Recommended Journey')}
                  </h3>
                  <p className="text-xs text-nhs-blue font-medium">
                    {t('hub.pathway.guided.time', 'About 15-20 minutes')}
                  </p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-text-secondary mb-4 leading-relaxed">
                {t('hub.pathway.guided.description', 'Follow a guided step-by-step path through treatment options tailored to your situation. Perfect if you want clear direction and support.')}
              </p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-nhs-blue group-hover:gap-3 transition-all">
                  {t('hub.pathway.guided.action', 'Start guided journey')}
                  <ChevronRightIcon className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="flex -space-x-1">
                  {['bg-nhs-blue', 'bg-nhs-aqua-green', 'bg-nhs-green'].map((color, i) => (
                    <div key={i} className={`w-2 h-2 ${color} rounded-full ring-2 ring-white`} />
                  ))}
                </div>
              </div>
            </Link>

            {/* Explore Freely - Secondary CTA */}
            <a
              href="#content-grid"
              className="group relative block bg-white border-2 border-nhs-pale-grey rounded-xl sm:rounded-2xl p-5 sm:p-6 text-left transition-all duration-300 hover:border-nhs-blue hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 overflow-hidden"
              role="listitem"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('content-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-nhs-pale-grey to-nhs-mid-grey/30 group-hover:from-nhs-blue/20 group-hover:to-nhs-blue/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <GridIcon className="w-6 h-6 sm:w-7 sm:h-7 text-nhs-dark-grey group-hover:text-nhs-blue transition-colors" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1">
                    {t('hub.pathway.free.title', 'Explore Freely')}
                  </h3>
                  <p className="text-xs text-text-muted font-medium">
                    {t('hub.pathway.free.time', 'At your own pace')}
                  </p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-text-secondary mb-4 leading-relaxed">
                {t('hub.pathway.free.description', 'Browse all options at your own pace. Jump directly to topics that interest you. Ideal if you already know what you are looking for.')}
              </p>
              <span className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-nhs-blue group-hover:gap-3 transition-all">
                {t('hub.pathway.free.action', 'Browse all options')}
                <ChevronRightIcon className="group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>
        </section>

        {/* Decision Readiness and Progress Section - Enhanced with IDs for navigation */}
        <section id="progress-section" className="space-y-4 sm:space-y-6 mb-6 sm:mb-10 scroll-mt-20">
          {/* Decision Readiness Indicator - Full width on top */}
          <div className="animate-fade-in">
            <DecisionReadinessIndicator variant="full" />
          </div>

          {/* Learning Progress and Scenario Explorer - Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Learning Progress */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <LearningProgress variant="full" showEncouragement />
            </div>

            {/* Scenario Explorer */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <ScenarioExplorer compact />
            </div>
          </div>

          {/* Decision Journal - Compact view */}
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <DecisionJournal variant="compact" />
          </div>
        </section>

        {/* Content Grid Section - Enhanced Cards with better visual hierarchy */}
        <section id="content-grid" className="mb-6 sm:mb-10 scroll-mt-20" aria-labelledby="content-heading">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <div>
              <h2 id="content-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary">
                {t('hub.content.title', 'Tools to Help You Decide')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary mt-1.5">{t('hub.content.subtitle', 'Explore each tool to make an informed decision')}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted bg-nhs-pale-grey/50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-nhs-green rounded-full" />
              <span>{viewedTreatments.length > 0 ? t('hub.content.progress', '{{count}} tools explored', { count: viewedTreatments.length }) : t('hub.content.start', 'Start exploring')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" role="list">
            {HUB_CARDS.map((card, index) => {
              const status = getCardStatus(card.id);
              return (
                <article
                  key={card.id}
                  className="group relative bg-white border border-nhs-pale-grey/80 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-transparent focus-within:ring-4 focus-within:ring-focus animate-fade-in"
                  style={{ animationDelay: `${index * 75}ms` }}
                  role="listitem"
                >
                  {/* Card Header with gradient */}
                  <div className={`relative h-32 sm:h-40 ${card.gradient} flex items-center justify-center overflow-hidden`} aria-hidden="true">
                    {/* Animated decorative elements */}
                    <div className="absolute -top-12 -right-12 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute -bottom-8 -left-8 w-24 sm:w-28 h-24 sm:h-28 bg-white/5 rounded-full transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* Icon */}
                    <div className="relative w-14 h-14 sm:w-18 sm:h-18 text-white opacity-95 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg">
                      {card.icon}
                    </div>

                    {/* Status badge positioned in corner */}
                    {status && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <StatusBadge status={status} variant="card" />
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex flex-col min-h-[160px] sm:min-h-[180px]">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 leading-tight">
                      <Link
                        to={card.href}
                        className="text-text-primary hover:text-nhs-blue transition-colors focus:outline-none focus:ring-2 focus:ring-focus rounded inline-block"
                      >
                        {t(card.titleKey,
                          card.id === 'treatments' ? 'Treatment Options' :
                          card.id === 'model' ? '3D Kidney Model' :
                          card.id === 'compare' ? 'Compare Treatments' :
                          card.id === 'values' ? 'Values Exercise' :
                          'Ask Questions'
                        )}
                      </Link>
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4 sm:mb-5 flex-1 line-clamp-3">
                      {t(card.descriptionKey,
                        card.id === 'treatments' ? 'Learn about all available kidney treatment options including dialysis types, transplant, and conservative care.' :
                        card.id === 'model' ? 'Explore interactive 3D models showing how different treatments work in your body. See the process visually.' :
                        card.id === 'compare' ? 'See all treatments side by side. Compare what matters to you - from daily time to travel flexibility.' :
                        card.id === 'values' ? 'Think about what matters most to you. This exercise helps clarify your priorities to guide your decision.' :
                        'Chat with our AI assistant about kidney treatment options. Get answers to your questions in a conversational way.'
                      )}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-nhs-pale-grey/60">
                      <div className="flex-shrink-0">
                        {status && <StatusBadge status={status} />}
                      </div>
                      <Link
                        to={card.href}
                        className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] bg-nhs-blue/10 text-nhs-blue text-sm font-semibold rounded-xl transition-all duration-200 group-hover:bg-nhs-blue group-hover:text-white group-hover:shadow-lg active:scale-[0.98]"
                      >
                        {t(card.actionKey,
                          card.id === 'treatments' ? 'Explore' :
                          card.id === 'model' ? 'View Model' :
                          card.id === 'compare' ? 'Compare' :
                          card.id === 'values' ? (status === 'in-progress' ? 'Continue' : 'Start') :
                          'Start Chat'
                        )}
                        <ChevronRightIcon className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* View Summary Section - Enhanced with better visual appeal */}
        <section className="relative bg-gradient-to-br from-nhs-green via-[#00855A] to-[#006644] text-white p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl mb-6 sm:mb-10 overflow-hidden shadow-2xl" aria-labelledby="summary-heading">
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-56 sm:w-72 h-56 sm:h-72 bg-white/5 rounded-full blur-xl" />
            <div className="absolute -bottom-20 -left-20 w-40 sm:w-56 h-40 sm:h-56 bg-white/5 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-5">
                <CheckBadgeIcon className="w-4 h-4" />
                <span>{t('hub.summary.badge', 'Final Step')}</span>
              </div>
              <h2 id="summary-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white leading-tight">
                {t('hub.summary.title', 'Ready to Review Your Journey?')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-lg leading-relaxed">
                {t('hub.summary.description', 'View everything you have explored and create a summary to share with your kidney team at your next appointment.')}
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link
                to="/summary"
                className="group inline-flex items-center justify-center gap-3 w-full md:w-auto px-6 sm:px-8 py-3.5 sm:py-4 min-h-[52px] bg-white text-nhs-green font-bold text-base sm:text-lg rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-nhs-green"
              >
                <SummaryIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                {t('hub.summary.button', 'View Your Summary')}
                <ChevronRightIcon className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Bottom Navigation - Enhanced with multiple actions */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-nhs-pale-grey shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 print:hidden safe-area-inset-bottom"
        aria-label={t('hub.nav.mobileLabel', 'Quick navigation')}
      >
        {/* Desktop view - single CTA */}
        <div className="hidden sm:block max-w-container-xl mx-auto px-4 py-3">
          <div className="flex justify-center">
            <Link
              to="/summary"
              className="group inline-flex items-center justify-center gap-3 px-10 py-3.5 min-h-[50px] bg-gradient-to-r from-nhs-blue to-nhs-blue-dark text-white font-bold text-base rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
            >
              <SummaryIcon className="w-5 h-5" />
              {t('hub.quickAction.summary', 'View Your Summary')}
              <ChevronRightIcon className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Mobile view - bottom navigation bar */}
        <div className="sm:hidden">
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all min-h-[56px] ${
                activeNavItem === 'home'
                  ? 'bg-nhs-blue/10 text-nhs-blue'
                  : 'text-text-muted hover:text-nhs-blue hover:bg-nhs-blue/5'
              }`}
              aria-label={t('hub.nav.home', 'Home')}
            >
              <HomeNavIcon className={`w-5 h-5 mb-1 ${activeNavItem === 'home' ? 'text-nhs-blue' : ''}`} />
              <span className="text-[10px] font-semibold">{t('hub.nav.home', 'Home')}</span>
            </button>

            <button
              onClick={() => handleNavClick('tools')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all min-h-[56px] ${
                activeNavItem === 'tools'
                  ? 'bg-nhs-blue/10 text-nhs-blue'
                  : 'text-text-muted hover:text-nhs-blue hover:bg-nhs-blue/5'
              }`}
              aria-label={t('hub.nav.tools', 'Tools')}
            >
              <ToolsNavIcon className={`w-5 h-5 mb-1 ${activeNavItem === 'tools' ? 'text-nhs-blue' : ''}`} />
              <span className="text-[10px] font-semibold">{t('hub.nav.tools', 'Tools')}</span>
            </button>

            <button
              onClick={() => handleNavClick('progress')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all min-h-[56px] ${
                activeNavItem === 'progress'
                  ? 'bg-nhs-blue/10 text-nhs-blue'
                  : 'text-text-muted hover:text-nhs-blue hover:bg-nhs-blue/5'
              }`}
              aria-label={t('hub.nav.progress', 'Progress')}
            >
              <ProgressNavIcon className={`w-5 h-5 mb-1 ${activeNavItem === 'progress' ? 'text-nhs-blue' : ''}`} />
              <span className="text-[10px] font-semibold">{t('hub.nav.progress', 'Progress')}</span>
            </button>

            <Link
              to="/summary"
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-nhs-green text-white min-h-[56px] active:scale-[0.95] transition-transform"
              aria-label={t('hub.nav.summary', 'Summary')}
            >
              <SummaryNavIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-semibold">{t('hub.nav.summary', 'Summary')}</span>
            </Link>
          </div>
        </div>
      </nav>
    </main>
  );
}

// Status Badge Component - Enhanced with variant support
function StatusBadge({ status, variant = 'default' }: { status: 'new' | 'in-progress' | 'completed'; variant?: 'default' | 'card' }) {
  const { t } = useTranslation();

  const config = {
    new: {
      bg: variant === 'card' ? 'bg-white/90 backdrop-blur-sm' : 'bg-nhs-blue/10',
      text: 'text-nhs-blue',
      label: t('hub.status.new', 'New'),
      icon: <InfoBadgeIcon />,
    },
    'in-progress': {
      bg: variant === 'card' ? 'bg-white/90 backdrop-blur-sm' : 'bg-amber-50',
      text: 'text-amber-700',
      label: t('hub.status.inProgress', 'In Progress'),
      icon: <InProgressIcon />,
    },
    completed: {
      bg: variant === 'card' ? 'bg-white/90 backdrop-blur-sm' : 'bg-nhs-green/10',
      text: 'text-nhs-green',
      label: t('hub.status.completed', 'Completed'),
      icon: <CheckBadgeIcon />,
    },
  };

  const { bg, text, label, icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${bg} ${text} text-xs font-semibold rounded-full shadow-sm`}>
      <span className="w-3.5 h-3.5">{icon}</span>
      {label}
    </span>
  );
}

// Icon Components - Updated with className support
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-5 h-5'} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-4 h-4'} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-4 h-4'} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    </svg>
  );
}

function SummaryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );
}

function TreatmentsIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );
}

function ModelIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 3H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 8H4V5h6v6zm10-8h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 8h-6V5h6v6zM10 13H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zm0 8H4v-6h6v6zm10-8h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zm0 8h-6v-6h6v6z"/>
    </svg>
  );
}

function ValuesIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
    </svg>
  );
}

function InfoBadgeIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/>
    </svg>
  );
}

function InProgressIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

function CheckBadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-full h-full'} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-4 h-4'} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function GlossaryIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-4 h-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

// Mobile Navigation Icons
function HomeNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function ToolsNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
    </svg>
  );
}

function ProgressNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
    </svg>
  );
}

function SummaryNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}
