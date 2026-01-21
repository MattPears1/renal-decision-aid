/**
 * @fileoverview Session management API endpoints for the NHS Renal Decision Aid.
 * Handles creation, retrieval, updating, and deletion of user sessions
 * for maintaining state across the decision support journey.
 *
 * @module routes/session
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 *
 * @requires express
 * @requires uuid
 * @requires ../services/sessionStore
 * @requires ../middleware/rateLimiter
 * @requires ../services/logger
 *
 * @see {@link module:services/sessionStore} for session storage implementation
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore, SessionData } from '../services/sessionStore.js';
import { sessionCreateRateLimiter, sessionRateLimiter } from '../middleware/rateLimiter.js';
import logger, { logError } from '../services/logger.js';

/**
 * Express router instance for session management endpoints.
 * @type {Router}
 */
const router = Router();

/**
 * Create a new user session.
 *
 * POST /api/session
 *
 * @async
 * @function
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with new session details
 *
 * @throws {429} Rate Limited - Too many session creation requests
 * @throws {500} Session Creation Failed - Internal error
 *
 * @example
 * // Request
 * POST /api/session
 *
 * // Response (201 Created)
 * {
 *   "sessionId": "550e8400-e29b-41d4-a716-446655440000",
 *   "expiresAt": "2026-01-21T10:45:00.000Z",
 *   "message": "Session created successfully"
 * }
 */
router.post('/', sessionCreateRateLimiter, async (req: Request, res: Response) => {
  try {
    const sessionId = uuidv4();
    const session = sessionStore.create(sessionId);

    logger.info('Session created successfully', {
      requestId: req.requestId,
      sessionId: session.id,
    });

    res.status(201).json({
      sessionId: session.id,
      expiresAt: session.expiresAt,
      message: 'Session created successfully',
    });
  } catch (error) {
    logError(error as Error, { requestId: req.requestId, operation: 'create-session' });
    res.status(500).json({
      error: 'Session Creation Failed',
      message: 'Unable to create a new session',
    });
  }
});

/**
 * Retrieve session data by ID.
 *
 * GET /api/session/:id
 *
 * @async
 * @function
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Session ID to retrieve
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with session data
 *
 * @throws {404} Session Not Found - Session does not exist or has expired
 * @throws {429} Rate Limited - Too many requests
 * @throws {500} Session Retrieval Failed - Internal error
 *
 * @example
 * // Request
 * GET /api/session/550e8400-e29b-41d4-a716-446655440000
 *
 * // Response
 * {
 *   "sessionId": "550e8400-e29b-41d4-a716-446655440000",
 *   "expiresAt": "2026-01-21T10:45:00.000Z",
 *   "data": {
 *     "preferences": { "language": "en" },
 *     "questionnaireAnswers": [],
 *     "values": {},
 *     "chatHistory": [],
 *     "currentStep": "welcome"
 *   }
 * }
 */
router.get('/:id', sessionRateLimiter, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = sessionStore.get(id);

    if (!session) {
      logger.debug('Session not found', { requestId: req.requestId, sessionId: id });
      res.status(404).json({
        error: 'Session Not Found',
        message: 'The requested session does not exist or has expired',
      });
      return;
    }

    // Refresh session expiry on access
    sessionStore.touch(id);

    res.status(200).json({
      sessionId: session.id,
      expiresAt: session.expiresAt,
      data: {
        preferences: session.preferences,
        questionnaireAnswers: session.questionnaireAnswers,
        values: session.values,
        chatHistory: session.chatHistory,
        currentStep: session.currentStep,
      },
    });
  } catch (error) {
    logError(error as Error, {
      requestId: req.requestId,
      sessionId: req.params.id,
      operation: 'get-session',
    });
    res.status(500).json({
      error: 'Session Retrieval Failed',
      message: 'Unable to retrieve session data',
    });
  }
});

