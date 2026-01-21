/**
 * @fileoverview Session context provider for the NHS Renal Decision Aid.
 * Manages user session state including progress, preferences, and timing.
 * @module context/SessionContext
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import i18next from 'i18next';
import { changeLanguageAndWait } from '@/config/i18n';
import type {
  Session,
  SupportedLanguage,
  JourneyStage,
  QuestionnaireAnswer,
  ValueRating,
  TreatmentType,
  ChatMessage,
} from '@renal-decision-aid/shared-types';

/**
 * Session context value type.
 * @interface SessionContextType
 * @property {Session | null} session - Current session data
 * @property {boolean} isLoading - Whether session is loading
 * @property {string | null} error - Current error message
 * @property {number | null} timeRemaining - Time remaining in ms
 * @property {(language: SupportedLanguage) => Promise<void>} createSession - Create new session
 * @property {() => Promise<void>} endSession - End current session
 * @property {() => Promise<void>} extendSession - Extend session timeout
 * @property {(language: SupportedLanguage) => Promise<void>} setLanguage - Change language
 * @property {(stage: JourneyStage) => void} setJourneyStage - Update journey stage
 * @property {(answer: QuestionnaireAnswer) => void} addQuestionnaireAnswer - Add questionnaire answer
 * @property {(rating: ValueRating) => void} addValueRating - Add value rating
 * @property {(treatment: TreatmentType) => void} markTreatmentViewed - Mark treatment as viewed
 * @property {(message: ChatMessage) => void} addChatMessage - Add chat message
 */
interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number | null;

  // Session management
  createSession: (language: SupportedLanguage) => Promise<void>;
  endSession: () => Promise<void>;
  extendSession: () => Promise<void>;

  // Data updates
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  setJourneyStage: (stage: JourneyStage) => void;
  addQuestionnaireAnswer: (answer: QuestionnaireAnswer) => void;
  addValueRating: (rating: ValueRating) => void;
  markTreatmentViewed: (treatment: TreatmentType) => void;
  addChatMessage: (message: ChatMessage) => void;
}

/** Session context instance. */
const SessionContext = createContext<SessionContextType | undefined>(undefined);

/** Session duration in milliseconds (15 minutes). */
const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** Warning threshold in milliseconds (5 minutes). */
const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Props for the SessionProvider component.
 * @interface SessionProviderProps
 * @property {ReactNode} children - Child components to wrap
 */
interface SessionProviderProps {
  children: ReactNode;
}

