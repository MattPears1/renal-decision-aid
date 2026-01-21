/**
 * @fileoverview Rate limiting middleware for the NHS Renal Decision Aid.
 * Protects the API from abuse by limiting request rates per IP address.
 *
 * @module middleware/rateLimiter
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires express-rate-limit
 * @requires express
 * @requires ../services/logger
 *
 * @description
 * Provides multiple rate limiters with different configurations:
 * - chatRateLimiter: Strict limit for AI chat endpoints
 * - sessionCreateRateLimiter: Prevents session creation abuse
 * - sessionRateLimiter: General session operations
 * - globalRateLimiter: Overall API protection
 * - burstRateLimiter: Prevents rapid-fire requests
 */

import rateLimit, { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { Request, Response } from 'express';
import { apiLogger } from '../services/logger.js';

/**
 * Extract client IP address from request, handling proxy headers.
 * Supports X-Forwarded-For header for clients behind proxies (e.g., Heroku).
 *
 * @function getClientIp
 * @param {Request} req - Express request object
 * @returns {string} Client IP address or 'unknown' if not determinable
 */
function getClientIp(req: Request): string {
  // Trust X-Forwarded-For header when behind a proxy (like Heroku)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, use the first one (client's IP)
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    return ips.trim();
  }

  // Fallback to direct connection IP
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Create a custom handler for rate limit exceeded responses.
 * Logs the event and returns a 429 response with retry information.
 *
 * @function createLimitHandler
 * @param {string} endpoint - Endpoint identifier for logging
 * @returns {Function} Express middleware handler for rate limit exceeded
 */
function createLimitHandler(endpoint: string) {
  return (req: Request, res: Response): void => {
    const clientIp = getClientIp(req);
    apiLogger.rateLimitExceeded(clientIp, endpoint, req.requestId);

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please wait before making more requests.',
      retryAfter: res.getHeader('Retry-After'),
    });
  };
}

/**
 * Common rate limit configuration options shared by all limiters.
 * @constant {Partial<Options>}
 */
const commonOptions: Partial<Options> = {
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator: getClientIp,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
};

/**
 * Rate limiter for the chat endpoint.
 * More restrictive: 20 requests per minute per IP.
 * Protects the AI chat service from excessive usage.
 *
 * @constant {RateLimitRequestHandler}
 */
export const chatRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000, // 1 minute window
  max: 20, // 20 requests per window
  message: 'Too many chat requests. Please wait a moment before sending more messages.',
  handler: createLimitHandler('chat'),
});

/**
 * Rate limiter for session creation endpoint.
 * Prevents session creation abuse: 10 sessions per minute per IP.
 *
 * @constant {RateLimitRequestHandler}
 */
export const sessionCreateRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 session creations per window
  message: 'Too many session creation requests. Please wait before creating new sessions.',
  handler: createLimitHandler('session-create'),
});

/**
 * Rate limiter for general session operations (GET, PUT, DELETE).
 * Less restrictive: 100 requests per minute per IP.
 *
 * @constant {RateLimitRequestHandler}
 */
export const sessionRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // 100 requests per window
  message: 'Too many session requests. Please wait before making more requests.',
  handler: createLimitHandler('session'),
});

/**
 * Global rate limiter for all API endpoints.
 * Very permissive: 200 requests per minute per IP.
 * Acts as a safety net to prevent extreme abuse.
 *
 * @constant {RateLimitRequestHandler}
 */
export const globalRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000, // 1 minute window
  max: 200, // 200 requests per window
  message: 'Too many requests. Please slow down.',
  handler: createLimitHandler('global'),
});

/**
 * Stricter rate limiter for burst protection.
 * Prevents rapid-fire requests: 5 requests per second per IP.
 *
 * @constant {RateLimitRequestHandler}
 */
export const burstRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 1000, // 1 second window
  max: 5, // 5 requests per second
  message: 'Requests are being sent too quickly. Please slow down.',
  handler: createLimitHandler('burst'),
});
