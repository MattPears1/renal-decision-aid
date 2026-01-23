/**
 * @fileoverview Decision Journal component for the NHS Renal Decision Aid.
 * Allows users to record their thoughts, concerns, and reflections about treatments
 * during their decision-making process.
 *
 * @module components/decision/DecisionJournal
 * @version 1.0.0
 * @since 2.6.0
 * @lastModified 23 January 2026
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

/**
 * Journal entry structure
 */
interface JournalEntry {
  id: string;
  text: string;
  category: 'thought' | 'concern' | 'question' | 'positive';
  treatment?: TreatmentType;
  timestamp: number;
  isResolved?: boolean;
}

/**
 * Category configuration
 */
const CATEGORIES = [
  { id: 'thought', labelKey: 'decision.journal.categories.thought', icon: <ThoughtIcon />, color: 'nhs-blue' },
  { id: 'concern', labelKey: 'decision.journal.categories.concern', icon: <ConcernIcon />, color: 'nhs-orange' },
  { id: 'question', labelKey: 'decision.journal.categories.question', icon: <QuestionIcon />, color: 'nhs-purple' },
  { id: 'positive', labelKey: 'decision.journal.categories.positive', icon: <PositiveIcon />, color: 'nhs-green' },
] as const;

const TREATMENTS = [
  { id: 'kidney-transplant', labelKey: 'treatments.types.transplant.title' },
  { id: 'hemodialysis', labelKey: 'treatments.types.hemodialysis.title' },
  { id: 'peritoneal-dialysis', labelKey: 'treatments.types.peritonealDialysis.title' },
  { id: 'conservative-care', labelKey: 'treatments.types.conservative.title' },
] as const;

