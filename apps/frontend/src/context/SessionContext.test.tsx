import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionProvider, useSession, useSessionTimer } from './SessionContext';

// Test component that uses the useSession hook
function TestConsumer() {
  const {
    session,
    isLoading,
    error,
    createSession,
    endSession,
    setLanguage,
    setJourneyStage,
    addQuestionnaireAnswer,
    addValueRating,
    markTreatmentViewed,
    addChatMessage,
  } = useSession();

  return (
    <div>
      <span data-testid="session-id">{session?.id || 'no-session'}</span>
      <span data-testid="language">{session?.language || 'no-language'}</span>
      <span data-testid="journey-stage">{session?.journeyStage || 'no-stage'}</span>
      <span data-testid="is-loading">{isLoading ? 'loading' : 'not-loading'}</span>
      <span data-testid="error">{error || 'no-error'}</span>
      <span data-testid="answers-count">{session?.questionnaireAnswers.length || 0}</span>
      <span data-testid="ratings-count">{session?.valueRatings.length || 0}</span>
      <span data-testid="viewed-count">{session?.viewedTreatments.length || 0}</span>
      <span data-testid="chat-count">{session?.chatHistory.length || 0}</span>
      <button onClick={() => createSession('en')}>Create Session</button>
      <button onClick={() => endSession()}>End Session</button>
      <button onClick={() => setLanguage('hi')}>Set Hindi</button>
      <button onClick={() => setJourneyStage('newly-diagnosed')}>Set Stage</button>
      <button onClick={() => addQuestionnaireAnswer({ questionId: 'q1', value: 'yes', timestamp: Date.now() })}>
        Add Answer
      </button>
      <button onClick={() => addValueRating({ statementId: 's1', rating: 5 })}>Add Rating</button>
      <button onClick={() => markTreatmentViewed('kidney-transplant')}>Mark Viewed</button>
      <button onClick={() => addChatMessage({ id: 'm1', role: 'user', content: 'Hello', timestamp: Date.now() })}>
        Add Chat
      </button>
    </div>
  );
}

// Test component for useSessionTimer hook
function TimerTestConsumer() {
  const { minutes, seconds, isWarning, formatted, extendSession } = useSessionTimer();

  return (
    <div>
      <span data-testid="timer-minutes">{minutes}</span>
      <span data-testid="timer-seconds">{seconds}</span>
      <span data-testid="timer-is-warning">{isWarning ? 'warning' : 'ok'}</span>
      <span data-testid="timer-formatted">{formatted}</span>
      <button onClick={() => extendSession()}>Extend Timer</button>
    </div>
  );
}

describe('SessionContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('SessionProvider', () => {
    it('provides initial null session state', () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      expect(screen.getByTestId('session-id')).toHaveTextContent('no-session');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    it('creates a new session with specified language', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      expect(screen.getByTestId('session-id')).toHaveTextContent('test-uuid-123');
      expect(screen.getByTestId('language')).toHaveTextContent('en');
    });

    it('ends the session properly', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      // Create session first
      await act(async () => {
        screen.getByText('Create Session').click();
      });

      expect(screen.getByTestId('session-id')).toHaveTextContent('test-uuid-123');

      // End session
      await act(async () => {
        screen.getByText('End Session').click();
      });

      expect(screen.getByTestId('session-id')).toHaveTextContent('no-session');
    });

    it('updates language', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      await act(async () => {
        screen.getByText('Set Hindi').click();
      });

      expect(screen.getByTestId('language')).toHaveTextContent('hi');
    });

    it('sets journey stage', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      await act(async () => {
        screen.getByText('Set Stage').click();
      });

      expect(screen.getByTestId('journey-stage')).toHaveTextContent('newly-diagnosed');
    });

    it('adds questionnaire answers', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      expect(screen.getByTestId('answers-count')).toHaveTextContent('0');

      await act(async () => {
        screen.getByText('Add Answer').click();
      });

      expect(screen.getByTestId('answers-count')).toHaveTextContent('1');
    });

    it('updates existing questionnaire answer for same questionId', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      // Add answer twice with same questionId
      await act(async () => {
        screen.getByText('Add Answer').click();
      });

      await act(async () => {
        screen.getByText('Add Answer').click();
      });

      // Should still be 1 since it updates existing
      expect(screen.getByTestId('answers-count')).toHaveTextContent('1');
    });

    it('adds value ratings', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      expect(screen.getByTestId('ratings-count')).toHaveTextContent('0');

      await act(async () => {
        screen.getByText('Add Rating').click();
      });

      expect(screen.getByTestId('ratings-count')).toHaveTextContent('1');
    });

    it('marks treatments as viewed', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      expect(screen.getByTestId('viewed-count')).toHaveTextContent('0');

      await act(async () => {
        screen.getByText('Mark Viewed').click();
      });

      expect(screen.getByTestId('viewed-count')).toHaveTextContent('1');
    });

    it('does not duplicate viewed treatments', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      await act(async () => {
        screen.getByText('Mark Viewed').click();
      });

      await act(async () => {
        screen.getByText('Mark Viewed').click();
      });

      // Should still be 1
      expect(screen.getByTestId('viewed-count')).toHaveTextContent('1');
    });

    it('adds chat messages', async () => {
      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create Session').click();
      });

      expect(screen.getByTestId('chat-count')).toHaveTextContent('0');

      await act(async () => {
        screen.getByText('Add Chat').click();
      });

      expect(screen.getByTestId('chat-count')).toHaveTextContent('1');
    });

  });

  describe('useSessionTimer hook (deprecated)', () => {
    it('returns static zero values (timer functionality removed)', () => {
      render(
        <SessionProvider>
          <TimerTestConsumer />
        </SessionProvider>
      );

      // Timer is now deprecated - returns static values
      expect(screen.getByTestId('timer-minutes')).toHaveTextContent('0');
      expect(screen.getByTestId('timer-seconds')).toHaveTextContent('0');
      expect(screen.getByTestId('timer-is-warning')).toHaveTextContent('ok');
      expect(screen.getByTestId('timer-formatted')).toHaveTextContent('--:--');
    });

    it('returns static values even after creating session (no timer)', async () => {
      // Create a combined test component
      function CombinedConsumer() {
        const { createSession } = useSession();
        const { minutes, seconds, formatted } = useSessionTimer();

        return (
          <div>
            <span data-testid="timer-minutes">{minutes}</span>
            <span data-testid="timer-seconds">{seconds}</span>
            <span data-testid="timer-formatted">{formatted}</span>
            <button onClick={() => createSession('en')}>Create</button>
          </div>
        );
      }

      render(
        <SessionProvider>
          <CombinedConsumer />
        </SessionProvider>
      );

      await act(async () => {
        screen.getByText('Create').click();
      });

      // Timer is deprecated - returns static values regardless of session
      expect(screen.getByTestId('timer-minutes')).toHaveTextContent('0');
      expect(screen.getByTestId('timer-seconds')).toHaveTextContent('0');
      expect(screen.getByTestId('timer-formatted')).toHaveTextContent('--:--');
    });
  });
});
