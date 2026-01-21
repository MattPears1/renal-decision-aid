/**
 * @fileoverview Scenario explorer component for the NHS Renal Decision Aid.
 * Allows users to explore "what if" scenarios and see treatment impacts.
 * @module components/ScenarioExplorer
 * @version 2.5.0
 * @since 1.5.0
 * @lastModified 21 January 2026
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

/**
 * Impact of a scenario on a specific treatment.
 * @interface ScenarioImpact
 * @property {TreatmentType} treatment - The treatment type
 * @property {string} treatmentName - Display name for the treatment
 * @property {'excellent' | 'good' | 'moderate' | 'challenging'} rating - Impact rating
 * @property {string} description - Description of the impact
 * @property {string[]} [tips] - Optional tips for managing this scenario
 */
interface ScenarioImpact {
  treatment: TreatmentType;
  treatmentName: string;
  rating: 'excellent' | 'good' | 'moderate' | 'challenging';
  description: string;
  tips?: string[];
}

/**
 * Scenario configuration with impacts on each treatment.
 * @interface Scenario
 * @property {string} id - Unique scenario identifier
 * @property {string} title - Scenario title/question
 * @property {string} description - Detailed description
 * @property {React.ReactNode} icon - Scenario icon
 * @property {ScenarioImpact[]} impacts - Treatment impacts
 */
interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  impacts: ScenarioImpact[];
}

/**
 * Props for the ScenarioExplorer component.
 * @interface ScenarioExplorerProps
 * @property {string} [initialScenario] - Initial scenario to display
 * @property {boolean} [compact=false] - Whether to use compact layout
 */
interface ScenarioExplorerProps {
  initialScenario?: string;
  compact?: boolean;
}

/**
 * Rating badge component displaying impact level.
 * @component
 * @param {Object} props - Component props
 * @param {ScenarioImpact['rating']} props.rating - The rating to display
 * @returns {JSX.Element} The rendered rating badge
 */
