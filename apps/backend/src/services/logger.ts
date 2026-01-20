/**
 * Structured logging service for NHS Renal Decision Aid
 *
 * Uses winston for structured logging with support for:
 * - Multiple log levels (error, warn, info, debug)
 * - Timestamps and request IDs
 * - JSON format for production, pretty format for development
 * - Configurable log levels via environment variables
 */

import { createLogger, format, transports, Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// Determine log level from environment
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Custom format for development - more readable
const devFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.colorize(),
  format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const reqIdStr = requestId ? `[${requestId}]` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${reqIdStr} ${message}${metaStr}`;
  })
);

// JSON format for production - easier to parse by log aggregators
const prodFormat = format.combine(
  format.timestamp(),
  format.json()
);

// Create the logger instance
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
 * Create a child logger with request context
 */
export function createRequestLogger(requestId: string): Logger {
  return logger.child({ requestId });
}

/**
 * Express middleware to add request ID and log incoming requests
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
 * Log an error with full context
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  logger.error(error.message, {
    name: error.name,
    stack: error.stack,
    ...context,
  });
}

/**
 * Log API-specific events
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
 * Log application lifecycle events
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

// Export the base logger for direct use if needed
export default logger;
