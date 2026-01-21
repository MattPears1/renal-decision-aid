/**
 * @fileoverview Structured logging service for the NHS Renal Decision Aid.
 * Provides comprehensive logging with support for multiple levels, formats,
 * and specialized logging functions for different application domains.
 *
 * @module services/logger
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires winston
 * @requires uuid
 * @requires express
 *
 * @description
 * Uses winston for structured logging with support for:
 * - Multiple log levels (error, warn, info, debug)
 * - Timestamps and request IDs for traceability
 * - JSON format for production (log aggregators)
 * - Pretty format for development (readability)
 * - Configurable log levels via environment variables
 */

import { createLogger, format, transports, Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

/**
 * Extend Express Request interface to include requestId for request tracing.
 * @global
 */
declare global {
  namespace Express {
    interface Request {
      /** Unique identifier for request tracing */
      requestId?: string;
    }
  }
}

/**
 * Log level determined from environment.
 * Defaults to 'info' in production, 'debug' in development.
 * @constant {string}
 */
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

/**
 * Custom format for development - human-readable with colors.
 * @constant {Format}
 */
const devFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.colorize(),
  format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const reqIdStr = requestId ? `[${requestId}]` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${reqIdStr} ${message}${metaStr}`;
  })
);

/**
 * JSON format for production - optimized for log aggregators.
 * @constant {Format}
 */
const prodFormat = format.combine(
  format.timestamp(),
  format.json()
);

/**
 * Main winston logger instance configured for the application.
 * @constant {Logger}
 */
const logger: Logger = createLogger({
  level: LOG_LEVEL,
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: {
    service: 'nhs-renal-decision-aid',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

/**
 * Create a child logger with request context for request-scoped logging.
 *
 * @function createRequestLogger
 * @param {string} requestId - Unique request identifier for tracing
 * @returns {Logger} Child logger instance with requestId in default meta
 *
 * @example
 * const reqLogger = createRequestLogger('abc-123');
 * reqLogger.info('Processing request'); // Includes requestId in output
 */
export function createRequestLogger(requestId: string): Logger {
  return logger.child({ requestId });
}

/**
 * Express middleware to add request ID and log incoming/outgoing requests.
 * Generates a unique request ID if not provided in headers.
 * Logs request details on entry and response details on completion.
 *
 * @function requestLogger
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Generate or use existing request ID
  req.requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // Add request ID to response headers
  res.setHeader('X-Request-Id', req.requestId);

  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.socket.remoteAddress,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]('Request completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}

/**
 * Log an error with full stack trace and additional context.
 *
 * @function logError
 * @param {Error} error - Error object to log
 * @param {Record<string, unknown>} [context] - Additional context data
 * @returns {void}
 *
 * @example
 * logError(new Error('Database connection failed'), { requestId: '123', operation: 'query' });
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  logger.error(error.message, {
    name: error.name,
    stack: error.stack,
    ...context,
  });
}

/**
 * Specialized logging functions for API-specific events.
 * Provides consistent logging format for session, chat, and system events.
 *
 * @namespace apiLogger
 * @property {Function} sessionCreated - Log session creation
 * @property {Function} sessionAccessed - Log session access
 * @property {Function} sessionUpdated - Log session update
 * @property {Function} sessionDeleted - Log session deletion
 * @property {Function} sessionExpired - Log session expiry
 * @property {Function} sessionCleanup - Log cleanup operation
 * @property {Function} chatRequest - Log incoming chat request
 * @property {Function} chatResponse - Log chat response
 * @property {Function} chatError - Log chat processing error
 * @property {Function} piiDetected - Log PII detection
 * @property {Function} rateLimitExceeded - Log rate limit breach
 * @property {Function} openaiError - Log OpenAI API error
 */
export const apiLogger = {
  sessionCreated: (sessionId: string, requestId?: string) => {
    logger.info('Session created', { sessionId, requestId });
  },

  sessionAccessed: (sessionId: string, requestId?: string) => {
    logger.debug('Session accessed', { sessionId, requestId });
  },

  sessionUpdated: (sessionId: string, requestId?: string) => {
    logger.debug('Session updated', { sessionId, requestId });
  },

  sessionDeleted: (sessionId: string, requestId?: string) => {
    logger.info('Session deleted', { sessionId, requestId });
  },

  sessionExpired: (sessionId: string) => {
    logger.debug('Session expired', { sessionId });
  },

  sessionCleanup: (count: number) => {
    if (count > 0) {
      logger.info('Session cleanup completed', { removedCount: count });
    }
  },

  chatRequest: (sessionId: string | undefined, messageLength: number, requestId?: string) => {
    logger.info('Chat request received', { sessionId, messageLength, requestId });
  },

  chatResponse: (sessionId: string | undefined, responseLength: number, model: string, requestId?: string) => {
    logger.info('Chat response sent', { sessionId, responseLength, model, requestId });
  },

  chatError: (error: Error, sessionId: string | undefined, requestId?: string) => {
    logger.error('Chat processing error', {
      message: error.message,
      name: error.name,
      sessionId,
      requestId,
    });
  },

  piiDetected: (types: string[], requestId?: string) => {
    logger.warn('PII detected in request', { types, requestId });
  },

  rateLimitExceeded: (ip: string, endpoint: string, requestId?: string) => {
    logger.warn('Rate limit exceeded', { ip, endpoint, requestId });
  },

  openaiError: (statusCode: number, message: string, requestId?: string) => {
    logger.error('OpenAI API error', { statusCode, message, requestId });
  },
};

/**
 * Specialized logging functions for application lifecycle events.
 * Provides consistent logging for startup, shutdown, and health checks.
 *
 * @namespace appLogger
 * @property {Function} startup - Log application startup
 * @property {Function} shutdown - Log application shutdown
 * @property {Function} configLoaded - Log configuration details
 * @property {Function} healthCheck - Log health check status
 */
export const appLogger = {
  startup: (port: number | string, environment: string) => {
    logger.info('Application started', { port, environment });
  },

  shutdown: (reason: string) => {
    logger.info('Application shutting down', { reason });
  },

  configLoaded: (config: Record<string, unknown>) => {
    logger.info('Configuration loaded', config);
  },

  healthCheck: (status: string) => {
    logger.debug('Health check performed', { status });
  },
};

/**
 * Base winston logger instance for direct use.
 * Prefer using apiLogger or appLogger for domain-specific logging.
 * @default
 */
export default logger;