const RatingBadge = ({ rating }: { rating: ScenarioImpact['rating'] }) => {
  const { t } = useTranslation();

  const config = {
    excellent: {
      bg: 'bg-nhs-green/10',
      text: 'text-nhs-green',
      border: 'border-nhs-green/30',
      label: t('scenario.rating.excellent', 'Excellent'),
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
    good: {
      bg: 'bg-nhs-blue/10',
      text: 'text-nhs-blue',
      border: 'border-nhs-blue/30',
      label: t('scenario.rating.good', 'Good'),
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-2h2V7h-2z" />
        </svg>
      ),
    },
    moderate: {
      bg: 'bg-nhs-warm-yellow/10',
      text: 'text-amber-700',
      border: 'border-nhs-warm-yellow/30',
      label: t('scenario.rating.moderate', 'Moderate'),
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
    },
    challenging: {
      bg: 'bg-nhs-pink/10',
      text: 'text-nhs-pink',
      border: 'border-nhs-pink/30',
      label: t('scenario.rating.challenging', 'Challenging'),
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
        </svg>
      ),
    },
  };

  const { bg, text, border, label, icon } = config[rating];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text} border ${border}`}>
      {icon}
      {label}
    </span>
  );
};

/**
 * Treatment impact card component with expandable details.
 * @component
 * @param {Object} props - Component props
 * @param {ScenarioImpact} props.impact - The impact data to display
 * @param {boolean} props.isExpanded - Whether the card is expanded
 * @param {() => void} props.onToggle - Toggle handler
 * @returns {JSX.Element} The rendered impact card
 */
const TreatmentImpactCard = ({
  impact,
  isExpanded,
  onToggle,
}: {
  impact: ScenarioImpact;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const { t } = useTranslation();

  const treatmentColors: Record<TreatmentType, string> = {
    'kidney-transplant': 'border-l-nhs-green',
    'hemodialysis': 'border-l-nhs-orange',
    'peritoneal-dialysis': 'border-l-nhs-blue',
    'conservative-care': 'border-l-nhs-purple',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-nhs-pale-grey border-l-4 ${treatmentColors[impact.treatment]} overflow-hidden transition-all`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-focus focus:ring-inset"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-text-primary">{impact.treatmentName}</span>
          <RatingBadge rating={impact.rating} />
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
        <div className="px-4 pb-4 border-t border-nhs-pale-grey">
          <p className="text-text-secondary mt-3 mb-3">{impact.description}</p>

          {impact.tips && impact.tips.length > 0 && (
            <div className="bg-nhs-blue/5 rounded-lg p-3">
              <p className="text-sm font-medium text-nhs-blue mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {t('scenario.tips', 'Tips')}
              </p>
              <ul className="space-y-1">
                {impact.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-nhs-blue mt-1">-</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            to={`/treatments/${impact.treatment}`}
            className="inline-flex items-center gap-2 mt-3 text-sm text-nhs-blue font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded"
          >
            {t('scenario.learnMore', 'Learn more about {{treatment}}', { treatment: impact.treatmentName })}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

/**
 * Scenario explorer component for "what if" scenario exploration.
 *
 * Features:
 * - Multiple predefined scenarios (travel, work, living alone, family)
 * - Treatment impact ratings for each scenario
 * - Expandable treatment cards with tips
 * - Links to detailed treatment pages
 * - Rating legend
 * - Link to full treatment comparison
 *
 * @component
 * @param {ScenarioExplorerProps} props - Component props
 * @returns {JSX.Element} The rendered scenario explorer
 *
 * @example
 * <ScenarioExplorer initialScenario="travel" compact={false} />
 */
export default function ScenarioExplorer({ initialScenario, compact = false }: ScenarioExplorerProps) {
  const { t } = useTranslation();

  // Define scenarios with their impacts on each treatment
  const scenarios: Scenario[] = useMemo(
    () => [
      {
        id: 'travel',
        title: t('scenario.travel.title', 'What if I want to travel?'),
        description: t('scenario.travel.description', 'Explore how each treatment affects your ability to travel for holidays or visits'),
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        ),
        impacts: [
          {
            treatment: 'kidney-transplant',
            treatmentName: t('treatments.types.transplant.title', 'Kidney Transplant'),
            rating: 'excellent',
            description: t('scenario.travel.transplant', 'After recovery, you can travel freely. Take medications with you and know where to seek care if needed.'),
            tips: [
              t('scenario.travel.transplantTip1', 'Carry a letter from your transplant team'),
              t('scenario.travel.transplantTip2', 'Research medical facilities at your destination'),
              t('scenario.travel.transplantTip3', 'Pack extra medication in hand luggage'),
            ],
          },
          {
            treatment: 'hemodialysis',
            treatmentName: t('treatments.types.hemodialysis.title', 'Haemodialysis'),
            rating: 'challenging',
            description: t('scenario.travel.hemodialysis', 'Travel requires advance planning to arrange dialysis at your destination. Holiday dialysis units exist but availability varies.'),
            tips: [
              t('scenario.travel.hemodialysisTip1', 'Book holiday dialysis 6-8 weeks ahead'),
              t('scenario.travel.hemodialysisTip2', 'Your dialysis team can help with arrangements'),
              t('scenario.travel.hemodialysisTip3', 'UK travel is easier than international'),
            ],
          },
          {
            treatment: 'peritoneal-dialysis',
            treatmentName: t('treatments.types.peritonealDialysis.title', 'Peritoneal Dialysis'),
            rating: 'good',
            description: t('scenario.travel.peritoneal', 'More freedom to travel. Supplies can be delivered to your destination or you can take them with you.'),
            tips: [
              t('scenario.travel.peritonealTip1', 'Arrange supply delivery 4-6 weeks ahead'),
              t('scenario.travel.peritonealTip2', 'Airlines usually allow extra luggage for supplies'),
              t('scenario.travel.peritonealTip3', 'Need a clean space for exchanges'),
            ],
          },
          {
            treatment: 'conservative-care',
            treatmentName: t('treatments.types.conservative.title', 'Conservative Management'),
            rating: 'moderate',
            description: t('scenario.travel.conservative', 'No dialysis restrictions, but travel depends on how you feel. Short trips may be easier to manage.'),
            tips: [
              t('scenario.travel.conservativeTip1', 'Discuss travel plans with your care team'),
              t('scenario.travel.conservativeTip2', 'Consider travel insurance carefully'),
              t('scenario.travel.conservativeTip3', 'Plan for rest periods during trips'),
            ],
          },
        ],
      },
      {
        id: 'work',
        title: t('scenario.work.title', 'What if I want to work full-time?'),
        description: t('scenario.work.description', 'See how different treatments fit with maintaining employment'),
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
        impacts: [
          {
            treatment: 'kidney-transplant',
            treatmentName: t('treatments.types.transplant.title', 'Kidney Transplant'),
            rating: 'excellent',
            description: t('scenario.work.transplant', 'After 2-3 months recovery, most people can return to full-time work with near-normal energy levels.'),
            tips: [
              t('scenario.work.transplantTip1', 'Plan a phased return to work'),
              t('scenario.work.transplantTip2', 'You may need time off for clinic appointments'),
              t('scenario.work.transplantTip3', 'Many employers offer flexible arrangements'),
            ],
          },
          {
            treatment: 'hemodialysis',
            treatmentName: t('treatments.types.hemodialysis.title', 'Haemodialysis'),
            rating: 'moderate',
            description: t('scenario.work.hemodialysis', 'Possible but challenging. Sessions take 4-5 hours three times weekly, plus recovery time. Evening/early shifts may help.'),
            tips: [
              t('scenario.work.hemodialysisTip1', 'Discuss flexible hours with employer'),
              t('scenario.work.hemodialysisTip2', 'Evening or early morning dialysis slots'),
              t('scenario.work.hemodialysisTip3', 'Home hemodialysis offers more flexibility'),
            ],
          },
          {
            treatment: 'peritoneal-dialysis',
            treatmentName: t('treatments.types.peritonealDialysis.title', 'Peritoneal Dialysis'),
            rating: 'good',
            description: t('scenario.work.peritoneal', 'APD overnight means days are free for work. CAPD requires breaks for exchanges but many continue working.'),
            tips: [
              t('scenario.work.peritonealTip1', 'APD is ideal for full-time workers'),
              t('scenario.work.peritonealTip2', 'You can do CAPD exchanges at work'),
              t('scenario.work.peritonealTip3', 'Energy levels often better than HD'),
            ],
          },
          {
            treatment: 'conservative-care',
            treatmentName: t('treatments.types.conservative.title', 'Conservative Management'),
            rating: 'moderate',
            description: t('scenario.work.conservative', 'Depends on symptoms and energy. Many continue part-time or reduced hours. Focus is on quality of life.'),
            tips: [
              t('scenario.work.conservativeTip1', 'Consider reducing hours gradually'),
              t('scenario.work.conservativeTip2', 'Discuss adjustments with occupational health'),
              t('scenario.work.conservativeTip3', 'Prioritise activities that matter most'),
            ],
          },
        ],
      },
      {
        id: 'liveAlone',
        title: t('scenario.liveAlone.title', 'What if I live alone?'),
        description: t('scenario.liveAlone.description', 'Understand which treatments work well for people living independently'),
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
        impacts: [
          {
            treatment: 'kidney-transplant',
            treatmentName: t('treatments.types.transplant.title', 'Kidney Transplant'),
            rating: 'good',
            description: t('scenario.liveAlone.transplant', 'You will need support during recovery (2-4 weeks), but afterwards can live independently.'),
            tips: [
              t('scenario.liveAlone.transplantTip1', 'Arrange help for first few weeks post-surgery'),
              t('scenario.liveAlone.transplantTip2', 'Have emergency contacts available'),
              t('scenario.liveAlone.transplantTip3', 'Set up medication reminders'),
            ],
          },
          {
            treatment: 'hemodialysis',
            treatmentName: t('treatments.types.hemodialysis.title', 'Haemodialysis'),
            rating: 'excellent',
            description: t('scenario.liveAlone.hemodialysis', 'Treatment is done at a centre with professional staff. No home setup required. Regular contact with healthcare team.'),
            tips: [
              t('scenario.liveAlone.hemodialysisTip1', 'Hospital transport may be available'),
              t('scenario.liveAlone.hemodialysisTip2', 'Staff monitor you during treatment'),
              t('scenario.liveAlone.hemodialysisTip3', 'Social support from other patients'),
            ],
          },
          {
            treatment: 'peritoneal-dialysis',
            treatmentName: t('treatments.types.peritonealDialysis.title', 'Peritoneal Dialysis'),
            rating: 'good',
            description: t('scenario.liveAlone.peritoneal', 'Many people do PD alone successfully. Training prepares you well. 24/7 phone support available.'),
            tips: [
              t('scenario.liveAlone.peritonealTip1', 'Thorough training before starting'),
              t('scenario.liveAlone.peritonealTip2', 'Regular home visits from PD nurses'),
              t('scenario.liveAlone.peritonealTip3', '24-hour helpline for emergencies'),
            ],
          },
          {
            treatment: 'conservative-care',
            treatmentName: t('treatments.types.conservative.title', 'Conservative Management'),
            rating: 'moderate',
            description: t('scenario.liveAlone.conservative', 'Initially manageable alone. As symptoms progress, you may need increasing support. Community services can help.'),
            tips: [
              t('scenario.liveAlone.conservativeTip1', 'Regular check-ins with care team'),
              t('scenario.liveAlone.conservativeTip2', 'Community support services available'),
              t('scenario.liveAlone.conservativeTip3', 'Plan ahead for future care needs'),
            ],
          },
        ],
      },
      {
        id: 'family',
        title: t('scenario.family.title', 'What if I have young children?'),
        description: t('scenario.family.description', 'Consider how treatments affect caring for children and family time'),
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        impacts: [
          {
            treatment: 'kidney-transplant',
            treatmentName: t('treatments.types.transplant.title', 'Kidney Transplant'),
            rating: 'excellent',
            description: t('scenario.family.transplant', 'After recovery, you can be fully involved in family life. Best quality of life for active parenting.'),
            tips: [
              t('scenario.family.transplantTip1', 'Arrange childcare during recovery'),
              t('scenario.family.transplantTip2', 'Can return to normal parenting activities'),
              t('scenario.family.transplantTip3', 'Good energy for family activities'),
            ],
          },
          {
            treatment: 'hemodialysis',
            treatmentName: t('treatments.types.hemodialysis.title', 'Haemodialysis'),
            rating: 'moderate',
            description: t('scenario.family.hemodialysis', 'Regular time away from home for treatment. Tiredness after sessions may affect family activities. Childcare needed during sessions.'),
            tips: [
              t('scenario.family.hemodialysisTip1', 'Schedule sessions around school hours'),
              t('scenario.family.hemodialysisTip2', 'Involve children age-appropriately'),
              t('scenario.family.hemodialysisTip3', 'Plan family time on non-dialysis days'),
            ],
          },
          {
            treatment: 'peritoneal-dialysis',
            treatmentName: t('treatments.types.peritonealDialysis.title', 'Peritoneal Dialysis'),
            rating: 'good',
            description: t('scenario.family.peritoneal', 'Home-based treatment means more time with family. APD overnight leaves days free for childcare.'),
            tips: [
              t('scenario.family.peritonealTip1', 'APD happens while children sleep'),
              t('scenario.family.peritonealTip2', 'Days are free for school runs'),
              t('scenario.family.peritonealTip3', 'Children can be involved safely'),
            ],
          },
          {
            treatment: 'conservative-care',
            treatmentName: t('treatments.types.conservative.title', 'Conservative Management'),
            rating: 'moderate',
            description: t('scenario.family.conservative', 'No treatment schedule, but energy levels vary. Focus on quality time with family.'),
            tips: [
              t('scenario.family.conservativeTip1', 'Prioritise special family moments'),
              t('scenario.family.conservativeTip2', 'Accept help with childcare when needed'),
              t('scenario.family.conservativeTip3', 'Have honest conversations with children'),
            ],
          },
        ],
      },
    ],
    [t]
  );

  const [selectedScenario, setSelectedScenario] = useState<string>(initialScenario || scenarios[0].id);
  const [expandedTreatment, setExpandedTreatment] = useState<TreatmentType | null>(null);

  const currentScenario = scenarios.find((s) => s.id === selectedScenario) || scenarios[0];

  return (
    <div className="bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-nhs-blue/5 to-nhs-green/5 border-b border-nhs-pale-grey">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-nhs-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {t('scenario.title', 'What If? Scenario Explorer')}
            </h2>
            <p className="text-text-secondary mt-1">
              {t('scenario.subtitle', 'See how different life situations work with each treatment option')}
            </p>
          </div>
        </div>
      </div>

      {/* Scenario selector */}
      <div className={`p-4 border-b border-nhs-pale-grey bg-nhs-pale-grey/30 ${compact ? '' : 'overflow-x-auto'}`}>
        <div className={`flex gap-2 ${compact ? 'flex-wrap' : 'min-w-max'}`}>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario.id);
                setExpandedTreatment(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 ${
                selectedScenario === scenario.id
                  ? 'bg-nhs-blue text-white shadow-md'
                  : 'bg-white text-text-secondary hover:bg-nhs-blue/5 hover:text-nhs-blue border border-nhs-pale-grey'
              }`}
            >
              <span className="w-5 h-5">{scenario.icon}</span>
              <span className="hidden sm:inline">{scenario.title}</span>
              <span className="sm:hidden">{scenario.title.replace('What if ', '').replace('?', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected scenario content */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-nhs-blue">{currentScenario.icon}</span>
          <h3 className="text-lg font-bold text-text-primary">{currentScenario.title}</h3>
        </div>
        <p className="text-text-secondary mb-6">{currentScenario.description}</p>

        {/* Treatment impacts */}
        <div className="space-y-3">
          {currentScenario.impacts.map((impact) => (
            <TreatmentImpactCard
              key={impact.treatment}
              impact={impact}
              isExpanded={expandedTreatment === impact.treatment}
              onToggle={() =>
                setExpandedTreatment(expandedTreatment === impact.treatment ? null : impact.treatment)
              }
            />
          ))}
        </div>

        {/* Summary legend */}
        <div className="mt-6 p-4 bg-nhs-pale-grey/50 rounded-xl">
          <h4 className="text-sm font-semibold text-text-secondary mb-3">
            {t('scenario.legend.title', 'Rating Guide')}
          </h4>
          <div className="flex flex-wrap gap-3">
            <RatingBadge rating="excellent" />
            <RatingBadge rating="good" />
            <RatingBadge rating="moderate" />
            <RatingBadge rating="challenging" />
          </div>
        </div>
      </div>

      {/* Compare action */}
      <div className="p-4 bg-nhs-blue/5 border-t border-nhs-pale-grey">
        <Link
          to="/compare"
          className="flex items-center justify-center gap-2 w-full py-3 bg-nhs-blue text-white font-semibold rounded-xl hover:bg-nhs-blue-dark transition-colors focus:outline-none focus:ring-3 focus:ring-focus focus:ring-offset-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          {t('scenario.compareAll', 'Compare All Treatments')}
        </Link>
      </div>
    </div>
  );
}
