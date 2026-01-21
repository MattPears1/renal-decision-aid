import { Router } from 'express';
import sessionRoutes from './session.js';
import chatRoutes from './chat.js';
import transcribeRoutes from './transcribe.js';
import synthesizeRoutes from './synthesize.js';

const router = Router();

// Mount route modules
router.use('/session', sessionRoutes);
router.use('/chat', chatRoutes);
router.use('/transcribe', transcribeRoutes);
router.use('/synthesize', synthesizeRoutes);

export default router;
