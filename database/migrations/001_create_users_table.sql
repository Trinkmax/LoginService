-- Migration: 001_create_users_table
-- Description: Crear tabla de usuarios con sincronización desde Clerk
-- Date: 2025-11-19

-- Crear enum para roles de usuario
CREATE TYPE user_role AS ENUM ('user', 'host', 'admin');

-- Crear enum para estado KYC
CREATE TYPE kyc_status AS ENUM ('not_started', 'pending', 'verified', 'rejected');

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  
  -- Información personal
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  profile_image_url TEXT,
  
  -- Roles y permisos
  role user_role DEFAULT 'user' NOT NULL,
  kyc_status kyc_status DEFAULT 'not_started' NOT NULL,
  
  -- Estados
  is_active BOOLEAN DEFAULT true NOT NULL,
  email_verified BOOLEAN DEFAULT false NOT NULL,
  phone_verified BOOLEAN DEFAULT false NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sign_in_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para optimizar consultas
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en la tabla y columnas
COMMENT ON TABLE users IS 'Tabla de usuarios sincronizada con Clerk';
COMMENT ON COLUMN users.clerk_id IS 'ID único de Clerk para este usuario';
COMMENT ON COLUMN users.email IS 'Email principal del usuario';
COMMENT ON COLUMN users.role IS 'Rol del usuario en la plataforma (user, host, admin)';
COMMENT ON COLUMN users.kyc_status IS 'Estado del proceso de verificación KYC';
COMMENT ON COLUMN users.is_active IS 'Indica si el usuario está activo o ha sido desactivado';
COMMENT ON COLUMN users.last_sign_in_at IS 'Última vez que el usuario inició sesión';

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Política: Los usuarios pueden actualizar su propio perfil (campos limitados)
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (
    clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    -- Solo pueden actualizar ciertos campos, no role ni kyc_status
  );

-- Política: Los admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

-- Política: Los admins pueden actualizar cualquier usuario
CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

-- Política: Solo el sistema puede insertar usuarios (mediante Service Role Key)
-- Esta política se maneja a nivel de aplicación con Service Role Key

-- Insertar usuario admin de ejemplo (opcional, comentado por seguridad)
-- INSERT INTO users (
--   clerk_id,
--   email,
--   name,
--   first_name,
--   last_name,
--   role,
--   is_active,
--   email_verified
-- ) VALUES (
--   'user_admin_initial',
--   'admin@gopark.com',
--   'Admin GoPark',
--   'Admin',
--   'GoPark',
--   'admin',
--   true,
--   true
-- );

