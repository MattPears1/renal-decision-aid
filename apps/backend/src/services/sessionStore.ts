/**
 * @fileoverview Session storage service for the NHS Renal Decision Aid.
 * Provides persistent session management with multiple storage backend support
 * including memory, file-based, SQLite, and Redis options.
 *
 * @module services/sessionStore
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires fs
 * @requires path
 * @requires ./logger
 * @requires ../db/database
 * @requires better-sqlite3
 *
 * @see {@link module:routes/session} for session API endpoints
 *
 * @description
 * Supports multiple storage backends:
 * - Memory (default for development)
 * - File-based (for Heroku without Redis)
 * - SQLite (recommended for production, persistent)
 * - Redis (optional, for distributed systems)
 *
 * Storage backend is selected based on SESSION_STORAGE environment variable.
 */

import fs from 'fs';
import path from 'path';
import logger, { apiLogger } from './logger.js';
import { getDatabase, closeDatabase } from '../db/database.js';
import type Database from 'better-sqlite3';

/**
 * Represents a single message in the chat history.
 * @interface ChatMessage
 * @property {string} id - Unique message identifier
 * @property {'user' | 'assistant'} role - Message sender role
 * @property {string} content - Message text content
 * @property {string} timestamp - ISO 8601 timestamp of when message was sent
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * User accessibility and display preferences.
 * @interface UserPreferences
 * @property {'small' | 'medium' | 'large'} [textSize] - Display text size preference
 * @property {boolean} [highContrast] - High contrast mode enabled
 * @property {string} [language] - Preferred language code (e.g., 'en', 'hi')
 */
export interface UserPreferences {
  textSize?: 'small' | 'medium' | 'large';
  highContrast?: boolean;
  language?: string;
}

/**
 * Recorded answer from the user questionnaire.
 * @interface QuestionnaireAnswer
 * @property {string} questionId - Unique identifier for the question
 * @property {string | number | boolean | string[]} answer - User's answer value
 * @property {string} answeredAt - ISO 8601 timestamp of when answered
 */
export interface QuestionnaireAnswer {
  questionId: string;
  answer: string | number | boolean | string[];
  answeredAt: string;
}

/**
 * User's values and priorities for treatment decision-making.
 * @interface UserValues
 * @property {string[]} [priorityFactors] - User's top priority factors in treatment
 * @property {string[]} [lifestylePreferences] - Lifestyle-related preferences
 * @property {string[]} [concerns] - User's concerns about treatment
 * @property {string} [supportNetwork] - Description of support network
 * @property {string} [workSituation] - Employment and work considerations
 * @property {string} [travelPreferences] - Travel-related preferences
 * @property {string} [notes] - Additional user notes
 */
export interface UserValues {
  priorityFactors?: string[];
  lifestylePreferences?: string[];
  concerns?: string[];
  supportNetwork?: string;
  workSituation?: string;
  travelPreferences?: string;
  notes?: string;
}

/**
 * Complete session data structure containing all user state.
 * @interface SessionData
 * @property {string} id - Unique session identifier (UUID)
 * @property {string} createdAt - ISO 8601 timestamp of session creation
 * @property {string} expiresAt - ISO 8601 timestamp of session expiry
 * @property {string} lastAccessedAt - ISO 8601 timestamp of last access
 * @property {UserPreferences} preferences - User accessibility preferences
 * @property {QuestionnaireAnswer[]} questionnaireAnswers - Completed questionnaire responses
 * @property {UserValues} values - User's treatment values and priorities
 * @property {ChatMessage[]} chatHistory - Conversation history with AI assistant
 * @property {string} currentStep - Current step in the decision journey
 */
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

/**
 * Session expiry time in milliseconds (15 minutes).
 * @constant {number}
 */
const SESSION_EXPIRY_MS = 15 * 60 * 1000;

/**
 * Cleanup interval for expired sessions (5 minutes).
 * @constant {number}
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * File path for file-based session persistence.
 * @constant {string}
 */
const SESSION_FILE_PATH = process.env.SESSION_FILE_PATH || './sessions.json';

/**
 * Interval for persisting sessions to file (30 seconds).
 * @constant {number}
 */
const PERSIST_INTERVAL_MS = 30 * 1000;

/**
 * Interface for session storage backends.
 * Defines the contract that all storage implementations must follow.
 * @interface StorageBackend
 */
interface StorageBackend {
  /**
   * Retrieve session data by ID.
   * @param {string} sessionId - Session identifier
   * @returns {SessionData | undefined} Session data or undefined if not found
   */
  get(sessionId: string): SessionData | undefined;

  /**
   * Store or update session data.
   * @param {string} sessionId - Session identifier
   * @param {SessionData} data - Session data to store
   */
  set(sessionId: string, data: SessionData): void;

