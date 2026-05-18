-- ============================================================
-- Datos iniciales de desarrollo
-- ============================================================
-- Este seed crea el primer usuario administrador.
-- La password visible para desarrollo es: 12345678
-- Importante: en la base de datos se guarda un hash bcrypt, no la password real.

INSERT INTO users (name, email, password_hash, role, is_active, must_change_password)
VALUES (
  'Admin',
  'admin@local.test',
  '$2a$10$81S4fuaRwaJvwN8vlDnaBuMaW9clzC70IQv/evUwOIbgm8dUuxcOS',
  'admin',
  true,
  true
)
ON CONFLICT (email) DO NOTHING;
