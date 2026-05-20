-- ============================================================
-- Forzar cambio de password del administrador inicial
-- ============================================================
-- Esta migracion corrige instalaciones creadas antes de activar
-- el cambio obligatorio de password temporal.
-- Solo afecta al usuario admin inicial de arranque.

UPDATE users
SET
  must_change_password = true,
  updated_at = NOW()
WHERE email = 'admin@local.test'
  AND must_change_password = false;
