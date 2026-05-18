-- ============================================================
-- Datos iniciales de desarrollo y primer despliegue
-- ============================================================
-- Este seed crea el primer usuario administrador si aun no existe.
-- La password visible para desarrollo o primer acceso es: 12345678
-- La aplicacion obligara a cambiarla en el primer login.

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

