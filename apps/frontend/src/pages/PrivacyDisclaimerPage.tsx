/**
 * @fileoverview Privacy and disclaimer page for the NHS Renal Decision Aid.
 * Informs users about data handling, AI limitations, and PII restrictions
 * before they begin using the tool. Requires consent to proceed.
 *
 * @module pages/PrivacyDisclaimerPage
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires react
 * @requires react-router-dom
 * @requires react-i18next
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * List of personally identifiable information (PII) items users should not share.
 * @constant {Array<{key: string, label: string}>}
 */
const PII_ITEMS = [
  { key: 'nhsNumber', label: 'Your NHS number' },
  { key: 'fullName', label: 'Your full name' },
  { key: 'address', label: 'Your home address' },
  { key: 'dob', label: 'Your date of birth' },
  { key: 'phone', label: 'Phone numbers' },
  { key: 'email', label: 'Email addresses' },
];

/**
 * Privacy disclaimer page component.
 * Displays privacy information, AI disclaimers, and PII warnings.
 * Collects user consent before allowing progression to the journey.
 *
 * @component
 * @returns {JSX.Element} The rendered privacy disclaimer page
 *
 * @example
 * // Usage in router
 * <Route path="/disclaimer" element={<PrivacyDisclaimerPage />} />
 */
