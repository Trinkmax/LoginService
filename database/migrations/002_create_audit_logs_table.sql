-- Migration: 002_create_audit_logs_table
-- Description: Tabla para auditoría de cambios en usuarios
-- Date: 2025-11-19

-- Crear tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario afectado
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  clerk_id TEXT,
  
  -- Detalles de la acción
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'login', 'logout'
  entity TEXT NOT NULL, -- 'user', 'session', etc.
  
  -- Datos del cambio
  old_data JSONB,
  new_data JSONB,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  performed_by TEXT, -- Clerk ID de quien realizó la acción
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_clerk_id ON audit_logs(clerk_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS (solo admins pueden ver logs)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

-- Comentarios
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las acciones importantes';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de acción realizada';
COMMENT ON COLUMN audit_logs.old_data IS 'Datos antes del cambio (JSON)';
COMMENT ON COLUMN audit_logs.new_data IS 'Datos después del cambio (JSON)';

