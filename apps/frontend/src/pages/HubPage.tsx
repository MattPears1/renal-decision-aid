import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession, useSessionTimer } from '@/context/SessionContext';

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
    gradient: 'bg-gradient-to-br from-nhs-blue to-nhs-blue-dark',
  },
  {
    id: 'model',
    titleKey: 'hub.cards.model.title',
    descriptionKey: 'hub.cards.model.description',
    href: '/model',
    actionKey: 'hub.cards.model.action',
    icon: <ModelIcon />,
    gradient: 'bg-gradient-to-br from-[#00A499] to-[#006653]',
  },
  {
    id: 'compare',
    titleKey: 'hub.cards.compare.title',
    descriptionKey: 'hub.cards.compare.description',
    href: '/compare',
    actionKey: 'hub.cards.compare.action',
    icon: <CompareIcon />,
    gradient: 'bg-gradient-to-br from-[#330072] to-[#1a003a]',
  },
  {
    id: 'values',
    titleKey: 'hub.cards.values.title',
    descriptionKey: 'hub.cards.values.description',
    href: '/values',
    actionKey: 'hub.cards.values.action',
    icon: <ValuesIcon />,
    gradient: 'bg-gradient-to-br from-[#AE2573] to-[#6d1249]',
  },
  {
    id: 'chat',
    titleKey: 'hub.cards.chat.title',
    descriptionKey: 'hub.cards.chat.description',
    href: '/chat',
    actionKey: 'hub.cards.chat.action',
    icon: <ChatIcon />,
    gradient: 'bg-gradient-to-br from-[#ED8B00] to-[#b36800]',
  },
];