export default function PrivacyDisclaimerPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [consentUnderstood, setConsentUnderstood] = useState(false);
  const [consentAnalytics, setConsentAnalytics] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleContinue = useCallback(() => {
    if (consentUnderstood) {
      // Store consent in session storage
      sessionStorage.setItem('privacyConsent', 'true');
      sessionStorage.setItem('analyticsConsent', consentAnalytics ? 'true' : 'false');
      navigate('/journey');
    } else {
      setShowError(true);
    }
  }, [consentUnderstood, consentAnalytics, navigate]);

  const handleConsentChange = useCallback((checked: boolean) => {
    setConsentUnderstood(checked);
    if (checked) {
      setShowError(false);
    }
  }, []);

  const handlePlayAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const pageContent = document.querySelector('.page-content');
        if (pageContent) {
          const text = pageContent.textContent || '';
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-GB';
          utterance.rate = 0.9;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      }
    }
  }, [isPlaying]);

  return (
    <main className="min-h-screen bg-bg-page page-content" aria-label={t('privacy.pageAriaLabel', 'Privacy information')}>
      <div className="max-w-container-lg mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Progress Indicator */}
        <div
          className="mb-6 sm:mb-8"
          role="progressbar"
          aria-valuenow={30}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('privacy.progressLabel', 'Setup progress: 30%')}
        >
          <div className="h-2 bg-nhs-pale-grey rounded-full mb-2">
            <div className="h-full w-[30%] bg-nhs-blue rounded-full transition-all duration-300" />
          </div>
          <p className="text-center text-xs sm:text-sm text-text-secondary">
            {t('privacy.progressText', 'Step 2 of 4: Privacy Information')}
          </p>
        </div>

        {/* Page Header */}
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            {t('privacy.title', 'Your Privacy Matters')}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto px-2">
            {t('privacy.subtitle', 'Before you begin, we want you to understand how this tool handles your information.')}
          </p>
        </header>

        {/* Audio Control */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 min-h-[48px]
                       bg-white border-2 border-nhs-blue rounded-full
                       text-nhs-blue font-semibold text-sm sm:text-base
                       transition-colors duration-150
                       hover:bg-nhs-blue hover:text-white
                       focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2"
            aria-label={isPlaying
              ? t('privacy.stopReading', 'Stop reading this page')
              : t('privacy.listenToPage', 'Listen to this page read aloud')
            }
          >
            <AudioIcon />
            <span>
              {isPlaying
                ? t('privacy.stopReading', 'Stop reading')
                : t('privacy.listenToPage', 'Listen to this page')
              }
            </span>
          </button>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {/* Section 1: Privacy Notice */}
          <PrivacySection
            icon={<ShieldCheckIcon />}
            iconBg="bg-blue-50 text-nhs-blue"
            title={t('privacy.sections.privacy.title', 'How We Handle Your Information')}
          >
            <p>
              {t('privacy.sections.privacy.p1', 'This tool uses session-only storage. Any information you enter, including your answers to questions and treatment preferences, is only kept while you are using the tool.')}
            </p>
            <p>
              {t('privacy.sections.privacy.p2', 'When you close your browser or after 15 minutes of inactivity, all your information is automatically deleted. We do not save anything about you.')}
            </p>
            <p>
              {t('privacy.sections.privacy.p3', 'We collect anonymous information about how people use this tool to help us improve it. This cannot identify you personally.')}
            </p>
          </PrivacySection>

          {/* Section 2: AI Limitations */}
          <PrivacySection
            icon={<InfoCircleIcon />}
            iconBg="bg-purple-50 text-nhs-purple"
            title={t('privacy.sections.ai.title', 'About the AI Assistant')}
          >
            <p>
              {t('privacy.sections.ai.p1', 'This tool includes an AI assistant that can answer general questions about kidney treatments. The AI provides information only - it cannot give you medical advice specific to your situation.')}
            </p>
            <p>
              {t('privacy.sections.ai.p2', 'The AI may sometimes make mistakes or provide incomplete information. Always discuss important decisions with your kidney team who know your full medical history.')}
            </p>
            <p className="font-semibold">
              {t('privacy.sections.ai.p3', 'This tool does not replace advice from your healthcare team. It is designed to help you feel more informed when discussing your options with your doctors and nurses.')}
            </p>
          </PrivacySection>

          {/* Section 3: PII Warning */}
          <section
            className="bg-amber-50 border-2 border-nhs-warm-yellow rounded-lg p-4 sm:p-6"
            aria-labelledby="pii-heading"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-md flex items-center justify-center text-amber-700">
                <WarningIcon />
              </div>
              <h2 id="pii-heading" className="text-lg sm:text-xl font-bold text-amber-800">
                {t('privacy.sections.pii.title', 'Please Do Not Share Personal Details')}
              </h2>
            </div>
            <div className="text-amber-900 space-y-3 sm:space-y-4 text-sm sm:text-base">
              <p>
                {t('privacy.sections.pii.intro', 'To protect your privacy, please do not enter any personal information that could identify you when using this tool, especially in the chat feature.')}
              </p>
              <ul
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 list-none p-0 m-0"
                aria-label={t('privacy.sections.pii.listLabel', 'Information you should not share')}
              >
                {PII_ITEMS.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/70 rounded min-h-[44px]"
                  >
                    <CrossCircleIcon />
                    <span className="text-sm sm:text-base">{t(`privacy.sections.pii.items.${item.key}`, item.label)}</span>
                  </li>
                ))}
              </ul>
              <p>
                {t('privacy.sections.pii.outro', 'You can still tell us about your situation in general terms - for example, your living situation or what matters most to you - without sharing identifying details.')}
              </p>
            </div>
          </section>
        </div>

        {/* Summary Box */}
        <div
          className="bg-green-50 border-2 border-nhs-green rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-center"
          role="region"
          aria-label={t('privacy.summaryAriaLabel', 'Key points summary')}
        >
          <h3 className="flex items-center justify-center gap-2 text-base sm:text-lg font-bold text-nhs-green-dark mb-3 sm:mb-4">
            <CheckCircleIcon />
            {t('privacy.summary.title', 'In Summary')}
          </h3>
          <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-x-8 sm:gap-y-3 list-none p-0 m-0">
            <SummaryItem text={t('privacy.summary.notSaved', 'Your answers are not saved')} />
            <SummaryItem text={t('privacy.summary.noData', 'No personal data is collected')} />
            <SummaryItem text={t('privacy.summary.leave', 'You can leave at any time')} />
          </ul>
        </div>

        {/* Consent Section */}
        <div
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8"
          role="region"
          aria-labelledby="consent-heading"
        >
          <h3 id="consent-heading" className="text-base sm:text-lg font-bold text-text-primary mb-4 sm:mb-6">
            {t('privacy.consent.title', 'Please confirm to continue')}
          </h3>

          {/* Required Consent */}
          <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-bg-surface-secondary rounded-md cursor-pointer hover:bg-nhs-pale-grey transition-colors mb-3 sm:mb-4 min-h-[48px]">
            <input
              type="checkbox"
              checked={consentUnderstood}
              onChange={(e) => handleConsentChange(e.target.checked)}
              className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 mt-0.5 accent-nhs-blue cursor-pointer"
              aria-describedby={showError ? 'consent-error' : undefined}
              required
            />
            <span className="text-text-primary text-sm sm:text-base">
              <span className="text-nhs-red font-bold" aria-hidden="true">* </span>
              {t('privacy.consent.understand', 'I understand that my information is not saved after this session and I will not share personal identifying information')}
            </span>
          </label>

          {/* Optional Analytics Consent */}
          <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-bg-surface-secondary rounded-md cursor-pointer hover:bg-nhs-pale-grey transition-colors min-h-[48px]">
            <input
              type="checkbox"
              checked={consentAnalytics}
              onChange={(e) => setConsentAnalytics(e.target.checked)}
              className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 mt-0.5 accent-nhs-blue cursor-pointer"
            />
            <span className="text-text-primary text-sm sm:text-base">
              {t('privacy.consent.analytics', 'I agree to anonymous analytics being collected to help improve this tool (optional)')}
            </span>
          </label>

          {/* Error Message */}
          {showError && (
            <div
              id="consent-error"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 mt-3 sm:mt-4 bg-red-50 rounded-md text-nhs-red text-sm sm:text-base"
              role="alert"
              aria-live="polite"
            >
              <ErrorIcon />
              <span>{t('privacy.consent.error', 'Please confirm you understand the privacy information before continuing')}</span>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/language')}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 min-h-[48px] text-nhs-blue hover:underline
                       focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded text-base"
          >
            <BackIcon />
            {t('nav.back', 'Go Back')}
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!consentUnderstood}
            className={`inline-flex items-center gap-2 px-6 sm:px-8 py-3 min-h-[48px] w-full sm:w-auto font-bold rounded-md text-base sm:text-lg justify-center
                        transition-colors duration-150
                        focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2
                        ${consentUnderstood
                          ? 'bg-nhs-green text-white hover:bg-nhs-green-dark'
                          : 'bg-nhs-mid-grey text-white cursor-not-allowed opacity-70'
                        }`}
            aria-describedby={showError ? 'consent-error' : undefined}
            aria-label={t('privacy.continueAriaLabel', 'Continue to journey stage selection')}
          >
            {t('privacy.continueButton', 'I Understand, Continue')}
            <ForwardIcon />
          </button>
        </div>

        {/* Privacy Policy Link */}
        <p className="text-center text-sm text-text-secondary mt-6 sm:mt-8">
          <a
            href="https://www.nhs.uk/conditions/nhs-privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-nhs-blue hover:underline focus:outline-none focus:ring-2 focus:ring-focus rounded min-h-[44px] inline-flex items-center"
          >
            {t('privacy.readFullPolicy', 'Read the full NHS Privacy Policy')}
          </a>
        </p>
      </div>
    </main>
  );
}

