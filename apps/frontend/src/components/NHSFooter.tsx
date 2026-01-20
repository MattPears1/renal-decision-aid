import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NHSFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-b from-white to-nhs-pale-grey/50 border-t-4 border-nhs-blue mt-auto" role="contentinfo">
      {/* Decorative top accent */}
      <div className="h-1 bg-gradient-to-r from-nhs-blue via-nhs-aqua-green to-nhs-blue"></div>

      <div className="max-w-container-xl mx-auto px-4 md:px-6 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          {/* Left side - Branding */}
          <div className="flex items-center gap-4">
            {/* NHS (Demo) Badge */}
            <div className="bg-gradient-to-r from-nhs-blue to-nhs-aqua-green rounded-lg px-4 py-2 shadow-md inline-flex items-baseline">
              <span className="text-white font-bold text-xl">{t('header.nhs')}</span>
              <span className="text-white font-bold text-xs ml-2 bg-white/20 px-2 py-0.5 rounded">
                {t('header.demo')}
              </span>
            </div>
            <div className="flex flex-col">
              <p className="text-text-primary font-semibold m-0">
                {t('header.serviceName')}
              </p>
              <p className="text-text-secondary text-sm m-0">
                {t('footer.supportingDecisions')}
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <nav className="flex flex-wrap items-center gap-4" aria-label={t('footer.navigationLabel')}>
            <Link
              to="/disclaimer"
              className="text-nhs-blue text-sm font-medium no-underline hover:text-nhs-blue-dark hover:bg-nhs-blue/5 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {t('footer.accessibility')}
            </Link>
            <span className="text-nhs-mid-grey/50">|</span>
            <Link
              to="/disclaimer"
              className="text-nhs-blue text-sm font-medium no-underline hover:text-nhs-blue-dark hover:bg-nhs-blue/5 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {t('footer.privacyPolicy')}
            </Link>
            <span className="text-nhs-mid-grey/50">|</span>
            <Link
              to="/disclaimer"
              className="text-nhs-blue text-sm font-medium no-underline hover:text-nhs-blue-dark hover:bg-nhs-blue/5 px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {t('footer.contact')}
            </Link>
          </nav>
        </div>

        {/* Divider with gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-nhs-mid-grey/30 to-transparent mb-6"></div>

        {/* Disclaimer Section - Enhanced */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-nhs-pale-grey/50 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-nhs-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-nhs-blue"
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
            <div className="flex-1">
              <p className="text-text-primary font-semibold mb-1">
                {t('footer.disclaimer.title')}
              </p>
              <p className="text-text-secondary text-sm m-0">
                {t('footer.disclaimer.text1')}{' '}
                <span className="font-semibold text-nhs-blue">{t('footer.disclaimer.mockDesign')}</span>{' '}
                {t('footer.disclaimer.text2')}{' '}
                <span className="font-semibold text-nhs-blue">{t('footer.disclaimer.company')}</span>{' '}
                {t('footer.disclaimer.text3')}
              </p>
            </div>

            {/* Contact */}
            <a
              href="mailto:pearsresearchservices@outlook.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-nhs-blue/5 hover:bg-nhs-blue/10 text-nhs-blue text-sm font-medium rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
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
              {t('footer.contactUs')}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-text-muted text-xs m-0">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 bg-nhs-green rounded-full animate-pulse"></span>
            <span>{t('footer.demoVersion')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
