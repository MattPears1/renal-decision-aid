/**
 * @fileoverview Landing page for the NHS Renal Decision Aid.
 * Introduces users to the kidney treatment decision support tool
 * with key features, trust indicators, and call-to-action sections.
 *
 * @module pages/LandingPage
 * @version 2.6.0
 * @since 1.0.0
 * @lastModified 23 January 2026
 *
 * @requires react-router-dom
 * @requires react-i18next
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useCarerText } from '@/hooks/useCarerText';

/**
 * Landing page component displaying the welcome screen and tool introduction.
 * Features a hero section, feature cards, about steps, trust indicators,
 * and call-to-action buttons to begin the decision journey.
 *
 * @component
 * @returns {JSX.Element} The rendered landing page
 *
 * @example
 * // Usage in router
 * <Route path="/" element={<LandingPage />} />
 */
export default function LandingPage() {
  const { t } = useTranslation();
  const { tCarer } = useCarerText();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hero Section - Enhanced with staggered animations */}
      <section
        className="relative bg-gradient-to-br from-nhs-blue via-nhs-blue to-nhs-blue-dark text-white py-16 md:py-24 lg:py-32 px-4 overflow-hidden"
        aria-label={t('landing.heroAriaLabel', 'Welcome section')}
      >
        {/* Decorative background elements with subtle animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-nhs-blue-bright/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-nhs-aqua-green/10 rounded-full blur-2xl animate-pulse-slow" />
          {/* Additional decorative element */}
          <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-[900px] mx-auto text-center">
          {/* NHS Badge - Animated entrance */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 md:mb-8 border border-white/20
                       transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          >
            <span className="w-2 h-2 bg-nhs-green rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-sm font-medium text-white/90">{t('landing.subtitle', 'NHS Renal Services')}</span>
          </div>

          {/* Main heading - Staggered animation */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white leading-tight tracking-tight
                       transform transition-all duration-700 ease-out delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {t('landing.title', 'Kidney Treatment Decision Aid')}
          </h1>

          {/* Description - Staggered animation */}
          <p
            className={`text-base sm:text-lg md:text-xl leading-relaxed mb-8 md:mb-10 max-w-[650px] mx-auto text-white/90 px-2
                       transform transition-all duration-700 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {tCarer('landing.description', 'This tool will help you understand your kidney treatment options and think about what matters most to you. Take your time - there are no right or wrong answers.')}
          </p>

          {/* Primary CTA - Staggered animation with enhanced styling */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4
                       transform transition-all duration-700 ease-out delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Link
              to="/language"
              className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5
                         text-base sm:text-lg font-bold bg-white text-nhs-blue
                         rounded-xl min-h-[56px] sm:min-h-[60px] shadow-xl w-full sm:w-auto
                         no-underline transition-all duration-300 ease-out
                         hover:bg-nhs-green hover:text-white hover:shadow-2xl hover:scale-[1.02]
                         focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-4 focus:ring-offset-nhs-blue
                         active:scale-[0.98]"
              aria-label={tCarer('landing.startButtonAriaLabel', 'Start your kidney treatment decision journey')}
            >
              <span>{tCarer('landing.startButton', 'Start Your Journey')}</span>
              <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trust indicators - Staggered animation with improved layout */}
          <div
            className={`mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/90
                       transform transition-all duration-700 ease-out delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
              <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nhs-green" />
              <span className="font-medium">{t('landing.trust.evidenceBased', 'Evidence-based')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
              <ClockSmallIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{t('landing.trust.time', '15 minutes')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
              <LockSmallIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{t('landing.trust.privateSecure', 'Private & Secure')}</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator for mobile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/60 animate-bounce" aria-hidden="true">
          <span className="text-xs font-medium">{t('landing.scrollDown', 'Scroll to learn more')}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Key Features Section - Enhanced with better visual hierarchy */}
      <section
        className="bg-bg-surface py-12 md:py-20 lg:py-24 px-4"
        aria-labelledby="features-heading"
      >
        <div className="max-w-container-lg mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-block px-3 py-1 bg-nhs-blue/10 text-nhs-blue text-sm font-semibold rounded-full mb-4">
              {t('landing.featuresLabel', 'How It Works')}
            </span>
            <h2
              id="features-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 md:mb-4"
            >
              {tCarer('landing.featuresHeading', 'How This Tool Helps You')}
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-base md:text-lg">
              {tCarer('landing.featuresSubheading', 'Everything you need to make an informed decision about your kidney treatment')}
            </p>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            role="list"
          >
            {/* Feature 1: Time */}
            <FeatureCard
              icon={<ClockIcon />}
              title={t('landing.features.time.title', 'Takes About 15 Minutes')}
              description={t('landing.features.time.description', 'Complete at your own pace. You can take breaks whenever you need and return to where you left off.')}
              color="blue"
              index={0}
            />

            {/* Feature 2: Privacy */}
            <FeatureCard
              icon={<ShieldIcon />}
              title={tCarer('landing.features.privacy.title', 'Your Privacy Protected')}
              description={tCarer('landing.features.privacy.description', 'No personal information is stored. Your answers help personalise the tool during this session only.')}
              color="green"
              index={1}
            />

            {/* Feature 3: Device Support */}
            <FeatureCard
              icon={<DeviceIcon />}
              title={t('landing.features.devices.title', 'Works on All Devices')}
              description={t('landing.features.devices.description', 'Use on your phone, tablet, or computer. The tool adapts to your screen size automatically.')}
              color="aqua"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* About Section - Redesigned with connected steps */}
      <section
        className="bg-gradient-to-b from-bg-page to-bg-surface py-12 md:py-20 lg:py-24 px-4"
        aria-labelledby="about-heading"
      >
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-block px-3 py-1 bg-nhs-green/10 text-nhs-green text-sm font-semibold rounded-full mb-4">
              {tCarer('landing.yourJourney', 'Your Journey')}
            </span>
            <h2
              id="about-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3 md:mb-4"
            >
              {t('landing.aboutHeading', 'What This Tool Does')}
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              {tCarer('landing.aboutSubheading', 'Three simple steps to help you understand your options')}
            </p>
          </div>

          {/* Steps with connecting lines */}
          <div className="relative">
            {/* Connecting line - hidden on mobile */}
            <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-nhs-blue via-nhs-green to-nhs-aqua-green" aria-hidden="true" />

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <AboutStep
                number="1"
                title={t('landing.about.steps.learn.title', 'Learn')}
                description={tCarer('landing.about.paragraph1', 'This decision aid will help you explore the different treatment options available for kidney failure. You can learn about each treatment at your own pace, think about what matters most to you, and create a summary to share with your doctor or nurse.')}
                color="blue"
              />
              <AboutStep
                number="2"
                title={t('landing.about.steps.explore.title', 'Explore')}
                description={tCarer('landing.about.paragraph2', 'You will answer a few simple questions about your situation, then explore treatments that may be suitable for you. Your information stays private and is not saved after you close the browser.')}
                color="green"
              />
              <AboutStep
                number="3"
                title={t('landing.about.steps.decide.title', 'Decide')}
                description={tCarer('landing.about.paragraph3', 'This tool does not replace medical advice from your healthcare team. It is designed to help you feel more informed and confident when discussing your options. Your kidney team are the experts in your care and will help you make the right decision for you.')}
                color="aqua"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Enhanced visual design with icons */}
      <section
        className="bg-gradient-to-b from-white to-nhs-pale-grey/30 py-10 md:py-14 px-4"
        aria-label={t('landing.trustAriaLabel', 'Trust and safety information')}
      >
        <div className="max-w-container-lg mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <TrustItem
              icon={<NHSLogoIcon />}
              text={t('landing.trust.evidenceBased', 'Evidence-based information')}
            />
            <TrustItem
              icon={<LanguageIcon />}
              text={t('landing.trust.languages', 'Available in 7 languages')}
            />
            <TrustItem
              icon={<AccessibilitySmallIcon />}
              text={t('landing.trust.accessible', 'Accessible for all users')}
            />
            <TrustItem
              icon={<NoAccountIcon />}
              text={t('landing.trust.noAccount', 'No account required')}
            />
          </div>
        </div>
      </section>

      {/* Secondary CTA Section - Enhanced with gradient and better mobile layout */}
      <section
        className="bg-bg-surface py-12 md:py-20 lg:py-24 px-4"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-[900px] mx-auto">
          <div className="relative bg-gradient-to-br from-nhs-blue via-nhs-blue to-nhs-blue-dark rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-nhs-aqua-green/10 rounded-full translate-y-1/2 -translate-x-1/2" aria-hidden="true" />

            <div className="relative z-10">
              <h2
                id="cta-heading"
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-white"
              >
                {t('landing.ctaHeading', 'Ready to Begin?')}
              </h2>
              <p className="text-base sm:text-lg text-white/90 mb-6 md:mb-8 leading-relaxed max-w-xl mx-auto">
                {tCarer('landing.ctaDescription', 'Take the first step towards understanding your kidney treatment options. You can start now and come back later if you need a break.')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/language"
                  className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4
                             text-base sm:text-lg font-bold bg-white text-nhs-blue
                             rounded-xl min-h-[52px] sm:min-h-[56px] shadow-lg w-full sm:w-auto
                             no-underline transition-all duration-300 ease-out
                             hover:bg-nhs-green hover:text-white hover:shadow-xl hover:scale-[1.02]
                             focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2 focus:ring-offset-nhs-blue
                             active:scale-[0.98]"
                  aria-label={tCarer('landing.startButtonAriaLabel', 'Start your kidney treatment decision journey')}
                >
                  <span>{tCarer('landing.startButton', 'Start Your Journey')}</span>
                  <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://www.nhs.uk/conditions/kidney-disease/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm sm:text-base
                             focus:bg-focus focus:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus rounded px-3 py-2"
                >
                  {t('landing.learnMore', 'Learn More About Kidney Disease')}
                  <ExternalLinkIcon />
                  <span className="sr-only">({t('accessibility.newWindow', 'opens in new tab')})</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Settings Link */}
      <a
        href="#accessibility-settings"
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3
                   bg-bg-surface border-2 border-nhs-blue rounded-md
                   text-sm font-semibold text-nhs-blue shadow-md
                   transition-colors duration-150 z-50
                   hover:bg-nhs-blue hover:text-white
                   focus:outline-none focus:ring-[3px] focus:ring-focus focus:ring-offset-2 focus:bg-focus focus:text-text-primary"
        aria-label={t('accessibility.settingsLabel', 'Accessibility options - Adjust text size, contrast, and other accessibility settings')}
        title={t('accessibility.settingsTitle', 'Adjust text size, contrast, and other accessibility settings')}
      >
        <AccessibilityIcon />
        {t('accessibility.settings', 'Accessibility')}
      </a>
    </>
  );
}

