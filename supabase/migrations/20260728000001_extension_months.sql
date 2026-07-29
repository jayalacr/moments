-- Modelo de publicación: 2 meses incluidos + contador de meses extra (ver LANZAMIENTO.md, A0).
-- Reemplaza los paquetes de extension_key (none/1m/3m/6m/permanent) por un contador libre.
-- Aplicar manualmente en el dashboard de Supabase (repo policy: no CLI migrations).

ALTER TABLE events ADD COLUMN IF NOT EXISTS extension_months INTEGER NOT NULL DEFAULT 0
  CHECK (extension_months >= 0);

UPDATE events SET extension_months = CASE extension_key
  WHEN '1m' THEN 1 WHEN '3m' THEN 3 WHEN '6m' THEN 6
  WHEN 'permanent' THEN 120 ELSE 0 END;

-- Ejecutar solo después de verificar que la app ya no lee extension_key:
-- ALTER TABLE events DROP COLUMN extension_key;