  /**
   * Delete a session.
   * @param {string} sessionId - Session identifier
   * @returns {boolean} True if session was deleted
   */
  delete(sessionId: string): boolean;

  /**
   * Get iterator over all sessions.
   * @returns {IterableIterator<[string, SessionData]>} Iterator of [id, data] pairs
   */
  entries(): IterableIterator<[string, SessionData]>;

  /**
   * Number of stored sessions.
   * @type {number}
   */
  size: number;

  /**
   * Clear all sessions.
   */
  clear(): void;
}

/**
 * In-memory storage backend using Map.
 * Suitable for development and testing; data is lost on restart.
 * @class MemoryBackend
 * @implements {StorageBackend}
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
 * File-based storage backend with in-memory cache.
 * Suitable for Heroku ephemeral filesystem; sessions survive restarts within dyno lifecycle.
 * Periodically persists to disk and on process shutdown.
 * @class FileBackend
 * @implements {StorageBackend}
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
 * SQLite storage backend for persistent session storage.
 * Sessions survive server restarts and are stored in a local database file.
 * Recommended for production deployments requiring persistence.
 * @class SQLiteBackend
 * @implements {StorageBackend}
 */
class SQLiteBackend implements StorageBackend {
  private db: Database.Database;
  private stmtGet: Database.Statement;
  private stmtSet: Database.Statement;
  private stmtDelete: Database.Statement;
  private stmtGetAll: Database.Statement;
  private stmtCount: Database.Statement;
  private stmtClear: Database.Statement;
  private stmtCleanup: Database.Statement;

  constructor() {
    this.db = getDatabase();

    // Prepare statements for better performance
    this.stmtGet = this.db.prepare(
      'SELECT data FROM sessions WHERE id = ?'
    );

    this.stmtSet = this.db.prepare(`
      INSERT INTO sessions (id, data, created_at, updated_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at,
        expires_at = excluded.expires_at
    `);

    this.stmtDelete = this.db.prepare(
      'DELETE FROM sessions WHERE id = ?'
    );

    this.stmtGetAll = this.db.prepare(
      'SELECT id, data FROM sessions'
    );

    this.stmtCount = this.db.prepare(
      'SELECT COUNT(*) as count FROM sessions'
    );

    this.stmtClear = this.db.prepare(
      'DELETE FROM sessions'
    );

    this.stmtCleanup = this.db.prepare(
      'DELETE FROM sessions WHERE expires_at < ?'
    );

    logger.info('SQLite session storage backend initialized');
  }

