import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSessionTimer } from '@/context/SessionContext';
import { Button } from '@/components/ui';

interface SessionTimerProps {
  showExtendButton?: boolean;
  className?: string;
}

export default function SessionTimer({ showExtendButton = true, className = '' }: SessionTimerProps) {
  const { t } = useTranslation();
  const { minutes, seconds, isWarning, formatted, extendSession } = useSessionTimer();
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

      {/* Warning Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-warning-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-nhs-warm-yellow/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-nhs-orange"
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
              <div className="flex-1">
                <h2
                  id="session-warning-title"
                  className="text-lg font-semibold text-text-primary mb-2"
                >
                  {t('session.sessionExpiring', 'Your session will expire soon')}
                </h2>
                <p className="text-text-secondary mb-4">
                  {t(
                    'session.expiringMessage',
                    'Your session will expire in {{minutes}} minutes. Would you like to continue?',
                    { minutes }
                  )}
                </p>
                <div className="flex gap-3">
                  {showExtendButton && (
                    <Button variant="primary" onClick={handleExtend}>
                      {t('session.extendSession', 'Continue Session')}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowModal(false)}>
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
