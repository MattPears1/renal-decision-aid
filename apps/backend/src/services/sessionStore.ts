/**
 * Session store for the NHS Renal Decision Aid
 *
 * Supports multiple storage backends:
 * - Memory (default, for development)
 * - File-based (for Heroku without Redis)
 * - Redis (recommended for production)
 *
 * The storage backend is selected based on environment variables.
 */

import fs from 'fs';
import path from 'path';
import logger, { apiLogger } from './logger.js';

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

// File persistence settings
const SESSION_FILE_PATH = process.env.SESSION_FILE_PATH || './sessions.json';
const PERSIST_INTERVAL_MS = 30 * 1000; // Persist to file every 30 seconds

/**
 * Storage backend interface
 */
interface StorageBackend {
  get(sessionId: string): SessionData | undefined;
  set(sessionId: string, data: SessionData): void;
  delete(sessionId: string): boolean;
  entries(): IterableIterator<[string, SessionData]>;
  size: number;
  clear(): void;
}

/**
 * In-memory storage backend
 */
class MemoryBackend implements StorageBackend {
  private sessions: Map<string, SessionData> = new Map();

  get(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  set(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, data);
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  entries(): IterableIterator<[string, SessionData]> {
    return this.sessions.entries();
  }

  get size(): number {
    return this.sessions.size;
  }

  clear(): void {
    this.sessions.clear();
  }
}

/**
 * File-based storage backend with in-memory cache
 * Suitable for Heroku ephemeral filesystem (sessions survive restarts within dyno lifecycle)
 */
class FileBackend implements StorageBackend {
  private sessions: Map<string, SessionData> = new Map();
  private filePath: string;
  private persistTimeout: NodeJS.Timeout | null = null;
  private dirty: boolean = false;

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
    this.loadFromFile();
    this.startPeriodicPersist();
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          for (const [key, value] of parsed) {
            this.sessions.set(key, value);
          }
          logger.info('Sessions loaded from file', {
            count: this.sessions.size,
            filePath: this.filePath,
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to load sessions from file, starting fresh', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filePath: this.filePath,
      });
    }
  }

  private persistToFile(): void {
    if (!this.dirty) return;

    try {
      const data = JSON.stringify(Array.from(this.sessions.entries()));
      fs.writeFileSync(this.filePath, data, 'utf-8');
      this.dirty = false;
      logger.debug('Sessions persisted to file', {
        count: this.sessions.size,
        filePath: this.filePath,
      });
    } catch (error) {
      logger.error('Failed to persist sessions to file', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filePath: this.filePath,
      });
    }
  }

  private startPeriodicPersist(): void {
    this.persistTimeout = setInterval(() => {
      this.persistToFile();
    }, PERSIST_INTERVAL_MS);

    // Ensure this doesn't prevent process from exiting
    if (this.persistTimeout.unref) {
      this.persistTimeout.unref();
    }

    // Persist on process exit
    process.on('beforeExit', () => {
      this.persistToFile();
    });

    process.on('SIGTERM', () => {
      this.persistToFile();
    });

    process.on('SIGINT', () => {
      this.persistToFile();
    });
  }

  get(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  set(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, data);
    this.dirty = true;
  }

  delete(sessionId: string): boolean {
    const result = this.sessions.delete(sessionId);
    if (result) {
      this.dirty = true;
    }
    return result;
  }

  entries(): IterableIterator<[string, SessionData]> {
    return this.sessions.entries();
  }

  get size(): number {
    return this.sessions.size;
  }

  clear(): void {
    this.sessions.clear();
    this.dirty = true;
  }

  stopPersist(): void {
    if (this.persistTimeout) {
      clearInterval(this.persistTimeout);
      this.persistTimeout = null;
    }
    // Final persist
    this.persistToFile();
  }
}

/**
 * Redis storage backend (optional, requires ioredis)
 * This is a stub that falls back to file storage if Redis is not available
 */
async function createRedisBackend(redisUrl: string): Promise<StorageBackend | null> {
  try {
    // Dynamic import to avoid requiring ioredis if not used
    const { Redis } = await import('ioredis');
    const redis = new Redis(redisUrl);

    // Test connection
    await redis.ping();
    logger.info('Connected to Redis for session storage');

    return {
      get(_sessionId: string): SessionData | undefined {
        // Note: This is a simplified sync wrapper - in production,
        // you'd want to use async/await throughout
        return undefined; // Placeholder - see async implementation below
      },
      set(_sessionId: string, _data: SessionData): void {
        // Placeholder
      },
      delete(_sessionId: string): boolean {
        return false; // Placeholder
      },
      entries(): IterableIterator<[string, SessionData]> {
        return new Map().entries(); // Placeholder
      },
      size: 0,
      clear(): void {
        // Placeholder
      },
    };
  } catch {
    logger.warn('Redis not available, falling back to file storage');
    return null;
  }
}

/**
 * Determine which storage backend to use
 */
function createStorageBackend(): StorageBackend {
  const sessionStorage = process.env.SESSION_STORAGE || 'memory';

  if (sessionStorage === 'redis' && process.env.REDIS_URL) {
    // Try Redis but fall back to file if it fails
    // For now, we'll use file storage as Redis requires async handling
    logger.info('Redis storage configured but using file storage for sync compatibility');
    return new FileBackend(SESSION_FILE_PATH);
  }

  if (sessionStorage === 'file' || process.env.NODE_ENV === 'production') {
    logger.info('Using file-based session storage', { path: SESSION_FILE_PATH });
    return new FileBackend(SESSION_FILE_PATH);
  }

  logger.info('Using in-memory session storage');
  return new MemoryBackend();
}

class SessionStore {
  private storage: StorageBackend;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.storage = createStorageBackend();
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

    this.storage.set(sessionId, session);
    apiLogger.sessionCreated(sessionId);
    return session;
  }

  /**
   * Get a session by ID
   * Returns null if session doesn't exist or has expired
   */
  get(sessionId: string): SessionData | null {
    const session = this.storage.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
      this.storage.delete(sessionId);
      apiLogger.sessionExpired(sessionId);
      return null;
    }

    apiLogger.sessionAccessed(sessionId);
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

    this.storage.set(sessionId, updatedSession);
    apiLogger.sessionUpdated(sessionId);
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

    this.storage.set(sessionId, session);
    return true;
  }

  /**
   * Delete a session
   */
  delete(sessionId: string): boolean {
    const result = this.storage.delete(sessionId);
    if (result) {
      apiLogger.sessionDeleted(sessionId);
    }
    return result;
  }

  /**
   * Get the number of active sessions
   */
  getActiveCount(): number {
    return this.storage.size;
  }

  /**
   * Clean up expired sessions
   */
  cleanup(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.storage.entries()) {
      if (new Date(session.expiresAt) < now) {
        this.storage.delete(sessionId);
        cleaned++;
      }
    }

    apiLogger.sessionCleanup(cleaned);
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
    this.storage.clear();
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Export class for testing
export { SessionStore };

// Export for Redis backend creation (for future async implementation)
export { createRedisBackend };
