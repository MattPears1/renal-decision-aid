/**
 * @fileoverview Family Discussion Prompts component for the NHS Renal Decision Aid.
 * Provides conversation starters and guidance for users to involve their family,
 * carers, and support network in the treatment decision process.
 *
 * @module components/decision/FamilyDiscussionPrompts
 * @version 1.0.0
 * @since 2.6.0
 * @lastModified 23 January 2026
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Discussion prompt structure
 */
interface DiscussionPrompt {
  id: string;
  textKey: string;
  contextKey?: string;
  category: 'general' | 'feelings' | 'practical' | 'support';
}

/**
 * Role-specific prompts configuration
 */
interface RoleConfig {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
  prompts: DiscussionPrompt[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'partner',
    labelKey: 'decision.family.roles.partner',
    descriptionKey: 'decision.family.roles.partnerDesc',
    icon: <HeartIcon />,
    color: 'nhs-pink',
    prompts: [
      { id: 'partner-1', textKey: 'decision.family.prompts.partner.daily', category: 'practical' },
      { id: 'partner-2', textKey: 'decision.family.prompts.partner.support', category: 'support' },
      { id: 'partner-3', textKey: 'decision.family.prompts.partner.feelings', category: 'feelings' },
      { id: 'partner-4', textKey: 'decision.family.prompts.partner.future', category: 'general' },
      { id: 'partner-5', textKey: 'decision.family.prompts.partner.together', category: 'support' },
    ],
  },
  {
    id: 'children',
    labelKey: 'decision.family.roles.children',
    descriptionKey: 'decision.family.roles.childrenDesc',
    icon: <ChildIcon />,
    color: 'nhs-blue',
    prompts: [
      { id: 'children-1', textKey: 'decision.family.prompts.children.explain', category: 'general' },
      { id: 'children-2', textKey: 'decision.family.prompts.children.feelings', category: 'feelings' },
      { id: 'children-3', textKey: 'decision.family.prompts.children.routine', category: 'practical' },
      { id: 'children-4', textKey: 'decision.family.prompts.children.questions', category: 'support' },
      { id: 'children-5', textKey: 'decision.family.prompts.children.help', category: 'support' },
    ],
  },
  {
    id: 'parents',
    labelKey: 'decision.family.roles.parents',
    descriptionKey: 'decision.family.roles.parentsDesc',
    icon: <ParentIcon />,
    color: 'nhs-purple',
    prompts: [
      { id: 'parents-1', textKey: 'decision.family.prompts.parents.update', category: 'general' },
      { id: 'parents-2', textKey: 'decision.family.prompts.parents.concerns', category: 'feelings' },
      { id: 'parents-3', textKey: 'decision.family.prompts.parents.involvement', category: 'support' },
      { id: 'parents-4', textKey: 'decision.family.prompts.parents.donor', category: 'practical' },
    ],
  },
  {
    id: 'friends',
    labelKey: 'decision.family.roles.friends',
    descriptionKey: 'decision.family.roles.friendsDesc',
    icon: <FriendsIcon />,
    color: 'nhs-aqua-green',
    prompts: [
      { id: 'friends-1', textKey: 'decision.family.prompts.friends.share', category: 'general' },
      { id: 'friends-2', textKey: 'decision.family.prompts.friends.support', category: 'support' },
      { id: 'friends-3', textKey: 'decision.family.prompts.friends.social', category: 'practical' },
      { id: 'friends-4', textKey: 'decision.family.prompts.friends.listen', category: 'feelings' },
    ],
  },
  {
    id: 'employer',
    labelKey: 'decision.family.roles.employer',
    descriptionKey: 'decision.family.roles.employerDesc',
    icon: <WorkIcon />,
    color: 'nhs-orange',
    prompts: [
      { id: 'employer-1', textKey: 'decision.family.prompts.employer.inform', category: 'general' },
      { id: 'employer-2', textKey: 'decision.family.prompts.employer.adjustments', category: 'practical' },
      { id: 'employer-3', textKey: 'decision.family.prompts.employer.appointments', category: 'practical' },
      { id: 'employer-4', textKey: 'decision.family.prompts.employer.rights', category: 'support' },
    ],
  },
];

/**
 * General conversation tips
 */
const CONVERSATION_TIPS = [
  'decision.family.tips.timing',
  'decision.family.tips.listen',
  'decision.family.tips.emotions',
  'decision.family.tips.professional',
  'decision.family.tips.revisit',
];

