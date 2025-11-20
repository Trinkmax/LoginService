import { Router, Request, Response } from 'express';
import supabaseAdmin from '../config/database';

const router = Router();

/**
 * GET /health
 * Health check básico
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'gopark-auth-service',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/db
 * Health check de la base de datos
 */
router.get('/db', async (_req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('users').select('count').limit(1).single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

