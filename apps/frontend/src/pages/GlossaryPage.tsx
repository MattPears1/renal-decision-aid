/**
 * @fileoverview Glossary page for the NHS Renal Decision Aid.
 * Provides searchable, filterable definitions of kidney-related medical terms
 * with links to relevant app sections.
 *
 * @module pages/GlossaryPage
 * @version 1.0.0
 * @since 2.6.0
 * @lastModified 23 January 2026
 *
 * @requires react-router-dom
 * @requires react-i18next
 */

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Configuration for a glossary term.
 */
interface GlossaryTerm {
  id: string;
  titleKey: string;
  definitionKey: string;
  category: 'dialysis' | 'transplant' | 'kidney-function' | 'access' | 'care' | 'general';
  relatedLink?: string;
  relatedLinkKey?: string;
}

/**
 * All glossary terms with their i18n keys and categories.
 */
const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Dialysis terms
  {
    id: 'dialysis',
    titleKey: 'glossary.terms.dialysis.title',
    definitionKey: 'glossary.terms.dialysis.definition',
    category: 'dialysis',
    relatedLink: '/treatments',
    relatedLinkKey: 'glossary.links.treatments',
  },
  {
    id: 'haemodialysis',
    titleKey: 'glossary.terms.haemodialysis.title',
    definitionKey: 'glossary.terms.haemodialysis.definition',
    category: 'dialysis',
    relatedLink: '/treatments/hemodialysis',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'peritoneal-dialysis',
    titleKey: 'glossary.terms.peritonealDialysis.title',
    definitionKey: 'glossary.terms.peritonealDialysis.definition',
    category: 'dialysis',
    relatedLink: '/treatments/peritoneal-dialysis',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'apd',
    titleKey: 'glossary.terms.apd.title',
    definitionKey: 'glossary.terms.apd.definition',
    category: 'dialysis',
    relatedLink: '/treatments/peritoneal-dialysis',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'capd',
    titleKey: 'glossary.terms.capd.title',
    definitionKey: 'glossary.terms.capd.definition',
    category: 'dialysis',
    relatedLink: '/treatments/peritoneal-dialysis',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'dialysate',
    titleKey: 'glossary.terms.dialysate.title',
    definitionKey: 'glossary.terms.dialysate.definition',
    category: 'dialysis',
  },
  {
    id: 'dialysis-adequacy',
    titleKey: 'glossary.terms.dialysisAdequacy.title',
    definitionKey: 'glossary.terms.dialysisAdequacy.definition',
    category: 'dialysis',
  },
  // Transplant terms
  {
    id: 'transplant',
    titleKey: 'glossary.terms.transplant.title',
    definitionKey: 'glossary.terms.transplant.definition',
    category: 'transplant',
    relatedLink: '/treatments/kidney-transplant',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'living-donor',
    titleKey: 'glossary.terms.livingDonor.title',
    definitionKey: 'glossary.terms.livingDonor.definition',
    category: 'transplant',
    relatedLink: '/treatments/kidney-transplant',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'deceased-donor',
    titleKey: 'glossary.terms.deceasedDonor.title',
    definitionKey: 'glossary.terms.deceasedDonor.definition',
    category: 'transplant',
    relatedLink: '/treatments/kidney-transplant',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'immunosuppressants',
    titleKey: 'glossary.terms.immunosuppressants.title',
    definitionKey: 'glossary.terms.immunosuppressants.definition',
    category: 'transplant',
  },
  {
    id: 'rejection',
    titleKey: 'glossary.terms.rejection.title',
    definitionKey: 'glossary.terms.rejection.definition',
    category: 'transplant',
  },
  {
    id: 'tissue-typing',
    titleKey: 'glossary.terms.tissueTyping.title',
    definitionKey: 'glossary.terms.tissueTyping.definition',
    category: 'transplant',
  },
  {
    id: 'waiting-list',
    titleKey: 'glossary.terms.waitingList.title',
    definitionKey: 'glossary.terms.waitingList.definition',
    category: 'transplant',
  },
  // Kidney function terms
  {
    id: 'kidney-function',
    titleKey: 'glossary.terms.kidneyFunction.title',
    definitionKey: 'glossary.terms.kidneyFunction.definition',
    category: 'kidney-function',
    relatedLink: '/model',
    relatedLinkKey: 'glossary.links.viewModel',
  },
  {
    id: 'egfr',
    titleKey: 'glossary.terms.egfr.title',
    definitionKey: 'glossary.terms.egfr.definition',
    category: 'kidney-function',
  },
  {
    id: 'creatinine',
    titleKey: 'glossary.terms.creatinine.title',
    definitionKey: 'glossary.terms.creatinine.definition',
    category: 'kidney-function',
  },
  {
    id: 'ckd',
    titleKey: 'glossary.terms.ckd.title',
    definitionKey: 'glossary.terms.ckd.definition',
    category: 'kidney-function',
  },
  {
    id: 'kidney-failure',
    titleKey: 'glossary.terms.kidneyFailure.title',
    definitionKey: 'glossary.terms.kidneyFailure.definition',
    category: 'kidney-function',
  },
  {
    id: 'uraemia',
    titleKey: 'glossary.terms.uraemia.title',
    definitionKey: 'glossary.terms.uraemia.definition',
    category: 'kidney-function',
  },
  // Access terms
  {
    id: 'fistula',
    titleKey: 'glossary.terms.fistula.title',
    definitionKey: 'glossary.terms.fistula.definition',
    category: 'access',
    relatedLink: '/treatments/hemodialysis',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'graft',
    titleKey: 'glossary.terms.graft.title',
    definitionKey: 'glossary.terms.graft.definition',
    category: 'access',
  },
  {
    id: 'catheter',
    titleKey: 'glossary.terms.catheter.title',
    definitionKey: 'glossary.terms.catheter.definition',
    category: 'access',
  },
  {
    id: 'pd-catheter',
    titleKey: 'glossary.terms.pdCatheter.title',
    definitionKey: 'glossary.terms.pdCatheter.definition',
    category: 'access',
    relatedLink: '/treatments/peritoneal-dialysis',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'vascular-access',
    titleKey: 'glossary.terms.vascularAccess.title',
    definitionKey: 'glossary.terms.vascularAccess.definition',
    category: 'access',
  },
  // Care terms
  {
    id: 'conservative-care',
    titleKey: 'glossary.terms.conservativeCare.title',
    definitionKey: 'glossary.terms.conservativeCare.definition',
    category: 'care',
    relatedLink: '/treatments/conservative-care',
    relatedLinkKey: 'glossary.links.learnMore',
  },
  {
    id: 'supportive-care',
    titleKey: 'glossary.terms.supportiveCare.title',
    definitionKey: 'glossary.terms.supportiveCare.definition',
    category: 'care',
  },
  {
    id: 'palliative-care',
    titleKey: 'glossary.terms.palliativeCare.title',
    definitionKey: 'glossary.terms.palliativeCare.definition',
    category: 'care',
  },
  {
    id: 'renal-team',
    titleKey: 'glossary.terms.renalTeam.title',
    definitionKey: 'glossary.terms.renalTeam.definition',
    category: 'care',
  },
  {
    id: 'nephrologist',
    titleKey: 'glossary.terms.nephrologist.title',
    definitionKey: 'glossary.terms.nephrologist.definition',
    category: 'care',
  },
  // General terms
  {
    id: 'anaemia',
    titleKey: 'glossary.terms.anaemia.title',
    definitionKey: 'glossary.terms.anaemia.definition',
    category: 'general',
  },
  {
    id: 'blood-pressure',
    titleKey: 'glossary.terms.bloodPressure.title',
    definitionKey: 'glossary.terms.bloodPressure.definition',
    category: 'general',
  },
  {
    id: 'fluid-balance',
    titleKey: 'glossary.terms.fluidBalance.title',
    definitionKey: 'glossary.terms.fluidBalance.definition',
    category: 'general',
  },
  {
    id: 'potassium',
    titleKey: 'glossary.terms.potassium.title',
    definitionKey: 'glossary.terms.potassium.definition',
    category: 'general',
  },
  {
    id: 'phosphate',
    titleKey: 'glossary.terms.phosphate.title',
    definitionKey: 'glossary.terms.phosphate.definition',
    category: 'general',
  },
];

