import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { config } from '../config/env';
import { ClerkWebhookPayload } from '../types/webhook.types';

/**
 * Middleware para verificar la firma de webhooks de Clerk
 * Utiliza Svix para validar que el webhook viene realmente de Clerk
 */
export const verifyClerkWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener headers de la firma
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    // Validar que los headers existen
    if (!svix_id || !svix_timestamp || !svix_signature) {
      res.status(400).json({
        success: false,
        error: 'Missing svix headers',
      });
      return;
    }

    // Obtener el body raw (debe ser string)
    const payload = JSON.stringify(req.body);

    // Crear instancia de Webhook de Svix
    const wh = new Webhook(config.clerk.webhookSecret);

    let evt: ClerkWebhookPayload;

    try {
      // Verificar la firma
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookPayload;
    } catch (err) {
      console.error('❌ Error verificando webhook:', err);
      res.status(400).json({
        success: false,
        error: 'Invalid webhook signature',
      });
      return;
    }

    // Agregar el evento verificado al request
    req.body = evt;
    next();
  } catch (error) {
    console.error('❌ Error en middleware de verificación:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

