import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NHSHeader from './NHSHeader';
import NHSFooter from './NHSFooter';
import AccessibilityModal from './AccessibilityModal';
import BackToTop from './BackToTop';

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);

  // Note: Accessibility settings are applied in App.tsx on module load
  // to prevent flash of un-styled content

  // Handle skip link functionality
  const handleSkipToMain = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.removeAttribute('tabindex');
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        onClick={handleSkipToMain}
        className="skip-link"
      >
        {t('accessibility.skipToContent')}
      </a>

      {/* NHS Header - sticky positioned, isolated from main content */}
      <NHSHeader />

      {/* Main Content Area - isolated from header, no layout shift */}
      <main
        id="main-content"
        role="main"
        className="flex-1 w-full overflow-x-hidden isolate"
        key={location.pathname}
      >
        <Outlet />
      </main>

      {/* NHS Footer */}
      <NHSFooter />

      {/* Back to Top Button */}
      <BackToTop threshold={400} />

      {/* Accessibility Settings Button (Fixed Position) */}
      <AccessibilityButton onOpenModal={() => setIsAccessibilityModalOpen(true)} />

      {/* Accessibility Settings Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
      />
    </div>
  );
}

interface AccessibilityButtonProps {
  onOpenModal: () => void;
}

function AccessibilityButton({ onOpenModal }: AccessibilityButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center justify-center gap-2
                 min-w-[44px] min-h-[44px] px-3 py-2.5 sm:px-4
                 bg-bg-surface border-2 border-nhs-blue rounded-md
                 text-sm font-semibold text-nhs-blue shadow-md
                 transition-colors duration-fast z-[300] touch-manipulation
                 hover:bg-nhs-blue hover:text-white
                 focus:outline-none focus:ring-[3px] focus:ring-focus focus:bg-focus focus:text-text-primary
                 active:scale-95"
      aria-label={t('accessibility.settingsLabel')}
      title={t('accessibility.settingsTitle')}
      onClick={onOpenModal}
    >
      <svg
        className="w-5 h-5 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
      <span className="hidden sm:inline">{t('accessibility.settings')}</span>
    </button>
  );
}