/**
 * Session context provider component.
 *
 * Features:
 * - Session creation and management
 * - Automatic session timeout with countdown
 * - Language management with i18n integration
 * - Journey progress tracking
 * - Questionnaire and value rating storage
 * - Treatment view tracking
 * - Chat history management
 *
 * @component
 * @param {SessionProviderProps} props - Component props
 * @returns {JSX.Element} The provider wrapper
 *
 * @example
 * <SessionProvider>
 *   <App />
 * </SessionProvider>
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Timer for session countdown
  useEffect(() => {
    if (!session) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const remaining = session.expiresAt - Date.now();
      setTimeRemaining(Math.max(0, remaining));

      if (remaining <= 0) {
        // Session expired
        setSession(null);
        setError(i18next.t('session.sessionExpired'));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [session?.expiresAt]);

  const createSession = useCallback(async (language: SupportedLanguage) => {
    setIsLoading(true);
    setError(null);

    try {
      const now = Date.now();
      const newSession: Session = {
        id: crypto.randomUUID(),
        language,
        questionnaireAnswers: [],
        valueRatings: [],
        viewedTreatments: [],
        chatHistory: [],
        createdAt: now,
        expiresAt: now + SESSION_DURATION_MS,
        lastActivityAt: now,
      };

      setSession(newSession);

      // In production, would also create server-side session
      // const response = await fetch('/api/session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ language }),
      // });
    } catch (err) {
      setError(i18next.t('session.createError'));
      console.error('Session creation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const endSession = useCallback(async () => {
    if (!session) return;

    try {
      // In production, would also end server-side session
      // await fetch(`/api/session/${session.id}`, { method: 'DELETE' });
      setSession(null);
      setTimeRemaining(null);
    } catch (err) {
      console.error('Session end error:', err);
    }
  }, [session]);

  const extendSession = useCallback(async () => {
    if (!session) return;

    const now = Date.now();
    setSession((prev) =>
      prev
        ? {
            ...prev,
            expiresAt: now + SESSION_DURATION_MS,
            lastActivityAt: now,
          }
        : null
    );
  }, [session]);

  const updateSession = useCallback((updates: Partial<Session>) => {
    const now = Date.now();
    setSession((prev) =>
      prev
        ? {
            ...prev,
            ...updates,
            lastActivityAt: now,
            expiresAt: now + SESSION_DURATION_MS, // Extend on activity
          }
        : null
    );
  }, []);

  const setLanguage = useCallback(
    async (language: SupportedLanguage) => {
      // Change i18n language and wait for translations to load
      // This uses the robust changeLanguageAndWait with timeout and retry
      await changeLanguageAndWait(language);
      // Then update session state
      updateSession({ language });
    },
    [updateSession]
  );

  const setJourneyStage = useCallback(
    (journeyStage: JourneyStage) => {
      updateSession({ journeyStage });
    },
    [updateSession]
  );

  const addQuestionnaireAnswer = useCallback(
    (answer: QuestionnaireAnswer) => {
      setSession((prev) => {
        if (!prev) return null;
        const existingIndex = prev.questionnaireAnswers.findIndex(
          (a) => a.questionId === answer.questionId
        );
        const answers =
          existingIndex >= 0
            ? prev.questionnaireAnswers.map((a, i) =>
                i === existingIndex ? answer : a
              )
            : [...prev.questionnaireAnswers, answer];
        return {
          ...prev,
          questionnaireAnswers: answers,
          lastActivityAt: Date.now(),
        };
      });
    },
    []
  );

  const addValueRating = useCallback((rating: ValueRating) => {
    setSession((prev) => {
      if (!prev) return null;
      const existingIndex = prev.valueRatings.findIndex(
        (r) => r.statementId === rating.statementId
      );
      const ratings =
        existingIndex >= 0
          ? prev.valueRatings.map((r, i) => (i === existingIndex ? rating : r))
          : [...prev.valueRatings, rating];
      return {
        ...prev,
        valueRatings: ratings,
        lastActivityAt: Date.now(),
      };
    });
  }, []);

  const markTreatmentViewed = useCallback((treatment: TreatmentType) => {
    setSession((prev) => {
      if (!prev) return null;
      if (prev.viewedTreatments.includes(treatment)) return prev;
      return {
        ...prev,
        viewedTreatments: [...prev.viewedTreatments, treatment],
        lastActivityAt: Date.now(),
      };
    });
  }, []);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chatHistory: [...prev.chatHistory, message],
        lastActivityAt: Date.now(),
      };
    });
  }, []);

  const value: SessionContextType = {
    session,
    isLoading,
    error,
    timeRemaining,
    createSession,
    endSession,
    extendSession,
    setLanguage,
    setJourneyStage,
    addQuestionnaireAnswer,
    addValueRating,
    markTreatmentViewed,
    addChatMessage,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Hook to access session context.
 * Must be used within a SessionProvider.
 * @hook
 * @returns {SessionContextType} Session context value
 * @throws {Error} If used outside SessionProvider
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

/**
 * Helper hook for session timer display.
 * Provides formatted time remaining and warning state.
 * @hook
 * @returns {Object} Timer state and controls
 * @returns {number} minutes - Minutes remaining
 * @returns {number} seconds - Seconds remaining
 * @returns {boolean} isWarning - Whether in warning threshold
 * @returns {string} formatted - Formatted time string (MM:SS)
 * @returns {() => Promise<void>} extendSession - Extend session function
 */
export function useSessionTimer() {
  const { timeRemaining, extendSession } = useSession();

  const minutes = timeRemaining ? Math.floor(timeRemaining / 60000) : 0;
  const seconds = timeRemaining ? Math.floor((timeRemaining % 60000) / 1000) : 0;
  const isWarning = timeRemaining !== null && timeRemaining <= WARNING_THRESHOLD_MS;

  return {
    minutes,
    seconds,
    isWarning,
    formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    extendSession,
  };
}
