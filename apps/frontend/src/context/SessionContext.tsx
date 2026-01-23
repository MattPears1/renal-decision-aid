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
  UserRole,
  CarerRelationship,
} from '@renal-decision-aid/shared-types';

/**
 * Session context value type.
 * @interface SessionContextType
 * @property {Session | null} session - Current session data
 * @property {boolean} isLoading - Whether session is loading
 * @property {string | null} error - Current error message
 * @property {(language: SupportedLanguage) => Promise<void>} createSession - Create new session
 * @property {() => Promise<void>} endSession - End current session
 * @property {(language: SupportedLanguage) => Promise<void>} setLanguage - Change language
 * @property {(stage: JourneyStage) => void} setJourneyStage - Update journey stage
 * @property {(answer: QuestionnaireAnswer) => void} addQuestionnaireAnswer - Add questionnaire answer
 * @property {(rating: ValueRating) => void} addValueRating - Add value rating
 * @property {(treatment: TreatmentType) => void} markTreatmentViewed - Mark treatment as viewed
 * @property {(message: ChatMessage) => void} addChatMessage - Add chat message
 * @property {(goals: string[]) => void} updateLifeGoals - Update life goals
 * @property {(role: UserRole) => void} setUserRole - Set user role (patient/carer)
 * @property {(relationship: CarerRelationship) => void} setCarerRelationship - Set carer relationship
 * @property {(label: string) => void} setCustomCarerLabel - Set custom label for the person being supported
 * @property {(region: string) => void} setRegion - Set user region for support networks
 */
interface SessionContextType {
  session: (Session & { lifeGoals?: string[] }) | null;
  isLoading: boolean;
  error: string | null;

  // Session management
  createSession: (
    language: SupportedLanguage,
    userRole?: UserRole,
    carerRelationship?: CarerRelationship,
    customCarerLabel?: string
  ) => Promise<void>;
  endSession: () => Promise<void>;

  // Data updates
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  setJourneyStage: (stage: JourneyStage) => void;
  setUserRole: (role: UserRole) => void;
  setCarerRelationship: (relationship: CarerRelationship) => void;
  setCustomCarerLabel: (label: string) => void;
  setRegion: (region: string) => void;
  addQuestionnaireAnswer: (answer: QuestionnaireAnswer) => void;
  addValueRating: (rating: ValueRating) => void;
  markTreatmentViewed: (treatment: TreatmentType) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLifeGoals: (goals: string[]) => void;
}

/** Session context instance. */
const SessionContext = createContext<SessionContextType | undefined>(undefined);

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
  const [session, setSession] = useState<(Session & { lifeGoals?: string[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (
    language: SupportedLanguage,
    userRole: UserRole = 'patient',
    carerRelationship?: CarerRelationship,
    customCarerLabel?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const now = Date.now();
      const newSession: Session & { lifeGoals?: string[] } = {
        id: crypto.randomUUID(),
        language,
        userRole,
        carerRelationship,
        customCarerLabel,
        questionnaireAnswers: [],
        valueRatings: [],
        viewedTreatments: [],
        chatHistory: [],
        createdAt: now,
        expiresAt: 0, // No expiration - session persists until browser is closed
        lastActivityAt: now,
      };

      setSession(newSession);
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
      setSession(null);
    } catch (err) {
      console.error('Session end error:', err);
    }
  }, [session]);

  const updateSession = useCallback((updates: Partial<Session>) => {
    const now = Date.now();
    setSession((prev) =>
      prev
        ? {
            ...prev,
            ...updates,
            lastActivityAt: now,
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

  const setUserRole = useCallback(
    (userRole: UserRole) => {
      updateSession({ userRole });
    },
    [updateSession]
  );

  const setCarerRelationship = useCallback(
    (carerRelationship: CarerRelationship) => {
      updateSession({ carerRelationship });
    },
    [updateSession]
  );

  const setCustomCarerLabel = useCallback(
    (customCarerLabel: string) => {
      updateSession({ customCarerLabel });
    },
    [updateSession]
  );

  const setRegion = useCallback(
    (region: string) => {
      updateSession({ region });
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

  const updateLifeGoals = useCallback((goals: string[]) => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        lifeGoals: goals,
        lastActivityAt: Date.now(),
      };
    });
  }, []);

  const value: SessionContextType = {
    session,
    isLoading,
    error,
    createSession,
    endSession,
    setLanguage,
    setJourneyStage,
    setUserRole,
    setCarerRelationship,
    setCustomCarerLabel,
    setRegion,
    addQuestionnaireAnswer,
    addValueRating,
    markTreatmentViewed,
    addChatMessage,
    updateLifeGoals,
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
 * @deprecated Session timer has been removed - sessions no longer expire.
 * This hook is kept for backwards compatibility but returns static values.
 * @hook
 * @returns {Object} Static timer state (no actual timing)
 */
export function useSessionTimer() {
  return {
    minutes: 0,
    seconds: 0,
    isWarning: false,
    formatted: '--:--',
    extendSession: async () => {},
  };
}
