import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Cliente de Supabase con Service Role Key para operaciones privilegiadas
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Cliente de Supabase con Anon Key para operaciones públicas
export const supabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

export default supabaseAdmin;