/**
 * Props for the FeatureCard component.
 * @interface FeatureCardProps
 * @property {React.ReactNode} icon - Icon element to display
 * @property {string} title - Feature title text
 * @property {string} description - Feature description text
 * @property {'blue' | 'green' | 'aqua'} [color] - Color theme for the card
 * @property {number} [index] - Card index for staggered animations
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: 'blue' | 'green' | 'aqua';
  index?: number;
}

/**
 * Feature card component displaying a key feature of the decision aid.
 * Includes icon, title, and description with hover effects and entrance animations.
 *
 * @component
 * @param {FeatureCardProps} props - Component props
 * @returns {JSX.Element} Rendered feature card
 */
function FeatureCard({ icon, title, description, color = 'blue', index = 0 }: FeatureCardProps) {
  const colorClasses = {
    blue: 'bg-nhs-blue group-hover:bg-nhs-blue-dark',
    green: 'bg-nhs-green group-hover:bg-nhs-green-dark',
    aqua: 'bg-nhs-aqua-green group-hover:bg-[#008577]',
  };

  const borderColors = {
    blue: 'group-hover:border-nhs-blue hover:shadow-nhs-blue/10',
    green: 'group-hover:border-nhs-green hover:shadow-nhs-green/10',
    aqua: 'group-hover:border-nhs-aqua-green hover:shadow-nhs-aqua-green/10',
  };

  const lightBgColors = {
    blue: 'group-hover:bg-blue-50/50',
    green: 'group-hover:bg-green-50/50',
    aqua: 'group-hover:bg-teal-50/50',
  };

  return (
    <article
      className={`group text-center p-6 sm:p-8 bg-white rounded-xl border-2 border-nhs-pale-grey shadow-sm
                 transition-all duration-300 ease-out
                 hover:-translate-y-1 hover:shadow-lg hover:border-2
                 ${borderColors[color]} ${lightBgColors[color]}`}
      role="listitem"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl
                   flex items-center justify-center transition-all duration-300 ${colorClasses[color]}
                   group-hover:scale-105 group-hover:shadow-md`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-text-secondary leading-relaxed m-0">
        {description}
      </p>
    </article>
  );
}

/**
 * Props for the AboutStep component.
 * @interface AboutStepProps
 * @property {string} number - Step number to display
 * @property {string} title - Step title
 * @property {string} description - Step description text
 * @property {'blue' | 'green' | 'aqua'} [color] - Color theme for the step
 */
interface AboutStepProps {
  number: string;
  title: string;
  description: string;
  color?: 'blue' | 'green' | 'aqua';
}

/**
 * About step component showing a numbered step in the process.
 * Used in the "What This Tool Does" section with connecting visual elements.
 *
 * @component
 * @param {AboutStepProps} props - Component props
 * @returns {JSX.Element} Rendered about step
 */
function AboutStep({ number, title, description, color = 'blue' }: AboutStepProps) {
  const colorClasses = {
    blue: 'bg-nhs-blue',
    green: 'bg-nhs-green',
    aqua: 'bg-nhs-aqua-green',
  };

  const ringColors = {
    blue: 'ring-nhs-blue/20',
    green: 'ring-nhs-green/20',
    aqua: 'ring-nhs-aqua-green/20',
  };

  return (
    <div className="relative flex flex-col items-center text-center group">
      {/* Step number with ring effect */}
      <div className="relative z-10 mb-4 md:mb-6">
        <span
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${colorClasses[color]} text-white font-bold text-xl sm:text-2xl
                     flex items-center justify-center shadow-lg ring-4 ${ringColors[color]}
                     transition-transform duration-300 group-hover:scale-110`}
        >
          {number}
        </span>
      </div>

      {/* Content card */}
      <div className="p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-nhs-pale-grey hover:shadow-md transition-all duration-300 h-full">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 sm:mb-3">{title}</h3>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * Props for the TrustItem component.
 * @interface TrustItemProps
 * @property {React.ReactNode} icon - Icon element to display
 * @property {string} text - Trust indicator text
 */
interface TrustItemProps {
  icon: React.ReactNode;
  text: string;
}

/**
 * Trust item component displaying a trust indicator with icon.
 * Used in the trust indicators section at the bottom of the page.
 *
 * @component
 * @param {TrustItemProps} props - Component props
 * @returns {JSX.Element} Rendered trust item
 */
function TrustItem({ icon, text }: TrustItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 bg-white rounded-xl shadow-sm text-center
                    transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <span className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-nhs-blue rounded-lg bg-nhs-blue/5" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs sm:text-sm font-medium text-text-primary leading-tight">{text}</span>
    </div>
  );
}

// ============================================================================
// Icon Components
// ============================================================================

/**
 * Right arrow icon component.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - CSS class names
 * @returns {JSX.Element} SVG icon
 */
function ArrowRightIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}

function ClockSmallIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
  );
}

function LockSmallIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

function NHSLogoIcon() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
    </svg>
  );
}

function AccessibilitySmallIcon() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
    </svg>
  );
}

function NoAccountIcon() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-full h-full fill-nhs-green" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 ml-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

function AccessibilityIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}
