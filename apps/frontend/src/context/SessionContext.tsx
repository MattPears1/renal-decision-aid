import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type {
  Session,
  SupportedLanguage,
  JourneyStage,
  QuestionnaireAnswer,
  ValueRating,
  TreatmentType,
  ChatMessage,
} from '@renal-decision-aid/shared-types';

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
  setLanguage: (language: SupportedLanguage) => void;
  setJourneyStage: (stage: JourneyStage) => void;
  addQuestionnaireAnswer: (answer: QuestionnaireAnswer) => void;
  addValueRating: (rating: ValueRating) => void;
  markTreatmentViewed: (treatment: TreatmentType) => void;
  addChatMessage: (message: ChatMessage) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

interface SessionProviderProps {
  children: ReactNode;
}

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
        setError('Your session has expired. Please start again.');
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
      setError('Failed to create session. Please try again.');
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
    (language: SupportedLanguage) => {
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

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Helper hook for session timer display
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
