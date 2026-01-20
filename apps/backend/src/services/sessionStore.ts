/**
 * In-memory session store for the NHS Renal Decision Aid
 *
 * This implementation uses in-memory storage for demonstration purposes.
 * The interface is designed to be easily swapped for Redis or another
 * persistent store in production.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserPreferences {
  textSize?: 'small' | 'medium' | 'large';
  highContrast?: boolean;
  language?: string;
}

export interface QuestionnaireAnswer {
  questionId: string;
  answer: string | number | boolean | string[];
  answeredAt: string;
}

export interface UserValues {
  priorityFactors?: string[];
  lifestylePreferences?: string[];
  concerns?: string[];
  supportNetwork?: string;
  workSituation?: string;
  travelPreferences?: string;
  notes?: string;
}

export interface SessionData {
  id: string;
  createdAt: string;
  expiresAt: string;
  lastAccessedAt: string;
  preferences: UserPreferences;
  questionnaireAnswers: QuestionnaireAnswer[];
  values: UserValues;
  chatHistory: ChatMessage[];
  currentStep: string;
}

// Session expiry time in milliseconds (15 minutes)
const SESSION_EXPIRY_MS = 15 * 60 * 1000;

// Cleanup interval (run every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

class SessionStore {
  private sessions: Map<string, SessionData>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = null;
    this.startCleanupTask();
  }

  /**
   * Create a new session
   */
  create(sessionId: string): SessionData {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MS);

    const session: SessionData = {
      id: sessionId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastAccessedAt: now.toISOString(),
      preferences: {},
      questionnaireAnswers: [],
      values: {},
      chatHistory: [],
      currentStep: 'welcome',
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get a session by ID
   * Returns null if session doesn't exist or has expired
   */
  get(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Update session data
   */
  update(sessionId: string, updates: Partial<SessionData>): SessionData | null {
    const session = this.get(sessionId);

    if (!session) {
      return null;
    }

    // Deep merge for nested objects
    const updatedSession: SessionData = {
      ...session,
      ...updates,
      preferences: {
        ...session.preferences,
        ...(updates.preferences || {}),
      },
      values: {
        ...session.values,
        ...(updates.values || {}),
      },
      // For arrays, replace entirely if provided
      questionnaireAnswers: updates.questionnaireAnswers ?? session.questionnaireAnswers,
      chatHistory: updates.chatHistory ?? session.chatHistory,
      lastAccessedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Refresh session expiry time
   */
  touch(sessionId: string): boolean {
    const session = this.get(sessionId);

    if (!session) {
      return false;
    }

    const now = new Date();
    session.lastAccessedAt = now.toISOString();
    session.expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MS).toISOString();

    this.sessions.set(sessionId, session);
    return true;
  }

  /**
   * Delete a session
   */
  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get the number of active sessions
   */
  getActiveCount(): number {
    return this.sessions.size;
  }

  /**
   * Clean up expired sessions
   */
  cleanup(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt) < now) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Session cleanup: removed ${cleaned} expired session(s)`);
    }

    return cleaned;
  }

  /**
   * Start the automatic cleanup task
   */
  private startCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL_MS);

    // Ensure cleanup doesn't prevent process from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop the cleanup task (useful for testing)
   */
  stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clear all sessions (useful for testing)
   */
  clear(): void {
    this.sessions.clear();
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Export class for testing
export { SessionStore };