interface FamilyDiscussionPromptsProps {
  /** Display variant */
  variant?: 'full' | 'compact' | 'card';
  /** Initial selected role */
  initialRole?: string;
  /** Show conversation tips */
  showTips?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Family Discussion Prompts component.
 *
 * Provides structured conversation starters to help users involve their support
 * network in the decision-making process, following NHS shared decision making principles.
 *
 * @component
 * @param {FamilyDiscussionPromptsProps} props - Component props
 * @returns {JSX.Element} The rendered discussion prompts
 */
export default function FamilyDiscussionPrompts({
  variant = 'full',
  initialRole,
  showTips = true,
  className = '',
}: FamilyDiscussionPromptsProps) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<string | null>(initialRole || null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['general', 'feelings', 'practical', 'support']);

  // Get selected role configuration
  const selectedRoleConfig = useMemo(() => {
    return ROLES.find((r) => r.id === selectedRole);
  }, [selectedRole]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Group prompts by category
  const promptsByCategory = useMemo(() => {
    if (!selectedRoleConfig) return {};

    return selectedRoleConfig.prompts.reduce(
      (acc, prompt) => {
        if (!acc[prompt.category]) {
          acc[prompt.category] = [];
        }
        acc[prompt.category].push(prompt);
        return acc;
      },
      {} as Record<string, DiscussionPrompt[]>
    );
  }, [selectedRoleConfig]);

  // Category display configuration
  const categoryConfig: Record<string, { labelKey: string; icon: React.ReactNode }> = {
    general: { labelKey: 'decision.family.categories.general', icon: <ChatIcon className="w-4 h-4" /> },
    feelings: { labelKey: 'decision.family.categories.feelings', icon: <HeartIcon className="w-4 h-4" /> },
    practical: { labelKey: 'decision.family.categories.practical', icon: <ChecklistIcon className="w-4 h-4" /> },
    support: { labelKey: 'decision.family.categories.support', icon: <HandsIcon className="w-4 h-4" /> },
  };

  // Card variant - minimal display
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-xl border border-nhs-pale-grey p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-nhs-pink/10 rounded-xl flex items-center justify-center">
            <FamilyIcon className="w-5 h-5 text-nhs-pink" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">
              {t('decision.family.title', 'Discuss with Family')}
            </h3>
            <p className="text-xs text-text-secondary">
              {t('decision.family.cardSubtitle', 'Get conversation starters')}
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-3">
          {t('decision.family.cardDescription', 'Including your loved ones in your decision can provide valuable support and perspective.')}
        </p>

        <button className="w-full py-2 text-sm font-medium text-nhs-blue hover:bg-nhs-blue/10 rounded-lg transition-colors">
          {t('decision.family.viewPrompts', 'View conversation prompts')}
        </button>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-nhs-pale-grey overflow-hidden ${className}`}>
        <div className="p-4 bg-nhs-pink/5 border-b border-nhs-pale-grey">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <FamilyIcon className="w-5 h-5 text-nhs-pink" />
            {t('decision.family.titleShort', 'Talk to Your Support Network')}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {t('decision.family.compactSubtitle', 'Select who you want to talk to for conversation ideas.')}
          </p>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRole === role.id
                    ? `bg-${role.color}/20 text-${role.color} ring-2 ring-${role.color}/30`
                    : 'bg-nhs-pale-grey/50 text-text-secondary hover:bg-nhs-pale-grey'
                }`}
              >
                <span className="w-4 h-4">{role.icon}</span>
                {t(role.labelKey, role.id)}
              </button>
            ))}
          </div>

          {selectedRoleConfig && (
            <div className="bg-nhs-pale-grey/30 rounded-lg p-3">
              <p className="text-sm text-text-secondary mb-2">
                {t(selectedRoleConfig.descriptionKey, '')}
              </p>
              <ul className="space-y-2">
                {selectedRoleConfig.prompts.slice(0, 3).map((prompt) => (
                  <li key={prompt.id} className="flex items-start gap-2 text-sm text-text-primary">
                    <span className="text-nhs-blue mt-0.5">-</span>
                    {t(prompt.textKey, prompt.id)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-nhs-pink/10 to-nhs-purple/10 border-b border-nhs-pale-grey">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-nhs-pink/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FamilyIcon className="w-6 h-6 text-nhs-pink" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {t('decision.family.title', 'Discuss with Your Support Network')}
            </h2>
            <p className="text-sm text-text-secondary">
              {t('decision.family.subtitle', 'Involving your loved ones can help you feel supported and make a more confident decision. Here are some conversation starters.')}
            </p>
          </div>
        </div>
      </div>

      {/* Why involve family section */}
      <div className="p-5 sm:p-6 border-b border-nhs-pale-grey bg-nhs-warm-yellow/5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <InfoIcon className="w-4 h-4 text-nhs-orange" />
          {t('decision.family.whyTitle', 'Why involve others in your decision?')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: 'decision.family.why.perspective', icon: <EyeIcon className="w-4 h-4" /> },
            { key: 'decision.family.why.support', icon: <HeartIcon className="w-4 h-4" /> },
            { key: 'decision.family.why.practical', icon: <ChecklistIcon className="w-4 h-4" /> },
            { key: 'decision.family.why.emotional', icon: <SmileIcon className="w-4 h-4" /> },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-nhs-blue mt-0.5">{item.icon}</span>
              {t(item.key, '')}
            </div>
          ))}
        </div>
      </div>

      {/* Role selector */}
      <div className="p-5 sm:p-6 border-b border-nhs-pale-grey">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          {t('decision.family.selectRole', 'Who would you like to talk to?')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedRole === role.id
                  ? `bg-${role.color}/10 border-${role.color}/50 ring-2 ring-${role.color}/20`
                  : 'bg-white border-nhs-pale-grey hover:border-nhs-blue/30 hover:bg-nhs-blue/5'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedRole === role.id ? `bg-${role.color}/20 text-${role.color}` : 'bg-nhs-pale-grey text-text-muted'
                }`}
              >
                {role.icon}
              </div>
              <span className={`text-sm font-medium ${selectedRole === role.id ? `text-${role.color}` : 'text-text-primary'}`}>
                {t(role.labelKey, role.id)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompts for selected role */}
      {selectedRoleConfig && (
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${selectedRoleConfig.color}/20 text-${selectedRoleConfig.color}`}>
              {selectedRoleConfig.icon}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">
                {t('decision.family.talkingTo', 'Talking to your')} {t(selectedRoleConfig.labelKey, selectedRoleConfig.id)}
              </h3>
              <p className="text-xs text-text-secondary">
                {t(selectedRoleConfig.descriptionKey, '')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(promptsByCategory).map(([category, prompts]) => {
              const config = categoryConfig[category];
              const isExpanded = expandedCategories.includes(category);

              return (
                <div key={category} className="border border-nhs-pale-grey rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-nhs-pale-grey/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-nhs-blue">{config.icon}</span>
                      <span className="font-medium text-text-primary">
                        {t(config.labelKey, category)}
                      </span>
                      <span className="text-xs text-text-muted bg-nhs-pale-grey px-2 py-0.5 rounded">
                        {prompts.length}
                      </span>
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
                    <div className="px-4 pb-4 border-t border-nhs-pale-grey bg-nhs-pale-grey/20">
                      <ul className="space-y-3 pt-3">
                        {prompts.map((prompt) => (
                          <li key={prompt.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <QuoteIcon className="w-4 h-4 text-nhs-blue flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-text-primary italic">
                              "{t(prompt.textKey, prompt.id)}"
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation tips */}
      {showTips && (
        <div className="p-5 sm:p-6 bg-nhs-blue/5 border-t border-nhs-blue/20">
          <h3 className="text-sm font-semibold text-nhs-blue mb-3 flex items-center gap-2">
            <LightbulbIcon className="w-4 h-4" />
            {t('decision.family.tipsTitle', 'Tips for a good conversation')}
          </h3>
          <ul className="space-y-2">
            {CONVERSATION_TIPS.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-nhs-blue font-bold">{idx + 1}.</span>
                {t(tip, '')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Encouragement */}
      <div className="p-4 bg-nhs-green/5 border-t border-nhs-green/20">
        <p className="text-center text-sm text-text-secondary">
          <span className="font-medium text-nhs-green">{t('decision.family.remember', 'Remember:')}</span>{' '}
          {t('decision.family.encouragement', 'It is okay to take your time and have multiple conversations. Your loved ones want to support you.')}
        </p>
      </div>
    </div>
  );
}

// Icon components
function FamilyIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function HeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ChildIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v3m-3 0h6m-6 0l-3 12m6-12l3 12" />
    </svg>
  );
}

function ParentIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}

function FriendsIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function WorkIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function ChatIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChecklistIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function HandsIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3v12" />
      <path d="M18 9a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h8a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3" />
    </svg>
  );
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function EyeIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SmileIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function QuoteIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

function LightbulbIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
    </svg>
  );
}
