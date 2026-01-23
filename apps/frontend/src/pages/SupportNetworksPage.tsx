/**
 * @fileoverview Support Networks page for finding local kidney support organisations.
 * Provides searchable directory of national and regional support networks.
 * @module pages/SupportNetworksPage
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';
import {
  SUPPORT_NETWORKS,
  searchSupportNetworks,
  filterSupportNetworks,
  getNationalOrganisations,
  type SupportNetwork,
} from '@/data/supportNetworks';

type FilterType = 'all' | 'patient' | 'carer' | 'nhs' | 'national';

/**
 * Support Networks page component.
 * Allows users to search for kidney patient and carer support organisations.
 */
export default function SupportNetworksPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Filter and search results
  const filteredNetworks = useMemo(() => {
    let results: SupportNetwork[];

    if (searchQuery.trim()) {
      results = searchSupportNetworks(searchQuery);
    } else {
      // Show all networks when no search query
      results = [...SUPPORT_NETWORKS];
    }

    // Apply filter
    return filterSupportNetworks(results, activeFilter);
  }, [searchQuery, activeFilter]);

  // Separate national and regional results
  const nationalResults = useMemo(() => {
    return filteredNetworks.filter(
      n => n.type === 'national' || n.type === 'carer-support' || n.type === 'condition-specific'
    );
  }, [filteredNetworks]);

  const regionalResults = useMemo(() => {
    return filteredNetworks.filter(
      n => n.type === 'regional' || n.type === 'nhs-trust'
    );
  }, [filteredNetworks]);

  const filters: { key: FilterType; labelKey: string }[] = [
    { key: 'all', labelKey: 'supportNetworks.filters.all' },
    { key: 'patient', labelKey: 'supportNetworks.filters.patient' },
    { key: 'carer', labelKey: 'supportNetworks.filters.carer' },
    { key: 'nhs', labelKey: 'supportNetworks.filters.nhs' },
  ];

  const isCarerMode = session?.userRole === 'carer';

  return (
    <main className="min-h-screen bg-bg-page pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-nhs-purple to-nhs-blue text-white">
        <div className="max-w-container-lg mx-auto px-4 py-8 sm:py-12">
          <button
            onClick={() => navigate('/hub')}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <BackIcon />
            <span>{t('nav.backToHub', 'Back to Hub')}</span>
          </button>

          <div
            className={`transform transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <NetworkIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {t('supportNetworks.title', 'Support Networks')}
                </h1>
                <p className="text-white/80 text-sm sm:text-base mt-1">
                  {t('supportNetworks.subtitle', 'Find local and national kidney support organisations')}
                </p>
              </div>
            </div>

            {/* Search Box */}
            <div className="mt-6 max-w-xl">
              <label htmlFor="support-search" className="sr-only">
                {t('supportNetworks.searchLabel', 'Search for support in your area')}
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  id="support-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('supportNetworks.searchPlaceholder', 'Search by city or region (e.g., Bradford, Leeds)')}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl
                           text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50
                           focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-container-lg mx-auto px-4 py-6">
        {/* Filters */}
        <div
          className={`flex flex-wrap gap-2 mb-6 transform transition-all duration-500 delay-100
                     ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                         ${activeFilter === filter.key
                           ? 'bg-nhs-purple text-white'
                           : 'bg-white text-text-primary border border-nhs-pale-grey hover:border-nhs-purple hover:text-nhs-purple'
                         }`}
            >
              {t(filter.labelKey)}
            </button>
          ))}
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="text-text-secondary mb-4">
            {filteredNetworks.length > 0
              ? t('supportNetworks.showingResults', 'Showing {{count}} results for "{{query}}"', {
                  count: filteredNetworks.length,
                  query: searchQuery,
                })
              : t('supportNetworks.noResults', 'No support networks found for "{{query}}"', {
                  query: searchQuery,
                })}
          </p>
        )}

        {/* No results hint */}
        {searchQuery && filteredNetworks.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800">
              {t('supportNetworks.noResultsHint', 'Try searching for a different city or region, or browse our national organisations below.')}
            </p>
          </div>
        )}

        {/* National Organisations Section */}
        {nationalResults.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <GlobeIcon className="w-5 h-5 text-nhs-blue" />
              {t('supportNetworks.national', 'National Organisations')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nationalResults.map((network) => (
                <SupportNetworkCard
                  key={network.id}
                  network={network}
                  isCarerMode={isCarerMode}
                />
              ))}
            </div>
          </section>
        )}

        {/* Regional Support Section */}
        {regionalResults.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-nhs-purple" />
              {t('supportNetworks.regional', 'Regional Support')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionalResults.map((network) => (
                <SupportNetworkCard
                  key={network.id}
                  network={network}
                  isCarerMode={isCarerMode}
                />
              ))}
            </div>
          </section>
        )}

        {/* Show national organisations if no search and filtered results are empty */}
        {!searchQuery && filteredNetworks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-text-secondary">
              {t('supportNetworks.noResults', 'No support networks found for this filter.')}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Support network card component.
 */
function SupportNetworkCard({
  network,
  isCarerMode,
}: {
  network: SupportNetwork;
  isCarerMode: boolean;
}) {
  const { t } = useTranslation();

  const typeLabel = {
    national: t('supportNetworks.charity', 'Charity'),
    regional: t('supportNetworks.regional', 'Regional'),
    'nhs-trust': t('supportNetworks.nhsTrust', 'NHS Trust'),
    'condition-specific': t('supportNetworks.charity', 'Charity'),
    'carer-support': t('supportNetworks.carerOrg', 'Carer Organisation'),
  }[network.type];

  const typeColor = {
    national: 'bg-nhs-blue/10 text-nhs-blue',
    regional: 'bg-nhs-purple/10 text-nhs-purple',
    'nhs-trust': 'bg-nhs-green/10 text-nhs-green-dark',
    'condition-specific': 'bg-amber-100 text-amber-800',
    'carer-support': 'bg-pink-100 text-pink-800',
  }[network.type];

  return (
    <div className="bg-white border border-nhs-pale-grey rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
              {typeLabel}
            </span>
            {network.forCarers && isCarerMode && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                {t('supportNetworks.forCarers', 'For carers')}
              </span>
            )}
          </div>
          <h3 className="font-bold text-text-primary">{network.name}</h3>
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
        {network.description}
      </p>

      {/* Services */}
      <div className="mb-4">
        <p className="text-xs text-text-secondary mb-2">
          {t('supportNetworks.services', 'Services offered')}:
        </p>
        <div className="flex flex-wrap gap-1">
          {network.services.slice(0, 3).map((service, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-nhs-pale-grey rounded text-xs text-text-secondary"
            >
              {service}
            </span>
          ))}
          {network.services.length > 3 && (
            <span className="px-2 py-1 text-xs text-text-secondary">
              +{network.services.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <a
          href={network.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-nhs-blue text-white text-sm font-medium
                   rounded-lg hover:bg-nhs-blue-dark transition-colors"
        >
          <ExternalLinkIcon className="w-4 h-4" />
          {t('supportNetworks.visitWebsite', 'Visit Website')}
        </a>

        {network.phone && (
          <a
            href={`tel:${network.phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-nhs-green text-white text-sm font-medium
                     rounded-lg hover:bg-nhs-green-dark transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            {network.phone}
          </a>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Icon Components
// =============================================================================

function BackIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function NetworkIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
  );
}

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}
