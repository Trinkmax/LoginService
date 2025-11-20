import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Clerk
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY es requerido'),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, 'CLERK_PUBLISHABLE_KEY es requerido'),
  CLERK_WEBHOOK_SECRET: z.string().min(1, 'CLERK_WEBHOOK_SECRET es requerido'),
  CLERK_ISSUER_URL: z.string().url('CLERK_ISSUER_URL debe ser una URL válida'),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL debe ser una URL válida'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY es requerido'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY es requerido'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    return {
      port: parseInt(parsed.PORT, 10),
      nodeEnv: parsed.NODE_ENV,
      clerk: {
        secretKey: parsed.CLERK_SECRET_KEY,
        publishableKey: parsed.CLERK_PUBLISHABLE_KEY,
        webhookSecret: parsed.CLERK_WEBHOOK_SECRET,
        issuerUrl: parsed.CLERK_ISSUER_URL,
      },
      supabase: {
        url: parsed.SUPABASE_URL,
        anonKey: parsed.SUPABASE_ANON_KEY,
        serviceRoleKey: parsed.SUPABASE_SERVICE_ROLE_KEY,
      },
      cors: {
        origins: parsed.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Error de configuración de variables de entorno:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseEnv();

