/**
 * Rate limiting middleware for NHS Renal Decision Aid
 *
 * Protects the API from abuse by limiting request rates per IP address.
 * Uses express-rate-limit for implementation.
 */

import rateLimit, { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { Request, Response } from 'express';
import { apiLogger } from '../services/logger.js';

/**
 * Custom key generator that handles proxy headers
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
 * Custom handler for when rate limit is exceeded
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
 * Common rate limit options
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
 * Rate limiter for chat endpoint
 * More restrictive: 20 requests per minute per IP
 */
export const chatRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000, // 1 minute window
  max: 20, // 20 requests per window
  message: 'Too many chat requests. Please wait a moment before sending more messages.',
  handler: createLimitHandler('chat'),
});

/**
 * Rate limiter for session creation
 * Prevent abuse of session creation: 10 sessions per minute per IP
 */
export const sessionCreateRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 session creations per window
  message: 'Too many session creation requests. Please wait before creating new sessions.',
  handler: createLimitHandler('session-create'),
});

/**
 * Rate limiter for general session operations
 * Less restrictive: 100 requests per minute per IP
 */
export const sessionRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // 100 requests per window
  message: 'Too many session requests. Please wait before making more requests.',
  handler: createLimitHandler('session'),
});

/**
 * Global rate limiter for all API endpoints
 * Very permissive: 200 requests per minute per IP
 * This is a safety net to prevent extreme abuse
 */
export const globalRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000, // 1 minute window
  max: 200, // 200 requests per window
  message: 'Too many requests. Please slow down.',
  handler: createLimitHandler('global'),
});

/**
 * Stricter rate limiter for burst protection
 * Prevents rapid-fire requests: 5 requests per second per IP
 */
export const burstRateLimiter: RateLimitRequestHandler = rateLimit({
  ...commonOptions,
  windowMs: 1000, // 1 second window
  max: 5, // 5 requests per second
  message: 'Requests are being sent too quickly. Please slow down.',
  handler: createLimitHandler('burst'),
});
