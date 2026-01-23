/**
 * @fileoverview Treatment timeline component for the NHS Renal Decision Aid.
 * Displays a "day in the life" view for each treatment option.
 * @module components/TreatmentTimeline
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TreatmentType } from '@renal-decision-aid/shared-types';

/**
 * Activity entry for a timeline.
 * @interface TimelineActivity
 * @property {string} time - Time of the activity (e.g., "7:00")
 * @property {string} activity - Description of the activity
 * @property {string} [duration] - Optional duration string
 * @property {string} icon - Icon type for the activity
 * @property {boolean} [isTreatmentRelated] - Whether activity is treatment-related
 */
interface TimelineActivity {
  time: string;
  activity: string;
  duration?: string;
  icon: 'wake' | 'meal' | 'treatment' | 'work' | 'exercise' | 'rest' | 'sleep' | 'travel' | 'medication' | 'social' | 'home';
  isTreatmentRelated?: boolean;
}

/**
 * Full day schedule organized by time of day.
 * @interface DaySchedule
 * @property {TimelineActivity[]} morning - Morning activities
 * @property {TimelineActivity[]} afternoon - Afternoon activities
 * @property {TimelineActivity[]} evening - Evening activities
 * @property {TimelineActivity[]} night - Night activities
 */
interface DaySchedule {
  morning: TimelineActivity[];
  afternoon: TimelineActivity[];
  evening: TimelineActivity[];
  night: TimelineActivity[];
}

/** @typedef {'morning' | 'afternoon' | 'evening' | 'night'} TimeOfDay */
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Props for the TreatmentTimeline component.
 * @interface TreatmentTimelineProps
 * @property {TreatmentType} treatmentType - The treatment type to display
 * @property {boolean} [compact=false] - Whether to use compact layout
 */
interface TreatmentTimelineProps {
  treatmentType: TreatmentType;
  compact?: boolean;
}

/**
 * Activity icon component displaying different icons based on activity type.
 * @component
 * @param {Object} props - Component props
 * @param {TimelineActivity['icon']} props.type - The icon type to display
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The rendered icon
 */