interface DecisionJournalProps {
  /** Initial journal entries */
  initialEntries?: JournalEntry[];
  /** Callback when entries change */
  onEntriesChange?: (entries: JournalEntry[]) => void;
  /** Display variant */
  variant?: 'full' | 'compact' | 'modal';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Decision Journal component.
 *
 * Helps users track their thoughts and concerns throughout the decision-making process.
 * Entries can be categorized, linked to specific treatments, and marked as resolved.
 *
 * @component
 * @param {DecisionJournalProps} props - Component props
 * @returns {JSX.Element} The rendered decision journal
 */
export default function DecisionJournal({
  initialEntries = [],
  onEntriesChange,
  variant = 'full',
  className = '',
}: DecisionJournalProps) {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [newEntry, setNewEntry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JournalEntry['category']>('thought');
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | undefined>(undefined);
  const [filterCategory, setFilterCategory] = useState<JournalEntry['category'] | 'all'>('all');
  const [showResolved, setShowResolved] = useState(true);
  const [isExpanded, setIsExpanded] = useState(variant === 'full');

  // Add a new entry
  const addEntry = useCallback(() => {
    if (!newEntry.trim()) return;

    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      text: newEntry.trim(),
      category: selectedCategory,
      treatment: selectedTreatment,
      timestamp: Date.now(),
      isResolved: false,
    };

    setEntries((prev) => {
      const updated = [entry, ...prev];
      onEntriesChange?.(updated);
      return updated;
    });

    setNewEntry('');
  }, [newEntry, selectedCategory, selectedTreatment, onEntriesChange]);

  // Toggle entry resolved status
  const toggleResolved = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.map((entry) =>
        entry.id === id ? { ...entry, isResolved: !entry.isResolved } : entry
      );
      onEntriesChange?.(updated);
      return updated;
    });
  }, [onEntriesChange]);

  // Delete an entry
  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((entry) => entry.id !== id);
      onEntriesChange?.(updated);
      return updated;
    });
  }, [onEntriesChange]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (filterCategory !== 'all') {
      filtered = filtered.filter((entry) => entry.category === filterCategory);
    }

    if (!showResolved) {
      filtered = filtered.filter((entry) => !entry.isResolved);
    }

    return filtered;
  }, [entries, filterCategory, showResolved]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(i18n.language || 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get category config
  const getCategoryConfig = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  };

  // Stats
  const stats = useMemo(() => ({
    total: entries.length,
    resolved: entries.filter((e) => e.isResolved).length,
    concerns: entries.filter((e) => e.category === 'concern' && !e.isResolved).length,
    questions: entries.filter((e) => e.category === 'question' && !e.isResolved).length,
  }), [entries]);

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-nhs-pale-grey overflow-hidden ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-nhs-pale-grey/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nhs-purple/10 rounded-xl flex items-center justify-center">
              <JournalIcon className="w-5 h-5 text-nhs-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">
                {t('decision.journal.title', 'Decision Journal')}
              </h3>
              <p className="text-xs text-text-secondary">
                {stats.total > 0
                  ? t('decision.journal.entryCount', '{{count}} entries', { count: stats.total })
                  : t('decision.journal.noEntries', 'Record your thoughts')}
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isExpanded && (
          <div className="p-4 pt-0 border-t border-nhs-pale-grey">
            {/* Quick add */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEntry()}
                placeholder={t('decision.journal.placeholder', 'Write a thought or concern...')}
                className="flex-1 px-3 py-2 text-sm border border-nhs-pale-grey rounded-lg focus:outline-none focus:border-nhs-blue"
              />
              <button
                onClick={addEntry}
                disabled={!newEntry.trim()}
                className="px-3 py-2 bg-nhs-blue text-white rounded-lg text-sm font-medium disabled:bg-nhs-mid-grey"
              >
                {t('common.add', 'Add')}
              </button>
            </div>

            {/* Recent entries */}
            {entries.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className={`p-2 rounded-lg mb-2 text-sm ${
                  entry.isResolved ? 'bg-nhs-pale-grey/50 text-text-muted line-through' : 'bg-nhs-pale-grey/30'
                }`}
              >
                {entry.text}
              </div>
            ))}

            {entries.length > 3 && (
              <p className="text-xs text-text-muted text-center">
                {t('decision.journal.moreEntries', '+{{count}} more entries', { count: entries.length - 3 })}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-nhs-purple/10 to-nhs-pink/10 border-b border-nhs-pale-grey">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-nhs-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <JournalIcon className="w-6 h-6 text-nhs-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {t('decision.journal.title', 'Decision Journal')}
            </h2>
            <p className="text-sm text-text-secondary">
              {t('decision.journal.subtitle', 'Record your thoughts, concerns, and questions as you explore your options.')}
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-nhs-purple/20">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-text-primary">{stats.total}</span>
              <span className="text-sm text-text-secondary">{t('decision.journal.stats.total', 'entries')}</span>
            </div>
            {stats.concerns > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-nhs-orange">{stats.concerns}</span>
                <span className="text-sm text-text-secondary">{t('decision.journal.stats.concerns', 'active concerns')}</span>
              </div>
            )}
            {stats.resolved > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-nhs-green">{stats.resolved}</span>
                <span className="text-sm text-text-secondary">{t('decision.journal.stats.resolved', 'resolved')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add entry form */}
      <div className="p-5 sm:p-6 border-b border-nhs-pale-grey">
        <div className="space-y-4">
          {/* Text input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('decision.journal.whatOnMind', "What's on your mind?")}
            </label>
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder={t('decision.journal.placeholder', 'Write your thoughts here...')}
              rows={3}
              className="w-full px-4 py-3 text-sm border-2 border-nhs-pale-grey rounded-xl focus:outline-none focus:border-nhs-blue focus:ring-2 focus:ring-nhs-blue/20 resize-none"
            />
          </div>

          {/* Category selection */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? `bg-${cat.color}/20 text-${cat.color} ring-2 ring-${cat.color}/30`
                    : 'bg-nhs-pale-grey/50 text-text-secondary hover:bg-nhs-pale-grey'
                }`}
              >
                <span className="w-4 h-4">{cat.icon}</span>
                {t(cat.labelKey, cat.id)}
              </button>
            ))}
          </div>

          {/* Treatment selection (optional) */}
          <div>
            <label className="block text-xs text-text-muted mb-2">
              {t('decision.journal.relatedTreatment', 'Related to a specific treatment? (optional)')}
            </label>
            <select
              value={selectedTreatment || ''}
              onChange={(e) => setSelectedTreatment(e.target.value as TreatmentType || undefined)}
              className="px-3 py-2 text-sm border border-nhs-pale-grey rounded-lg focus:outline-none focus:border-nhs-blue"
            >
              <option value="">{t('decision.journal.allTreatments', 'No specific treatment')}</option>
              {TREATMENTS.map((treatment) => (
                <option key={treatment.id} value={treatment.id}>
                  {t(treatment.labelKey, treatment.id)}
                </option>
              ))}
            </select>
          </div>

          {/* Add button */}
          <button
            onClick={addEntry}
            disabled={!newEntry.trim()}
            className="w-full py-3 bg-nhs-purple text-white font-semibold rounded-xl hover:bg-nhs-purple/90 disabled:bg-nhs-mid-grey disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
          >
            {t('decision.journal.addEntry', 'Add Entry')}
          </button>
        </div>
      </div>

      {/* Filters */}
      {entries.length > 0 && (
        <div className="p-4 bg-nhs-pale-grey/30 border-b border-nhs-pale-grey flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCategory === 'all'
                  ? 'bg-nhs-blue text-white'
                  : 'bg-white text-text-secondary border border-nhs-pale-grey hover:border-nhs-blue/50'
              }`}
            >
              {t('decision.journal.filter.all', 'All')}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterCategory === cat.id
                    ? `bg-${cat.color} text-white`
                    : 'bg-white text-text-secondary border border-nhs-pale-grey hover:border-nhs-blue/50'
                }`}
              >
                {t(cat.labelKey, cat.id)}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="w-4 h-4 rounded border-nhs-mid-grey text-nhs-blue focus:ring-nhs-blue"
            />
            {t('decision.journal.showResolved', 'Show resolved')}
          </label>
        </div>
      )}

      {/* Entries list */}
      <div className="p-5 sm:p-6 max-h-96 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <JournalIcon className="w-12 h-12 mx-auto text-nhs-mid-grey mb-3" />
            <p className="text-text-secondary">
              {entries.length === 0
                ? t('decision.journal.empty', 'Start recording your thoughts and concerns.')
                : t('decision.journal.noMatching', 'No entries match your filter.')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => {
              const catConfig = getCategoryConfig(entry.category);
              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border transition-all ${
                    entry.isResolved
                      ? 'bg-nhs-pale-grey/30 border-nhs-pale-grey/50'
                      : `bg-${catConfig.color}/5 border-${catConfig.color}/20`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        entry.isResolved ? 'bg-nhs-mid-grey/30 text-nhs-mid-grey' : `bg-${catConfig.color}/20 text-${catConfig.color}`
                      }`}
                    >
                      {catConfig.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${entry.isResolved ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                        {entry.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs text-text-muted">
                          {formatTime(entry.timestamp)}
                        </span>
                        {entry.treatment && (
                          <span className="text-xs bg-nhs-pale-grey px-2 py-0.5 rounded">
                            {t(`treatments.types.${entry.treatment === 'kidney-transplant' ? 'transplant' : entry.treatment === 'peritoneal-dialysis' ? 'peritonealDialysis' : entry.treatment === 'conservative-care' ? 'conservative' : 'hemodialysis'}.title`, entry.treatment)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleResolved(entry.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          entry.isResolved
                            ? 'text-nhs-green hover:bg-nhs-green/10'
                            : 'text-text-muted hover:text-nhs-green hover:bg-nhs-green/10'
                        }`}
                        title={entry.isResolved ? t('decision.journal.unresolve', 'Mark as unresolved') : t('decision.journal.resolve', 'Mark as resolved')}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-2 rounded-lg text-text-muted hover:text-nhs-red hover:bg-nhs-red/10 transition-colors"
                        title={t('common.remove', 'Remove')}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Print action */}
      {entries.length > 0 && (
        <div className="p-4 bg-nhs-pale-grey/30 border-t border-nhs-pale-grey">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-nhs-blue hover:bg-nhs-blue/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus print:hidden"
          >
            <PrintIcon className="w-4 h-4" />
            {t('decision.journal.printEntries', 'Print journal entries')}
          </button>
        </div>
      )}
    </div>
  );
}

// Icon components
function JournalIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ThoughtIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function ConcernIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function PositiveIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function PrintIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