/**
 * Update session data.
 *
 * PUT /api/session/:id
 *
 * @async
 * @function
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Session ID to update
 * @param {Partial<SessionData>} req.body - Session data to update
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated session data
 *
 * @throws {400} Invalid Update - Request contains invalid fields
 * @throws {404} Session Not Found - Session does not exist or has expired
 * @throws {429} Rate Limited - Too many requests
 * @throws {500} Session Update Failed - Internal error
 *
 * @example
 * // Request
 * PUT /api/session/550e8400-e29b-41d4-a716-446655440000
 * {
 *   "preferences": { "language": "hi" },
 *   "currentStep": "treatment-overview"
 * }
 *
 * // Response
 * {
 *   "sessionId": "550e8400-e29b-41d4-a716-446655440000",
 *   "expiresAt": "2026-01-21T10:45:00.000Z",
 *   "message": "Session updated successfully",
 *   "data": { ... }
 * }
 */
router.put('/:id', sessionRateLimiter, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<SessionData> = req.body;

    const session = sessionStore.get(id);
    if (!session) {
      logger.debug('Session not found for update', { requestId: req.requestId, sessionId: id });
      res.status(404).json({
        error: 'Session Not Found',
        message: 'The requested session does not exist or has expired',
      });
      return;
    }

    // Validate update payload
    const allowedFields: (keyof SessionData)[] = [
      'preferences',
      'questionnaireAnswers',
      'values',
      'chatHistory',
      'currentStep',
    ];

    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key as keyof SessionData)
    );

    if (invalidFields.length > 0) {
      logger.warn('Invalid fields in session update', {
        requestId: req.requestId,
        sessionId: id,
        invalidFields,
      });
      res.status(400).json({
        error: 'Invalid Update',
        message: `Invalid fields: ${invalidFields.join(', ')}`,
      });
      return;
    }

    const updatedSession = sessionStore.update(id, updates);

    if (!updatedSession) {
      res.status(404).json({
        error: 'Session Not Found',
        message: 'The requested session does not exist or has expired',
      });
      return;
    }

    res.status(200).json({
      sessionId: updatedSession.id,
      expiresAt: updatedSession.expiresAt,
      message: 'Session updated successfully',
      data: {
        preferences: updatedSession.preferences,
        questionnaireAnswers: updatedSession.questionnaireAnswers,
        values: updatedSession.values,
        chatHistory: updatedSession.chatHistory,
        currentStep: updatedSession.currentStep,
      },
    });
  } catch (error) {
    logError(error as Error, {
      requestId: req.requestId,
      sessionId: req.params.id,
      operation: 'update-session',
    });
    res.status(500).json({
      error: 'Session Update Failed',
      message: 'Unable to update session data',
    });
  }
});

/**
 * Delete/end a session.
 *
 * DELETE /api/session/:id
 *
 * @async
 * @function
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Session ID to delete
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response confirming deletion
 *
 * @throws {404} Session Not Found - Session does not exist or already deleted
 * @throws {429} Rate Limited - Too many requests
 * @throws {500} Session Deletion Failed - Internal error
 *
 * @example
 * // Request
 * DELETE /api/session/550e8400-e29b-41d4-a716-446655440000
 *
 * // Response
 * {
 *   "message": "Session ended successfully"
 * }
 */
router.delete('/:id', sessionRateLimiter, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = sessionStore.delete(id);

    if (!deleted) {
      logger.debug('Session not found for deletion', { requestId: req.requestId, sessionId: id });
      res.status(404).json({
        error: 'Session Not Found',
        message: 'The requested session does not exist or has already been deleted',
      });
      return;
    }

    res.status(200).json({
      message: 'Session ended successfully',
    });
  } catch (error) {
    logError(error as Error, {
      requestId: req.requestId,
      sessionId: req.params.id,
      operation: 'delete-session',
    });
    res.status(500).json({
      error: 'Session Deletion Failed',
      message: 'Unable to delete session',
    });
  }
});

export default router;
