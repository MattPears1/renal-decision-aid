import { Router } from 'express';
import sessionRoutes from './session.js';
import chatRoutes from './chat.js';

const router = Router();

// Mount route modules
router.use('/session', sessionRoutes);
router.use('/chat', chatRoutes);

export default router;
