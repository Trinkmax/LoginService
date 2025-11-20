import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { verifyClerkWebhook } from '../middleware/verifyWebhook';

const router = Router();

/**
 * POST /clerk/webhook
 * Endpoint principal para recibir webhooks de Clerk
 */
router.post(
  '/clerk/webhook',
  verifyClerkWebhook,
  webhookController.handleClerkWebhook.bind(webhookController)
);

export default router;