export default function HubPage() {
  const { t } = useTranslation();
  const { session } = useSession();
  const { formatted, isWarning, extendSession } = useSessionTimer();

  const journeyStage = session?.journeyStage;
  const viewedTreatments = session?.viewedTreatments || [];
  const valueRatings = session?.valueRatings || [];

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
    <main className="min-h-screen bg-gradient-to-b from-bg-page to-bg-surface">
      {/* Session Timer Bar - Enhanced */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-nhs-pale-grey py-3 px-4 sticky top-0 z-40" role="status" aria-live="polite">
        <div className="max-w-container-xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <div className={`flex items-center gap-2 text-sm ${isWarning ? 'text-nhs-red' : 'text-text-secondary'}`}>
            <div className={`p-1.5 rounded-full ${isWarning ? 'bg-nhs-red/10' : 'bg-nhs-blue/10'}`}>
              <ClockIcon />
            </div>
            <span>
              {t('hub.session.timeRemaining', 'Session time remaining:')}
              <span className={`font-bold ml-1 ${isWarning ? 'text-nhs-red' : 'text-text-primary'}`}>
                {formatted}
              </span>
            </span>
            {isWarning && (
              <button
                onClick={extendSession}
                className="ml-2 px-3 py-1 bg-nhs-blue text-white text-xs font-semibold rounded-full hover:bg-nhs-blue-dark transition-colors"
              >
                {t('hub.session.extend', 'Extend session')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/questions"
              className="flex items-center gap-2 text-sm text-nhs-blue hover:text-nhs-blue-dark transition-colors focus:outline-none focus:ring-2 focus:ring-focus rounded px-2 py-1"
            >
              <EditIcon />
              {t('hub.session.updateAnswers', 'Update My Answers')}
            </Link>
            <span className="text-nhs-pale-grey">|</span>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-nhs-blue transition-colors focus:outline-none focus:ring-2 focus:ring-focus rounded px-2 py-1"
            >
              <HomeIcon />
              {t('hub.session.startOver', 'Start Over')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-container-xl mx-auto px-4 py-8 md:py-12 pb-32">
        {/* Welcome Section - Enhanced */}
        <section className="mb-10" aria-labelledby="welcome-heading">
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-nhs-pale-grey">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-nhs-blue/10 rounded-full text-sm font-medium text-nhs-blue mb-4">
                  <span className="w-2 h-2 bg-nhs-green rounded-full animate-pulse" />
                  {t('hub.welcome.badge', 'Your personalised journey')}
                </div>
                <h1 id="welcome-heading" className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  {t('hub.welcome.title', 'Your Personalised Treatment Options')}
                </h1>
                <p className="text-lg text-text-secondary max-w-[700px] leading-relaxed mb-4">
                  {getWelcomeMessage()}
                </p>
                <p className="text-sm text-text-muted flex items-center gap-2">
                  <InfoIcon className="w-4 h-4" />
                  {t('hub.welcome.reminder', 'Remember, your kidney team will help you make the final decision.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Session Reminder Alert - Enhanced */}
        <div
          className="bg-gradient-to-r from-nhs-warm-yellow/10 to-nhs-orange/10 border-l-4 border-nhs-warm-yellow rounded-xl p-5 mb-10 flex items-start gap-4 shadow-sm"
          role="alert"
          aria-labelledby="session-alert-title"
        >
          <div className="w-10 h-10 bg-nhs-warm-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
            <WarningIcon className="w-5 h-5 text-nhs-orange" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary mb-1" id="session-alert-title">
              {t('hub.alert.title', 'Remember to save your summary')}
            </p>
            <p className="text-sm text-text-secondary">
              {t('hub.alert.message', 'Your information will not be saved after this session. Create a summary before you leave to keep a record of your exploration.')}
            </p>
          </div>
          <Link to="/summary" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-nhs-blue text-white text-sm font-semibold rounded-lg hover:bg-nhs-blue-dark transition-colors flex-shrink-0">
            {t('hub.alert.saveNow', 'Save Now')}
            <ChevronRightIcon />
          </Link>
        </div>

        {/* Pathway Selection Section - Enhanced */}
        <section className="bg-white border border-nhs-pale-grey rounded-2xl p-6 md:p-8 mb-10 shadow-sm" aria-labelledby="pathway-heading">
          <h2 id="pathway-heading" className="text-xl font-bold text-center mb-6">
            {t('hub.pathway.title', 'How would you like to explore?')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
            {/* Recommended Journey */}
            <Link
              to="/treatments"
              className="group block bg-nhs-blue/5 border-2 border-nhs-blue rounded-lg p-6 text-left transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
              role="listitem"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-nhs-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowRightIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary">
                    {t('hub.pathway.guided.title', 'Your Recommended Journey')}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-nhs-blue text-white text-xs font-semibold rounded uppercase">
                  {t('hub.pathway.guided.badge', 'Recommended')}
                </span>
              </div>
              <p className="text-base text-text-secondary mb-3 leading-relaxed">
                {t('hub.pathway.guided.description', 'Follow a guided step-by-step path through treatment options tailored to your situation. Perfect if you want clear direction and support.')}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-nhs-blue group-hover:underline">
                {t('hub.pathway.guided.action', 'Start guided journey')}
                <ChevronRightIcon />
              </span>
            </Link>

            {/* Explore Freely */}
            <a
              href="#content-grid"
              className="group block bg-white border-2 border-nhs-pale-grey rounded-lg p-6 text-left transition-all hover:border-nhs-blue hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
              role="listitem"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-nhs-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <GridIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">
                  {t('hub.pathway.free.title', 'Explore Freely')}
                </h3>
              </div>
              <p className="text-base text-text-secondary mb-3 leading-relaxed">
                {t('hub.pathway.free.description', 'Browse all options at your own pace. Jump directly to topics that interest you. Ideal if you already know what you are looking for.')}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-nhs-blue group-hover:underline">
                {t('hub.pathway.free.action', 'Browse all options')}
                <ChevronRightIcon />
              </span>
            </a>
          </div>
        </section>

        {/* Content Grid Section - Enhanced Cards */}
        <section id="content-grid" className="mb-10" aria-labelledby="content-heading">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 id="content-heading" className="text-2xl md:text-3xl font-bold text-text-primary">
                {t('hub.content.title', 'Tools to Help You Decide')}
              </h2>
              <p className="text-text-secondary mt-1">{t('hub.content.subtitle', 'Explore each tool to make an informed decision')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {HUB_CARDS.map((card) => {
              const status = getCardStatus(card.id);
              return (
                <article
                  key={card.id}
                  className="group bg-white border border-nhs-pale-grey rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent focus-within:ring-4 focus-within:ring-focus"
                  role="listitem"
                >
                  {/* Card Image - Enhanced with overlay effect */}
                  <div className={`h-40 ${card.gradient} flex items-center justify-center relative overflow-hidden`} aria-hidden="true">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full" />

                    <div className="w-16 h-16 text-white opacity-95 transform transition-transform duration-300 group-hover:scale-110">
                      {card.icon}
                    </div>
                    {status && (
                      <span className="absolute top-4 right-4">
                        <StatusBadge status={status} />
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col h-[calc(100%-160px)]">
                    <h3 className="text-xl font-bold mb-3">
                      <Link
                        to={card.href}
                        className="text-text-primary hover:text-nhs-blue transition-colors focus:outline-none focus:ring-2 focus:ring-focus rounded"
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
                    <p className="text-sm text-text-secondary leading-relaxed mb-5 flex-1">
                      {t(card.descriptionKey,
                        card.id === 'treatments' ? 'Learn about all available kidney treatment options including dialysis types, transplant, and conservative care.' :
                        card.id === 'model' ? 'Explore interactive 3D models showing how different treatments work in your body. See the process visually.' :
                        card.id === 'compare' ? 'See all treatments side by side. Compare what matters to you - from daily time to travel flexibility.' :
                        card.id === 'values' ? 'Think about what matters most to you. This exercise helps clarify your priorities to guide your decision.' :
                        'Chat with our AI assistant about kidney treatment options. Get answers to your questions in a conversational way.'
                      )}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-nhs-pale-grey">
                      {status ? <StatusBadge status={status} /> : <span />}
                      <Link
                        to={card.href}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-nhs-blue/10 text-nhs-blue text-sm font-semibold rounded-lg transition-all group-hover:bg-nhs-blue group-hover:text-white"
                      >
                        {t(card.actionKey,
                          card.id === 'treatments' ? 'Explore' :
                          card.id === 'model' ? 'View Model' :
                          card.id === 'compare' ? 'Compare' :
                          card.id === 'values' ? (status === 'in-progress' ? 'Continue' : 'Start') :
                          'Start Chat'
                        )}
                        <ChevronRightIcon />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* View Summary Section - Enhanced */}
        <section className="relative bg-gradient-to-br from-nhs-green via-nhs-green to-[#006747] text-white p-8 md:p-12 rounded-2xl mb-10 overflow-hidden shadow-xl" aria-labelledby="summary-heading">
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                <CheckBadgeIcon />
                <span>{t('hub.summary.badge', 'Final Step')}</span>
              </div>
              <h2 id="summary-heading" className="text-2xl md:text-3xl font-bold mb-3 text-white">
                {t('hub.summary.title', 'Ready to Review Your Journey?')}
              </h2>
              <p className="text-lg text-white/90 max-w-lg">
                {t('hub.summary.description', 'View everything you have explored and create a summary to share with your kidney team at your next appointment.')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/summary"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-nhs-green font-bold text-lg rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2 focus:ring-offset-nhs-green"
              >
                <SummaryIcon className="w-6 h-6" />
                {t('hub.summary.button', 'View Your Summary')}
                <ChevronRightIcon />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Actions Bar (Fixed) - Enhanced */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-nhs-pale-grey py-4 shadow-2xl z-50 print:hidden">
        <div className="max-w-container-xl mx-auto px-4 flex justify-center">
          <Link
            to="/summary"
            className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-nhs-blue to-nhs-blue-dark text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
          >
            <SummaryIcon className="w-5 h-5" />
            {t('hub.quickAction.summary', 'View Your Summary')}
            <ChevronRightIcon />
          </Link>
        </div>
      </div>
    </main>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: 'new' | 'in-progress' | 'completed' }) {
  const { t } = useTranslation();

  const config = {
    new: {
      bg: 'bg-nhs-blue/10',
      text: 'text-nhs-blue',
      label: t('hub.status.new', 'New'),
      icon: <InfoBadgeIcon />,
    },
    'in-progress': {
      bg: 'bg-[#fff4e5]',
      text: 'text-[#856404]',
      label: t('hub.status.inProgress', 'In Progress'),
      icon: <InProgressIcon />,
    },
    completed: {
      bg: 'bg-nhs-green/10',
      text: 'text-nhs-green',
      label: t('hub.status.completed', 'Completed'),
      icon: <CheckBadgeIcon />,
    },
  };

  const { bg, text, label, icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 ${bg} ${text} text-xs font-semibold rounded-full`}>
      <span className="w-3.5 h-3.5">{icon}</span>
      {label}
    </span>
  );
}

// Icon Components
function ClockIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
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

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
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

function CheckBadgeIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
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
