import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NHSFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-b from-white to-nhs-pale-grey/50 border-t-4 border-nhs-blue mt-auto w-full overflow-x-hidden" role="contentinfo">
      {/* Decorative top accent */}
      <div className="h-1 bg-gradient-to-r from-nhs-blue via-nhs-aqua-green to-nhs-blue"></div>

      <div className="w-full max-w-container-xl mx-auto px-4 sm:px-5 md:px-6 py-6 sm:py-8 box-border">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Left side - Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* NHS (Demo) Badge */}
            <div className="bg-gradient-to-r from-nhs-blue to-nhs-aqua-green rounded-lg px-3 sm:px-4 py-2 shadow-md inline-flex items-baseline flex-shrink-0">
              <span className="text-white font-bold text-lg sm:text-xl">{t('header.nhs')}</span>
              <span className="text-white font-bold text-xs ml-2 bg-white/20 px-2 py-0.5 rounded">
                {t('header.demo')}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-text-primary font-semibold m-0 text-sm sm:text-base truncate">
                {t('header.serviceName')}
              </p>
              <p className="text-text-secondary text-xs sm:text-sm m-0">
                {t('footer.supportingDecisions')}
              </p>
            </div>
          </div>

          {/* Footer Links - Stack on mobile, inline on larger screens */}
          <nav
            className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-1 sm:gap-4 w-full sm:w-auto"
            aria-label={t('footer.navigationLabel')}
          >
            <Link
              to="/disclaimer"
              className="text-nhs-blue text-sm font-medium no-underline hover:text-nhs-blue-dark hover:bg-nhs-blue/5 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {t('footer.accessibility')}
            </Link>
            <span className="text-nhs-mid-grey/50 hidden sm:inline" aria-hidden="true">|</span>
            <Link
              to="/disclaimer"
              className="text-nhs-blue text-sm font-medium no-underline hover:text-nhs-blue-dark hover:bg-nhs-blue/5 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {t('footer.privacyPolicy')}
            </Link>
            <span className="text-nhs-mid-grey/50 hidden sm:inline" aria-hidden="true">|</span>
            <Link
              to="/disclaimer"
              className="text-nhs-blue text-sm font-medium no-underline hover:text-nhs-blue-dark hover:bg-nhs-blue/5 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {t('footer.contact')}
            </Link>
          </nav>
        </div>

        {/* Divider with gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-nhs-mid-grey/30 to-transparent mb-4 sm:mb-6"></div>

        {/* Disclaimer Section - Enhanced */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-nhs-pale-grey/50 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            {/* Top row: Icon and text */}
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-nhs-blue/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-nhs-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Disclaimer text */}
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-semibold mb-1 text-sm sm:text-base">
                  {t('footer.disclaimer.title')}
                </p>
                <p className="text-text-secondary text-xs sm:text-sm m-0 leading-relaxed">
                  {t('footer.disclaimer.text1')}{' '}
                  <span className="font-semibold text-nhs-blue">{t('footer.disclaimer.mockDesign')}</span>{' '}
                  {t('footer.disclaimer.text2')}{' '}
                  <span className="font-semibold text-nhs-blue">{t('footer.disclaimer.company')}</span>{' '}
                  {t('footer.disclaimer.text3')}
                </p>
              </div>
            </div>

            {/* Contact button - full width on mobile, auto on larger */}
            <a
              href="mailto:pearsresearchservices@outlook.com"
              className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 sm:py-2 bg-nhs-blue/5 hover:bg-nhs-blue/10 text-nhs-blue text-sm font-medium rounded-lg transition-colors w-full sm:w-auto sm:self-end"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{t('footer.contactUs')}</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-text-muted text-xs m-0">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 bg-nhs-green rounded-full animate-pulse" aria-hidden="true"></span>
            <span>{t('footer.demoVersion')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
