/**
 * @fileoverview Main layout component for the NHS Renal Decision Aid.
 * Provides the overall page structure including header, footer, accessibility
 * features, and main content outlet.
 * @module components/Layout
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NHSHeader from './NHSHeader';
import NHSFooter from './NHSFooter';
import AccessibilityModal from './AccessibilityModal';
import BackToTop from './BackToTop';
import ListenToPageButton from './ListenToPageButton';
import { useSession } from '@/context/SessionContext';
import { useCarerText } from '@/hooks/useCarerText';

/**
 * Main layout component that wraps all pages.
 *
 * Features:
 * - Skip link for keyboard accessibility
 * - Sticky NHS header
 * - Main content outlet with route-based keying
 * - NHS footer
 * - Back to top button
 * - Floating accessibility settings button
 * - Accessibility settings modal
 *
 * @component
 * @returns {JSX.Element} The rendered layout wrapper
 *
 * @example
 * <BrowserRouter>
 *   <Routes>
 *     <Route element={<Layout />}>
 *       <Route path="/" element={<HomePage />} />
 *     </Route>
 *   </Routes>
 * </BrowserRouter>
 */
export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const { session } = useSession();
  const { isCarer, relationshipLabel } = useCarerText();

  // Note: Accessibility settings are applied in App.tsx on module load
  // to prevent flash of un-styled content

  /**
   * Handles the skip link click to jump to main content.
   * Temporarily makes main content focusable for screen readers.
   * @param {React.MouseEvent<HTMLAnchorElement>} e - The click event
   */
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

      {/* Companion Mode Banner */}
      {isCarer && session && (
        <div
          className="bg-purple-50 border-b border-purple-200"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-2 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-purple-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-sm font-medium text-purple-800">
              {t('companionBanner.text', 'Companion mode — this session is about {{relationship}}', { relationship: relationshipLabel })}
            </span>
          </div>
        </div>
      )}

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

      {/* Listen to Page Button (Fixed Position - Bottom Left) */}
      <ListenToPageButton />

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

/**
 * Props for the AccessibilityButton component.
 * @interface AccessibilityButtonProps
 * @property {() => void} onOpenModal - Handler to open the accessibility modal
 */
interface AccessibilityButtonProps {
  onOpenModal: () => void;
}

/**
 * Floating accessibility settings button.
 * Fixed to the bottom-right corner of the viewport.
 * @component
 * @param {AccessibilityButtonProps} props - Component props
 * @returns {JSX.Element} The rendered accessibility button
 */
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
