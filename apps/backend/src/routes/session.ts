import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore, SessionData } from '../services/sessionStore.js';

const router = Router();

/**
 * POST /api/session
 * Create a new session
 */
router.post('/', async (_req: Request, res: Response) => {
  try {
    const sessionId = uuidv4();
    const session = sessionStore.create(sessionId);

    res.status(201).json({
      sessionId: session.id,
      expiresAt: session.expiresAt,
      message: 'Session created successfully',
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Session Creation Failed',
      message: 'Unable to create a new session',
    });
  }
});

/**
 * GET /api/session/:id
 * Get session data by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = sessionStore.get(id);

    if (!session) {
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
    console.error('Error retrieving session:', error);
    res.status(500).json({
      error: 'Session Retrieval Failed',
      message: 'Unable to retrieve session data',
    });
  }
});

/**
 * PUT /api/session/:id
 * Update session data
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<SessionData> = req.body;

    const session = sessionStore.get(id);
    if (!session) {
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
    console.error('Error updating session:', error);
    res.status(500).json({
      error: 'Session Update Failed',
      message: 'Unable to update session data',
    });
  }
});

/**
 * DELETE /api/session/:id
 * End/delete a session
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = sessionStore.delete(id);

    if (!deleted) {
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
    console.error('Error deleting session:', error);
    res.status(500).json({
      error: 'Session Deletion Failed',
      message: 'Unable to delete session',
    });
  }
});

export default router;
