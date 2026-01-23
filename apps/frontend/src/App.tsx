import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SessionProvider } from './context/SessionContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import { getLanguageDirection } from './config/i18n';
import { loadAccessibilitySettings, applyAccessibilitySettings } from './components/AccessibilityModal';

// Lazy load other pages for better performance
const LanguageSelectionPage = lazy(() => import('./pages/LanguageSelectionPage'));
const CompanionModePage = lazy(() => import('./pages/CompanionModePage'));
const PrivacyDisclaimerPage = lazy(() => import('./pages/PrivacyDisclaimerPage'));
const JourneyStagePage = lazy(() => import('./pages/JourneyStagePage'));
const QuestionnairePage = lazy(() => import('./pages/QuestionnairePage'));
const HubPage = lazy(() => import('./pages/HubPage'));
const TreatmentOverviewPage = lazy(() => import('./pages/TreatmentOverviewPage'));
const TreatmentDetailPage = lazy(() => import('./pages/TreatmentDetailPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ValuesPage = lazy(() => import('./pages/ValuesPage'));
const ModelViewerPage = lazy(() => import('./pages/ModelViewerPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SummaryPage = lazy(() => import('./pages/SummaryPage'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const LifeGoalsPage = lazy(() => import('./pages/LifeGoalsPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const SupportNetworksPage = lazy(() => import('./pages/SupportNetworksPage'));

// Apply accessibility settings immediately on module load (before any render)
// This prevents flash of un-styled content
const initialSettings = loadAccessibilitySettings();
applyAccessibilitySettings(initialSettings);

// Loading fallback for app initialization (before translations are loaded)
function AppLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-page">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-nhs-pale-grey border-t-nhs-blue rounded-full animate-spin" />
        <p className="text-text-secondary text-lg">Loading...</p>
      </div>
    </div>
  );
}

// Loading fallback component for page transitions
function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-nhs-pale-grey border-t-nhs-blue rounded-full animate-spin" />
        <p className="text-text-secondary">{t('common.loading')}</p>
      </div>
    </div>
  );
}

// Component that syncs document attributes with i18n language
function LanguageSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update document lang attribute and direction when language changes
    const updateDocumentLanguage = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = getLanguageDirection(lng);
    };

    // Set initial language attributes
    updateDocumentLanguage(i18n.language);

    // Listen for language changes
    i18n.on('languageChanged', updateDocumentLanguage);

    return () => {
      i18n.off('languageChanged', updateDocumentLanguage);
    };
  }, [i18n]);

  return null;
}

// Component that scrolls to top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Suspense fallback={<AppLoader />}>
      <SessionProvider>
        <LanguageSync />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route
                path="language"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LanguageSelectionPage />
                  </Suspense>
                }
              />
              <Route
                path="who-is-this-for"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CompanionModePage />
                  </Suspense>
                }
              />
              <Route
                path="disclaimer"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PrivacyDisclaimerPage />
                  </Suspense>
                }
              />
              <Route
                path="journey"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <JourneyStagePage />
                  </Suspense>
                }
              />
              <Route
                path="questions"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <QuestionnairePage />
                  </Suspense>
                }
              />
              <Route
                path="hub"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HubPage />
                  </Suspense>
                }
              />
              <Route
                path="treatments"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TreatmentOverviewPage />
                  </Suspense>
                }
              />
              <Route
                path="treatments/:type"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TreatmentDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="compare"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ComparePage />
                  </Suspense>
                }
              />
              <Route
                path="values"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ValuesPage />
                  </Suspense>
                }
              />
              <Route
                path="model"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ModelViewerPage />
                  </Suspense>
                }
              />
              <Route
                path="chat"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ChatPage />
                  </Suspense>
                }
              />
              <Route
                path="summary"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SummaryPage />
                  </Suspense>
                }
              />
              <Route
                path="glossary"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <GlossaryPage />
                  </Suspense>
                }
              />
              <Route
                path="life-goals"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LifeGoalsPage />
                  </Suspense>
                }
              />
              <Route
                path="statistics"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <StatisticsPage />
                  </Suspense>
                }
              />
              <Route
                path="support-networks"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SupportNetworksPage />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </Suspense>
  );
}

export default App;
