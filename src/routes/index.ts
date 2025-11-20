import { Router } from 'express';
import healthRoutes from './health.routes';
import webhookRoutes from './webhook.routes';
import userRoutes from './user.routes';

const router = Router();

// Routes
router.use('/health', healthRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/users', userRoutes);

export default router;