const ActivityIcon = ({ type, className = '' }: { type: TimelineActivity['icon']; className?: string }) => {
  const baseClass = `w-5 h-5 ${className}`;

  switch (type) {
    case 'wake':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case 'meal':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case 'treatment':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case 'work':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'exercise':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'rest':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case 'sleep':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case 'travel':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case 'medication':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7z" />
          <path d="M8.5 8.5l7 7" />
        </svg>
      );
    case 'social':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'home':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

/**
 * Time section component displaying activities for a specific time of day.
 * @component
 * @param {Object} props - Component props
 * @param {TimeOfDay} props.timeOfDay - The time period (morning, afternoon, evening, night)
 * @param {TimelineActivity[]} props.activities - Activities for this time period
 * @param {string} props.label - Display label for the section
 * @param {string} props.bgColor - Tailwind background color class
 * @param {string} props.borderColor - Tailwind border color class
 * @param {string} props.accentColor - Tailwind accent color class
 * @returns {JSX.Element | null} The rendered section or null if empty
 */
const TimeSection = ({
  timeOfDay,
  activities,
  label,
  bgColor,
  borderColor,
  accentColor,
}: {
  timeOfDay: TimeOfDay;
  activities: TimelineActivity[];
  label: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
}) => {
  const { t } = useTranslation();

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
          </svg>
        );
      case 'afternoon':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        );
      case 'evening':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.1 12.08c-2.33-4.51-.5-8.48.53-10.07C6.27 2.2 1.98 6.59 1.98 12c0 .14.02.28.02.42.62-.27 1.29-.42 2-.42 1.66 0 3.18.83 4.1 2.15A4.01 4.01 0 0111 18c0 1.52-.87 2.83-2.12 3.51.98.32 2.03.49 3.12.49 3.69 0 6.86-2.13 8.41-5.22-3.46-.78-6.87-3.01-9.31-7.7zM7 16l-.18.2C6.4 14.9 5.3 14 4 14c-1.66 0-3 1.34-3 3s1.34 3 3 3h3c1.1 0 2-.9 2-2s-.9-2-2-2z" />
          </svg>
        );
      case 'night':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.01 12c0-3.57 2.2-6.62 5.31-7.87.89-.36.75-1.69-.19-1.9-1.1-.24-2.27-.3-3.48-.14-4.51.6-8.12 4.31-8.59 8.83C4.44 16.93 9.13 22 15.01 22c.73 0 1.43-.08 2.12-.23.95-.21 1.1-1.53.2-1.9-3.22-1.29-5.32-4.49-5.32-7.87z" />
          </svg>
        );
    }
  };

  if (activities.length === 0) return null;

  return (
    <div className={`${bgColor} rounded-2xl overflow-hidden border ${borderColor} shadow-sm`}>
      {/* Section header */}
      <div className={`${accentColor} px-4 py-3 flex items-center gap-2`}>
        <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
          <span className="text-text-primary">{getTimeIcon()}</span>
        </div>
        <div>
          <h4 className="font-bold text-text-primary text-sm">{label}</h4>
          <span className="text-xs text-text-secondary">
            {activities.length} {activities.length === 1 ? t('timeline.activity', 'activity') : t('timeline.activities', 'activities')}
          </span>
        </div>
      </div>

      {/* Activities list */}
      <div className="p-3 space-y-2">
        {activities.map((activity, index) => (
          <div
            key={index}
            className={`relative flex items-start gap-3 p-3 rounded-xl transition-all ${
              activity.isTreatmentRelated
                ? 'bg-nhs-blue/10 border-2 border-nhs-blue/30 shadow-sm'
                : 'bg-white/70 border border-transparent hover:border-nhs-pale-grey'
            }`}
          >
            {/* Treatment indicator badge */}
            {activity.isTreatmentRelated && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-nhs-blue flex items-center justify-center shadow-sm" aria-label={t('timeline.treatmentActivity', 'Treatment activity')}>
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                activity.isTreatmentRelated
                  ? 'bg-nhs-blue text-white'
                  : 'bg-white text-text-secondary border border-nhs-pale-grey'
              }`}
            >
              <ActivityIcon type={activity.icon} className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  activity.isTreatmentRelated
                    ? 'bg-nhs-blue text-white'
                    : 'bg-nhs-blue/10 text-nhs-blue'
                }`}>
                  {activity.time}
                </span>
                {activity.duration && (
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {activity.duration}
                  </span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${
                activity.isTreatmentRelated ? 'text-text-primary font-medium' : 'text-text-secondary'
              }`}>{activity.activity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Treatment timeline component showing a "day in the life" visualization.
 *
 * Features:
 * - Full day schedule organized by time of day
 * - Toggle between dialysis/regular days for applicable treatments
 * - Treatment-related activities highlighted
 * - Activity icons and durations
 * - Responsive grid layout
 * - Legend explaining color coding
 * - Treatment hours count
 *
 * @component
 * @param {TreatmentTimelineProps} props - Component props
 * @returns {JSX.Element} The rendered timeline
 *
 * @example
 * <TreatmentTimeline treatmentType="hemodialysis" compact={false} />
 */
export default function TreatmentTimeline({ treatmentType, compact = false }: TreatmentTimelineProps) {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState<'dialysis' | 'regular'>('dialysis');

  // Generate schedule data based on treatment type
  const schedules = useMemo(() => {
    const getSchedule = (type: TreatmentType, dayType: 'dialysis' | 'regular'): DaySchedule => {
      switch (type) {
        case 'kidney-transplant':
          return {
            morning: [
              { time: '7:00', activity: t('timeline.transplant.wakeUp', 'Wake up and morning routine'), icon: 'wake' },
              { time: '7:30', activity: t('timeline.transplant.medication', 'Take immunosuppressant medications'), icon: 'medication', isTreatmentRelated: true },
              { time: '8:00', activity: t('timeline.transplant.breakfast', 'Breakfast - healthy, balanced meal'), icon: 'meal' },
              { time: '9:00', activity: t('timeline.transplant.work', 'Work, hobbies, or activities'), icon: 'work' },
            ],
            afternoon: [
              { time: '12:30', activity: t('timeline.transplant.lunch', 'Lunch - few dietary restrictions'), icon: 'meal' },
              { time: '14:00', activity: t('timeline.transplant.activities', 'Continue daily activities'), icon: 'social' },
              { time: '16:00', activity: t('timeline.transplant.exercise', 'Light exercise or walk'), icon: 'exercise' },
            ],
            evening: [
              { time: '18:00', activity: t('timeline.transplant.dinner', 'Dinner with family'), icon: 'meal' },
              { time: '19:30', activity: t('timeline.transplant.eveningMeds', 'Evening medications'), icon: 'medication', isTreatmentRelated: true },
              { time: '20:00', activity: t('timeline.transplant.relax', 'Relaxation and leisure time'), icon: 'rest' },
            ],
            night: [
              { time: '22:00', activity: t('timeline.transplant.sleep', 'Normal sleep pattern'), icon: 'sleep' },
            ],
          };

        case 'hemodialysis':
          if (dayType === 'dialysis') {
            return {
              morning: [
                { time: '6:00', activity: t('timeline.hemo.wakeEarly', 'Wake up early'), icon: 'wake' },
                { time: '6:30', activity: t('timeline.hemo.lightBreakfast', 'Light breakfast with fluid limits'), icon: 'meal' },
                { time: '7:00', activity: t('timeline.hemo.travelTo', 'Travel to dialysis centre'), icon: 'travel', duration: t('timeline.duration.30min', '30-60 min'), isTreatmentRelated: true },
              ],
              afternoon: [
                { time: '8:00', activity: t('timeline.hemo.session', 'Dialysis session'), icon: 'treatment', duration: t('timeline.duration.4hrs', '4-5 hours'), isTreatmentRelated: true },
                { time: '13:00', activity: t('timeline.hemo.travelHome', 'Travel home from dialysis'), icon: 'travel', duration: t('timeline.duration.30min', '30-60 min'), isTreatmentRelated: true },
                { time: '14:00', activity: t('timeline.hemo.rest', 'Rest and recovery - may feel tired'), icon: 'rest', isTreatmentRelated: true },
              ],
              evening: [
                { time: '17:00', activity: t('timeline.hemo.lightMeal', 'Light meal with dietary restrictions'), icon: 'meal' },
                { time: '19:00', activity: t('timeline.hemo.quietEvening', 'Quiet evening activities'), icon: 'home' },
              ],
              night: [
                { time: '21:00', activity: t('timeline.hemo.earlyBed', 'Early bedtime after treatment day'), icon: 'sleep' },
              ],
            };
          } else {
            return {
              morning: [
                { time: '7:30', activity: t('timeline.hemo.regularWake', 'Wake up'), icon: 'wake' },
                { time: '8:00', activity: t('timeline.hemo.breakfast', 'Breakfast with dietary guidelines'), icon: 'meal' },
                { time: '9:00', activity: t('timeline.hemo.normalDay', 'Work or regular activities'), icon: 'work' },
              ],
              afternoon: [
                { time: '12:30', activity: t('timeline.hemo.lunch', 'Lunch - watching fluid and potassium'), icon: 'meal' },
                { time: '14:00', activity: t('timeline.hemo.continue', 'Continue daily activities'), icon: 'social' },
              ],
              evening: [
                { time: '18:00', activity: t('timeline.hemo.dinner', 'Dinner with family'), icon: 'meal' },
                { time: '20:00', activity: t('timeline.hemo.leisure', 'Leisure time'), icon: 'rest' },
              ],
              night: [
                { time: '22:30', activity: t('timeline.hemo.sleep', 'Normal bedtime'), icon: 'sleep' },
              ],
            };
          }

        case 'peritoneal-dialysis':
          if (dayType === 'dialysis') {
            // APD - Automated overnight
            return {
              morning: [
                { time: '6:00', activity: t('timeline.pd.disconnect', 'Disconnect from APD machine'), icon: 'treatment', duration: t('timeline.duration.15min', '15 min'), isTreatmentRelated: true },
                { time: '6:30', activity: t('timeline.pd.morning', 'Morning routine and shower'), icon: 'wake' },
                { time: '7:00', activity: t('timeline.pd.breakfast', 'Breakfast - more dietary freedom'), icon: 'meal' },
                { time: '8:00', activity: t('timeline.pd.work', 'Work or activities - free during day'), icon: 'work' },
              ],
              afternoon: [
                { time: '12:30', activity: t('timeline.pd.lunch', 'Lunch - fewer restrictions than HD'), icon: 'meal' },
                { time: '14:00', activity: t('timeline.pd.activities', 'Continue activities, hobbies'), icon: 'social' },
                { time: '16:00', activity: t('timeline.pd.exercise', 'Exercise or outdoor activities'), icon: 'exercise' },
              ],
              evening: [
                { time: '18:00', activity: t('timeline.pd.dinner', 'Dinner with family'), icon: 'meal' },
                { time: '20:00', activity: t('timeline.pd.leisure', 'Evening leisure time'), icon: 'rest' },
                { time: '21:30', activity: t('timeline.pd.setup', 'Set up APD machine'), icon: 'treatment', duration: t('timeline.duration.20min', '20 min'), isTreatmentRelated: true },
              ],
              night: [
                { time: '22:00', activity: t('timeline.pd.overnight', 'Sleep while APD works overnight'), icon: 'sleep', duration: t('timeline.duration.8hrs', '8-10 hours'), isTreatmentRelated: true },
              ],
            };
          } else {
            // CAPD - Manual exchanges
            return {
              morning: [
                { time: '7:00', activity: t('timeline.pd.capdWake', 'Wake up'), icon: 'wake' },
                { time: '7:15', activity: t('timeline.pd.exchange1', 'First exchange of the day'), icon: 'treatment', duration: t('timeline.duration.30min', '30 min'), isTreatmentRelated: true },
                { time: '8:00', activity: t('timeline.pd.capdBreakfast', 'Breakfast'), icon: 'meal' },
                { time: '9:00', activity: t('timeline.pd.capdWork', 'Work or activities'), icon: 'work' },
              ],
              afternoon: [
                { time: '12:00', activity: t('timeline.pd.exchange2', 'Second exchange'), icon: 'treatment', duration: t('timeline.duration.30min', '30 min'), isTreatmentRelated: true },
                { time: '12:45', activity: t('timeline.pd.capdLunch', 'Lunch'), icon: 'meal' },
                { time: '14:00', activity: t('timeline.pd.capdActivities', 'Afternoon activities'), icon: 'social' },
              ],
              evening: [
                { time: '17:00', activity: t('timeline.pd.exchange3', 'Third exchange'), icon: 'treatment', duration: t('timeline.duration.30min', '30 min'), isTreatmentRelated: true },
                { time: '18:00', activity: t('timeline.pd.capdDinner', 'Dinner'), icon: 'meal' },
                { time: '20:00', activity: t('timeline.pd.capdLeisure', 'Evening relaxation'), icon: 'rest' },
              ],
              night: [
                { time: '22:00', activity: t('timeline.pd.exchange4', 'Final exchange before bed'), icon: 'treatment', duration: t('timeline.duration.30min', '30 min'), isTreatmentRelated: true },
                { time: '22:45', activity: t('timeline.pd.capdSleep', 'Sleep'), icon: 'sleep' },
              ],
            };
          }

        case 'conservative-care':
          return {
            morning: [
              { time: '8:00', activity: t('timeline.conservative.wake', 'Wake up when ready'), icon: 'wake' },
              { time: '8:30', activity: t('timeline.conservative.meds', 'Take symptom management medications'), icon: 'medication', isTreatmentRelated: true },
              { time: '9:00', activity: t('timeline.conservative.breakfast', 'Breakfast as tolerated'), icon: 'meal' },
              { time: '10:00', activity: t('timeline.conservative.morning', 'Morning activities as energy allows'), icon: 'home' },
            ],
            afternoon: [
              { time: '12:30', activity: t('timeline.conservative.lunch', 'Lunch - eat what you enjoy'), icon: 'meal' },
              { time: '14:00', activity: t('timeline.conservative.rest', 'Rest or gentle activities'), icon: 'rest' },
              { time: '15:00', activity: t('timeline.conservative.visitors', 'Time with family or visitors'), icon: 'social' },
            ],
            evening: [
              { time: '17:30', activity: t('timeline.conservative.eveningMeds', 'Evening medications'), icon: 'medication', isTreatmentRelated: true },
              { time: '18:00', activity: t('timeline.conservative.dinner', 'Dinner with loved ones'), icon: 'meal' },
              { time: '20:00', activity: t('timeline.conservative.relax', 'Quiet evening at home'), icon: 'home' },
            ],
            night: [
              { time: '22:00', activity: t('timeline.conservative.sleep', 'Rest when tired'), icon: 'sleep' },
            ],
          };

        default:
          return { morning: [], afternoon: [], evening: [], night: [] };
      }
    };

    return {
      dialysis: getSchedule(treatmentType, 'dialysis'),
      regular: getSchedule(treatmentType, 'regular'),
    };
  }, [treatmentType, t]);

  const currentSchedule = schedules[selectedDay];
  const showDayToggle = treatmentType === 'hemodialysis' || treatmentType === 'peritoneal-dialysis';

  // Count treatment-related activities
  const treatmentHours = useMemo(() => {
    const allActivities = [
      ...currentSchedule.morning,
      ...currentSchedule.afternoon,
      ...currentSchedule.evening,
      ...currentSchedule.night,
    ];
    return allActivities.filter((a) => a.isTreatmentRelated).length;
  }, [currentSchedule]);

  const getDayLabel = () => {
    if (treatmentType === 'hemodialysis') {
      return selectedDay === 'dialysis'
        ? t('timeline.dayType.dialysisDay', 'Dialysis Day (Mon/Wed/Fri)')
        : t('timeline.dayType.restDay', 'Rest Day (Tue/Thu/Sat/Sun)');
    }
    if (treatmentType === 'peritoneal-dialysis') {
      return selectedDay === 'dialysis'
        ? t('timeline.dayType.apdNight', 'APD (Automated Overnight)')
        : t('timeline.dayType.capd', 'CAPD (Manual Exchanges)');
    }
    return t('timeline.dayType.typical', 'Typical Day');
  };

  return (
    <div className={`bg-white rounded-2xl border border-nhs-pale-grey overflow-hidden shadow-sm ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-nhs-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            {t('timeline.title', 'A Day in the Life')}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {t('timeline.subtitle', 'See what a typical day looks like with this treatment')}
          </p>
        </div>

        {/* Day type toggle - Enhanced pill style */}
        {showDayToggle && (
          <div className="flex p-1 bg-nhs-pale-grey rounded-xl">
            <button
              onClick={() => setSelectedDay('dialysis')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1 min-h-[44px] ${
                selectedDay === 'dialysis'
                  ? 'bg-nhs-blue text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {treatmentType === 'hemodialysis'
                ? t('timeline.toggle.dialysisDay', 'Dialysis Day')
                : t('timeline.toggle.apd', 'APD')}
            </button>
            <button
              onClick={() => setSelectedDay('regular')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-1 min-h-[44px] ${
                selectedDay === 'regular'
                  ? 'bg-nhs-blue text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {treatmentType === 'hemodialysis'
                ? t('timeline.toggle.restDay', 'Rest Day')
                : t('timeline.toggle.capd', 'CAPD')}
            </button>
          </div>
        )}
      </div>

      {/* Day info badge - Enhanced */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-nhs-blue/5 to-nhs-blue/10 rounded-xl border border-nhs-blue/15">
        <div className="w-12 h-12 bg-nhs-blue/15 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text-primary">{getDayLabel()}</p>
          <p className="text-sm text-text-secondary">
            {t('timeline.treatmentActivities', '{{count}} treatment-related activities', { count: treatmentHours })}
          </p>
        </div>
        {treatmentHours > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-nhs-blue/20 rounded-full">
            <svg className="w-4 h-4 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="text-xs font-medium text-nhs-blue">{t('timeline.treatmentLabel', 'Treatment')}</span>
          </div>
        )}
      </div>

      {/* Timeline grid - Enhanced with connecting visual */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
        <TimeSection
          timeOfDay="morning"
          activities={currentSchedule.morning}
          label={t('timeline.morning', 'Morning')}
          bgColor="bg-amber-50/50"
          borderColor="border-amber-200/60"
          accentColor="bg-gradient-to-r from-amber-100 to-amber-50"
        />
        <TimeSection
          timeOfDay="afternoon"
          activities={currentSchedule.afternoon}
          label={t('timeline.afternoon', 'Afternoon')}
          bgColor="bg-orange-50/50"
          borderColor="border-orange-200/60"
          accentColor="bg-gradient-to-r from-orange-100 to-orange-50"
        />
        <TimeSection
          timeOfDay="evening"
          activities={currentSchedule.evening}
          label={t('timeline.evening', 'Evening')}
          bgColor="bg-purple-50/50"
          borderColor="border-purple-200/60"
          accentColor="bg-gradient-to-r from-purple-100 to-purple-50"
        />
        <TimeSection
          timeOfDay="night"
          activities={currentSchedule.night}
          label={t('timeline.night', 'Night')}
          bgColor="bg-indigo-50/50"
          borderColor="border-indigo-200/60"
          accentColor="bg-gradient-to-r from-indigo-100 to-indigo-50"
        />
      </div>

      {/* Legend - Enhanced */}
      <div className="mt-6 pt-5 border-t border-nhs-pale-grey">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-nhs-blue/10 border-2 border-nhs-blue/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-nhs-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="text-text-secondary">{t('timeline.legend.treatment', 'Treatment-related')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-white border border-nhs-pale-grey" />
              <span className="text-text-secondary">{t('timeline.legend.regular', 'Regular activities')}</span>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            {t('timeline.disclaimer', 'Times are approximate and may vary')}
          </p>
        </div>
      </div>
    </div>
  );
}
