import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

// Body parser - IMPORTANTE: usar raw para webhooks
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Body parser para el resto de rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging en desarrollo
if (config.nodeEnv === 'development') {
  app.use((req: Request, _res: Response, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'GoPark Auth Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      webhooks: '/api/webhooks/clerk/webhook',
      users: '/api/users',
    },
  });
});

// API routes
app.use('/api', routes);

// Error handler (debe estar al final)
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║     🚀 GoPark Auth Service Started           ║
╠═══════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(30)}    ║
║  Port:        ${PORT.toString().padEnd(30)}    ║
║  Clerk:       ✅ Configured                    ║
║  Supabase:    ✅ Connected                     ║
╠═══════════════════════════════════════════════╣
║  Endpoints:                                   ║
║  - Health:    http://localhost:${PORT}/api/health   ║
║  - Webhooks:  http://localhost:${PORT}/api/webhooks ║
║  - Users:     http://localhost:${PORT}/api/users    ║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;

