/**
 * SQLite database initialization for session persistence
 *
 * Uses better-sqlite3 for synchronous SQLite operations.
 * Database is stored in data/sessions.db by default.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import logger from '../services/logger.js';

// Database file path - configurable via environment variable
const DB_DIR = process.env.SESSION_DB_DIR || path.join(process.cwd(), 'data');
const DB_FILE = process.env.SESSION_DB_FILE || 'sessions.db';
const DB_PATH = path.join(DB_DIR, DB_FILE);

let db: Database.Database | null = null;

/**
 * Initialize the SQLite database
 * Creates the database file and tables if they don't exist
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Ensure the data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    logger.info('Created database directory', { path: DB_DIR });
  }

  try {
    // Open or create the database
    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');

    // Create sessions table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    `);

    // Create index on expires_at for efficient cleanup queries
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
    `);

    logger.info('SQLite database initialized', { path: DB_PATH });

    return db;
  } catch (error) {
    logger.error('Failed to initialize SQLite database', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: DB_PATH,
    });
    throw error;
  }
}

/**
 * Get the database instance
 * Initializes the database if not already done
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 * Should be called on application shutdown
 */
export function closeDatabase(): void {
  if (db) {
    try {
      db.close();
      db = null;
      logger.info('SQLite database connection closed');
    } catch (error) {
      logger.error('Error closing SQLite database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

/**
 * Check if the database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return db !== null;
}

// Export the database path for testing purposes
export { DB_PATH };
