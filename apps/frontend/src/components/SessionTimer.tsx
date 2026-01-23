/**
 * @fileoverview Session timer component for the NHS Renal Decision Aid.
 * Displays remaining session time and warning modal when expiring.
 * @module components/SessionTimer
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSessionTimer } from '@/context/SessionContext';
import { Button } from '@/components/ui';

/**
 * Props for the SessionTimer component.
 * @interface SessionTimerProps
 * @property {boolean} [showExtendButton=true] - Whether to show the extend session button
 * @property {string} [className=''] - Additional CSS classes
 */
interface SessionTimerProps {
  showExtendButton?: boolean;
  className?: string;
}

/**
 * Session timer component displaying countdown and expiration warning.
 *
 * Features:
 * - Displays formatted time remaining
 * - Visual warning state when time is low
 * - Modal popup at 2 minutes remaining
 * - Session extension capability
 * - ARIA live region for accessibility
 * - Mobile-optimized modal layout
 *
 * @component
 * @param {SessionTimerProps} props - Component props
 * @returns {JSX.Element} The rendered timer display
 *
 * @example
 * <SessionTimer showExtendButton={true} />
 */
export default function SessionTimer({ showExtendButton = true, className = '' }: SessionTimerProps) {
  const { t } = useTranslation();
  const { minutes, seconds: _seconds, isWarning, formatted, extendSession } = useSessionTimer();
  const [showModal, setShowModal] = useState(false);

  // Show warning modal when time is running low
  useEffect(() => {
    if (isWarning && minutes <= 2 && !showModal) {
      setShowModal(true);
    }
  }, [isWarning, minutes, showModal]);

  const handleExtend = async () => {
    await extendSession();
    setShowModal(false);
  };

  return (
    <>
      {/* Timer Display */}
      <div
        className={`flex items-center gap-2 text-sm ${
          isWarning ? 'text-nhs-red font-semibold' : 'text-text-secondary'
        } ${className}`}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        <svg
          className={`w-4 h-4 ${isWarning ? 'animate-pulse' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          {t('session.timeRemaining', { minutes: formatted })}
        </span>
      </div>

      {/* Warning Modal - Optimized for mobile with bottom sheet style */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-warning-title"
        >
          <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-md sm:mx-4 p-4 sm:p-6">
            {/* Mobile drag indicator */}
            <div className="sm:hidden flex justify-center pb-3">
              <div className="w-10 h-1 bg-nhs-mid-grey/30 rounded-full"></div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-nhs-warm-yellow/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-nhs-orange"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1 w-full">
                <h2
                  id="session-warning-title"
                  className="text-base sm:text-lg font-semibold text-text-primary mb-2"
                >
                  {t('session.sessionExpiring', 'Your session will expire soon')}
                </h2>
                <p className="text-sm sm:text-base text-text-secondary mb-4">
                  {t(
                    'session.expiringMessage',
                    'Your session will expire in {{minutes}} minutes. Would you like to continue?',
                    { minutes }
                  )}
                </p>
                {/* Full-width buttons on mobile, inline on larger screens */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {showExtendButton && (
                    <Button variant="primary" onClick={handleExtend} className="w-full sm:w-auto">
                      {t('session.extendSession', 'Continue Session')}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto">
                    {t('common.close', 'Close')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