/**
 * Props for the PrivacySection component.
 * @interface PrivacySectionProps
 * @property {React.ReactNode} icon - Icon element to display
 * @property {string} iconBg - CSS classes for icon background styling
 * @property {string} title - Section title
 * @property {React.ReactNode} children - Section content
 */
interface PrivacySectionProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}

/**
 * Privacy section component for displaying categorized privacy information.
 * Used for privacy notice, AI limitations, and other informational sections.
 *
 * @component
 * @param {PrivacySectionProps} props - Component props
 * @returns {JSX.Element} Rendered privacy section
 */
function PrivacySection({ icon, iconBg, title, children }: PrivacySectionProps) {
  const headingId = `section-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <section
      className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
      aria-labelledby={headingId}
    >
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-md flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h2 id={headingId} className="text-lg sm:text-xl font-bold text-text-primary">
          {title}
        </h2>
      </div>
      <div className="text-text-secondary space-y-3 sm:space-y-4 leading-relaxed text-sm sm:text-base">
        {children}
      </div>
    </section>
  );
}

/**
 * Props for the SummaryItem component.
 * @interface SummaryItemProps
 * @property {string} text - Summary item text
 */
interface SummaryItemProps {
  text: string;
}

/**
 * Summary item component displaying a key point with checkmark icon.
 *
 * @component
 * @param {SummaryItemProps} props - Component props
 * @returns {JSX.Element} Rendered summary item
 */
function SummaryItem({ text }: SummaryItemProps) {
  return (
    <li className="flex items-center gap-2 text-nhs-green-dark font-medium text-sm sm:text-base">
      <CheckIcon />
      <span>{text}</span>
    </li>
  );
}

// ============================================================================
// Icon Components
// ============================================================================

/** Audio/speaker icon for text-to-speech controls. */
function AudioIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      className="w-7 h-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function InfoCircleIcon() {
  return (
    <svg
      className="w-7 h-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      className="w-7 h-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CrossCircleIcon() {
  return (
    <svg
      className="w-5 h-5 text-nhs-red flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-nhs-green"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="w-5 h-5 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