/**
 * Category filter options.
 */
const CATEGORIES = [
  { id: 'all', labelKey: 'glossary.categories.all' },
  { id: 'dialysis', labelKey: 'glossary.categories.dialysis' },
  { id: 'transplant', labelKey: 'glossary.categories.transplant' },
  { id: 'kidney-function', labelKey: 'glossary.categories.kidneyFunction' },
  { id: 'access', labelKey: 'glossary.categories.access' },
  { id: 'care', labelKey: 'glossary.categories.care' },
  { id: 'general', labelKey: 'glossary.categories.general' },
] as const;

/**
 * Glossary page component.
 * Displays searchable and filterable medical term definitions.
 *
 * @component
 * @returns {JSX.Element} The rendered glossary page
 */
export default function GlossaryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter terms based on search and category
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      // Category filter
      if (selectedCategory !== 'all' && term.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = t(term.titleKey).toLowerCase();
        const definition = t(term.definitionKey).toLowerCase();
        return title.includes(query) || definition.includes(query);
      }

      return true;
    });
  }, [searchQuery, selectedCategory, t]);

  // Toggle term expansion
  const toggleTerm = useCallback((termId: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(termId)) {
        next.delete(termId);
      } else {
        next.add(termId);
      }
      return next;
    });
  }, []);

  // Expand all terms
  const expandAll = useCallback(() => {
    setExpandedTerms(new Set(filteredTerms.map((term) => term.id)));
  }, [filteredTerms]);

  // Collapse all terms
  const collapseAll = useCallback(() => {
    setExpandedTerms(new Set());
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'dialysis':
        return 'bg-nhs-orange/10 text-nhs-orange border-nhs-orange/20';
      case 'transplant':
        return 'bg-nhs-green/10 text-nhs-green border-nhs-green/20';
      case 'kidney-function':
        return 'bg-nhs-blue/10 text-nhs-blue border-nhs-blue/20';
      case 'access':
        return 'bg-nhs-purple/10 text-nhs-purple border-nhs-purple/20';
      case 'care':
        return 'bg-nhs-pink/10 text-nhs-pink border-nhs-pink/20';
      default:
        return 'bg-nhs-mid-grey/10 text-nhs-dark-grey border-nhs-mid-grey/20';
    }
  };

  return (
    <main className="min-h-screen bg-bg-page" id="main-content">
      {/* Breadcrumb */}
      <nav className="bg-bg-page border-b border-nhs-pale-grey" aria-label={t('accessibility.breadcrumb')}>
        <div className="max-w-container-xl mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/" className="text-nhs-blue hover:underline">
                {t('nav.home', 'Home')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li>
              <Link to="/hub" className="text-nhs-blue hover:underline">
                {t('hub.title', 'Your Hub')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li className="text-text-secondary" aria-current="page">
              {t('glossary.breadcrumb', 'Glossary')}
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-container-xl mx-auto px-4 py-6 md:py-10">
        {/* Page Header */}
        <header className="max-w-3xl mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-nhs-blue/10 items-center justify-center flex-shrink-0">
              <BookIcon className="w-7 h-7 text-nhs-blue" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3">
                {t('glossary.title', 'Medical Terms Glossary')}
              </h1>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                {t(
                  'glossary.subtitle',
                  'Simple, plain-language definitions of medical terms related to kidney disease and treatment. Use the search box or filter by category to find what you need.'
                )}
              </p>
            </div>
          </div>
        </header>

        {/* Search and Filter Section */}
        <section className="bg-white border border-nhs-pale-grey rounded-2xl p-4 sm:p-6 mb-6" aria-labelledby="search-heading">
          <h2 id="search-heading" className="sr-only">
            {t('glossary.searchSection', 'Search and filter terms')}
          </h2>

          {/* Search Input */}
          <div className="relative mb-4">
            <label htmlFor="glossary-search" className="sr-only">
              {t('glossary.searchLabel', 'Search medical terms')}
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nhs-mid-grey" />
              <input
                ref={searchInputRef}
                id="glossary-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('glossary.searchPlaceholder', 'Search for a term...')}
                className="w-full pl-12 pr-12 py-3.5 text-base border-2 border-nhs-pale-grey rounded-xl focus:outline-none focus:border-nhs-blue focus:ring-3 focus:ring-nhs-blue/20 transition-all placeholder:text-nhs-mid-grey"
                aria-describedby="search-results-count"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-nhs-pale-grey transition-colors"
                  aria-label={t('glossary.clearSearch', 'Clear search')}
                >
                  <ClearIcon className="w-5 h-5 text-nhs-mid-grey" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label={t('glossary.filterByCategory', 'Filter by category')}>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 ${
                  selectedCategory === category.id
                    ? 'bg-nhs-blue text-white border-nhs-blue'
                    : 'bg-white text-text-secondary border-nhs-pale-grey hover:border-nhs-blue hover:text-nhs-blue'
                }`}
                aria-pressed={selectedCategory === category.id}
              >
                {t(category.labelKey, category.id)}
              </button>
            ))}
          </div>

          {/* Results count and expand/collapse */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p id="search-results-count" className="text-text-secondary" aria-live="polite">
              {t('glossary.resultsCount', '{{count}} terms found', { count: filteredTerms.length })}
            </p>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-nhs-blue hover:bg-nhs-blue/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
              >
                {t('glossary.expandAll', 'Expand all')}
              </button>
              <span className="text-nhs-pale-grey">|</span>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-nhs-blue hover:bg-nhs-blue/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
              >
                {t('glossary.collapseAll', 'Collapse all')}
              </button>
            </div>
          </div>
        </section>

        {/* Terms List */}
        <section aria-labelledby="terms-heading">
          <h2 id="terms-heading" className="sr-only">
            {t('glossary.termsList', 'List of medical terms')}
          </h2>

          {filteredTerms.length === 0 ? (
            <div className="bg-white border border-nhs-pale-grey rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-nhs-pale-grey/50 flex items-center justify-center">
                <SearchIcon className="w-8 h-8 text-nhs-mid-grey" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {t('glossary.noResults.title', 'No terms found')}
              </h3>
              <p className="text-text-secondary mb-4">
                {t('glossary.noResults.message', 'Try adjusting your search or filter to find what you are looking for.')}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-nhs-blue font-medium hover:bg-nhs-blue/5 rounded-lg transition-colors"
              >
                {t('glossary.noResults.reset', 'Reset filters')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTerms.map((term) => {
                const isExpanded = expandedTerms.has(term.id);
                return (
                  <article
                    key={term.id}
                    className="bg-white border border-nhs-pale-grey rounded-xl overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <button
                      onClick={() => toggleTerm(term.id)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-focus"
                      aria-expanded={isExpanded}
                      aria-controls={`term-content-${term.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-text-primary truncate">
                          {t(term.titleKey)}
                        </h3>
                        <span
                          className={`hidden sm:inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${getCategoryColor(
                            term.category
                          )}`}
                        >
                          {t(`glossary.categories.${term.category}`)}
                        </span>
                      </div>
                      <ChevronIcon
                        className={`w-5 h-5 text-nhs-mid-grey flex-shrink-0 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div
                        id={`term-content-${term.id}`}
                        className="px-5 pb-5 border-t border-nhs-pale-grey/50"
                      >
                        {/* Mobile category badge */}
                        <span
                          className={`sm:hidden inline-flex mt-4 mb-3 px-2.5 py-0.5 text-xs font-medium rounded-full border ${getCategoryColor(
                            term.category
                          )}`}
                        >
                          {t(`glossary.categories.${term.category}`)}
                        </span>

                        <p className="text-text-secondary leading-relaxed mt-4 sm:mt-4">
                          {t(term.definitionKey)}
                        </p>

                        {term.relatedLink && (
                          <Link
                            to={term.relatedLink}
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-nhs-blue bg-nhs-blue/5 hover:bg-nhs-blue/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
                          >
                            {t(term.relatedLinkKey || 'glossary.links.learnMore', 'Learn more')}
                            <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Help Section */}
        <section
          className="mt-8 bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 border border-nhs-blue/20 rounded-2xl p-6"
          aria-labelledby="help-heading"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-nhs-blue/15 flex items-center justify-center flex-shrink-0">
              <QuestionIcon className="w-6 h-6 text-nhs-blue" />
            </div>
            <div className="flex-1">
              <h2 id="help-heading" className="text-lg font-bold text-text-primary mb-2">
                {t('glossary.help.title', 'Need more help understanding?')}
              </h2>
              <p className="text-text-secondary mb-4">
                {t(
                  'glossary.help.description',
                  'If you cannot find a term or need more explanation, our AI assistant can help answer your questions about kidney disease and treatments.'
                )}
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-nhs-blue text-white font-semibold rounded-xl hover:bg-nhs-blue-dark transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
              >
                <ChatIcon className="w-5 h-5" />
                {t('glossary.help.chatButton', 'Ask a Question')}
              </Link>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <nav
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-nhs-pale-grey"
          aria-label={t('accessibility.pageNavigation')}
        >
          <button
            onClick={() => navigate('/hub')}
            className="inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-3 text-nhs-blue font-medium hover:bg-nhs-blue/5 rounded-xl focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[48px] transition-colors"
          >
            <BackIcon className="w-5 h-5" />
            <span>{t('nav.backToHub', 'Back to Your Hub')}</span>
          </button>
          <Link
            to="/treatments"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-nhs-blue text-nhs-blue font-semibold rounded-xl hover:bg-nhs-blue hover:text-white transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2 min-h-[52px]"
          >
            <span>{t('glossary.viewTreatments', 'View Treatment Options')}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </nav>
      </div>
    </main>
  );
}

// Icon Components
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