  get(sessionId: string): SessionData | undefined {
    try {
      const row = this.stmtGet.get(sessionId) as { data: string } | undefined;
      if (row) {
        return JSON.parse(row.data) as SessionData;
      }
      return undefined;
    } catch (error) {
      logger.error('SQLite get error', {
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return undefined;
    }
  }

  set(sessionId: string, data: SessionData): void {
    try {
      const now = new Date().toISOString();
      this.stmtSet.run(
        sessionId,
        JSON.stringify(data),
        data.createdAt,
        now,
        data.expiresAt
      );
    } catch (error) {
      logger.error('SQLite set error', {
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  delete(sessionId: string): boolean {
    try {
      const result = this.stmtDelete.run(sessionId);
      return result.changes > 0;
    } catch (error) {
      logger.error('SQLite delete error', {
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  *entries(): IterableIterator<[string, SessionData]> {
    try {
      const rows = this.stmtGetAll.all() as Array<{ id: string; data: string }>;
      for (const row of rows) {
        try {
          const sessionData = JSON.parse(row.data) as SessionData;
          yield [row.id, sessionData];
        } catch {
          logger.warn('Failed to parse session data', { sessionId: row.id });
        }
      }
    } catch (error) {
      logger.error('SQLite entries error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  get size(): number {
    try {
      const row = this.stmtCount.get() as { count: number };
      return row.count;
    } catch (error) {
      logger.error('SQLite size error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }

  clear(): void {
    try {
      this.stmtClear.run();
    } catch (error) {
      logger.error('SQLite clear error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete expired sessions from the database
   * Returns the number of sessions deleted
   */
  cleanupExpired(): number {
    try {
      const now = new Date().toISOString();
      const result = this.stmtCleanup.run(now);
      return result.changes;
    } catch (error) {
      logger.error('SQLite cleanup error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    closeDatabase();
  }
}

/**
 * Create a Redis storage backend (optional, requires ioredis).
 * Falls back to null if Redis is not available.
 *
 * @async
 * @function createRedisBackend
 * @param {string} redisUrl - Redis connection URL
 * @returns {Promise<StorageBackend | null>} Redis backend or null if unavailable
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
 * Create and return the appropriate storage backend based on configuration.
 * Priority: explicit SESSION_STORAGE > production default (sqlite) > development default (memory).
 *
 * @function createStorageBackend
 * @returns {StorageBackend} Configured storage backend instance
 */
function createStorageBackend(): StorageBackend {
  const sessionStorage = process.env.SESSION_STORAGE || '';

  // Explicit SQLite storage
  if (sessionStorage === 'sqlite') {
    logger.info('Using SQLite session storage');
    return new SQLiteBackend();
  }

  // Explicit Redis storage (falls back to SQLite if unavailable)
  if (sessionStorage === 'redis' && process.env.REDIS_URL) {
    // Try Redis but fall back to SQLite if it fails
    // For now, we'll use SQLite storage as Redis requires async handling
    logger.info('Redis storage configured but using SQLite for sync compatibility');
    return new SQLiteBackend();
  }

  // Explicit file storage
  if (sessionStorage === 'file') {
    logger.info('Using file-based session storage', { path: SESSION_FILE_PATH });
    return new FileBackend(SESSION_FILE_PATH);
  }

  // Explicit memory storage
  if (sessionStorage === 'memory') {
    logger.info('Using in-memory session storage');
    return new MemoryBackend();
  }

  // Default: production uses SQLite, development uses memory
  if (process.env.NODE_ENV === 'production') {
    logger.info('Using SQLite session storage (production default)');
    return new SQLiteBackend();
  }

  logger.info('Using in-memory session storage (development default)');
  return new MemoryBackend();
}

/**
 * Session store manager providing a unified interface for session operations.
 * Handles session CRUD, expiry management, and automatic cleanup.
 * @class SessionStore
 */
class SessionStore {
  /** @private */
  private storage: StorageBackend;
  /** @private */
  private cleanupInterval: NodeJS.Timeout | null;

  /**
   * Create a new SessionStore instance.
   * Initializes the storage backend and starts the cleanup task.
   */
  constructor() {
    this.storage = createStorageBackend();
    this.cleanupInterval = null;
    this.startCleanupTask();
  }

  /**
   * Create a new session with default values.
   * @param {string} sessionId - Unique session identifier (UUID)
   * @returns {SessionData} Newly created session data
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
   * Retrieve a session by ID.
   * Returns null if session doesn't exist or has expired.
   * @param {string} sessionId - Session identifier to retrieve
   * @returns {SessionData | null} Session data or null if not found/expired
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
   * Update session data with partial updates.
   * Performs deep merge for nested objects (preferences, values).
   * @param {string} sessionId - Session identifier to update
   * @param {Partial<SessionData>} updates - Partial session data to merge
   * @returns {SessionData | null} Updated session data or null if not found
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
   * Refresh session expiry time to extend the session.
   * @param {string} sessionId - Session identifier to refresh
   * @returns {boolean} True if session was refreshed, false if not found
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
   * Delete a session permanently.
   * @param {string} sessionId - Session identifier to delete
   * @returns {boolean} True if session was deleted, false if not found
   */
  delete(sessionId: string): boolean {
    const result = this.storage.delete(sessionId);
    if (result) {
      apiLogger.sessionDeleted(sessionId);
    }
    return result;
  }

  /**
   * Get the count of active sessions.
   * @returns {number} Number of active sessions in storage
   */
  getActiveCount(): number {
    return this.storage.size;
  }

  /**
   * Clean up expired sessions from storage.
   * Uses optimized database query for SQLite backend.
   * @returns {number} Number of sessions cleaned up
   */
  cleanup(): number {
    let cleaned = 0;

    // Use optimized cleanup for SQLite backend
    if (this.storage instanceof SQLiteBackend) {
      cleaned = this.storage.cleanupExpired();
    } else {
      // Fallback for other backends: iterate and delete
      const now = new Date();
      for (const [sessionId, session] of this.storage.entries()) {
        if (new Date(session.expiresAt) < now) {
          this.storage.delete(sessionId);
          cleaned++;
        }
      }
    }

    apiLogger.sessionCleanup(cleaned);
    return cleaned;
  }

  /**
   * Start the automatic cleanup task that runs periodically.
   * @private
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
   * Stop the automatic cleanup task.
   * Useful for testing or graceful shutdown.
   */
  stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clear all sessions from storage.
   * Useful for testing or reset operations.
   */
  clear(): void {
    this.storage.clear();
  }
}

/**
 * Singleton session store instance.
 * Use this for all session operations in the application.
 * @constant {SessionStore}
 */
export const sessionStore = new SessionStore();

/**
 * Export SessionStore class for testing purposes.
 * @see SessionStore
 */
export { SessionStore };

/**
 * Export Redis backend factory for future async implementation.
 * @see createRedisBackend
 */
export { createRedisBackend };
