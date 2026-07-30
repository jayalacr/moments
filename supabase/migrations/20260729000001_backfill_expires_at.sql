-- Backfill: eventos publicados sin expires_at (nunca se recalculó al guardar su config).
-- Misma lógica que parseWeddingDate()/computeExpiresAt() en src/lib/eventDate.ts:
-- toma config.targetDate (ISO) o config.date.{day,month,year} (español) + 2 días de gracia.

UPDATE events
SET expires_at = CASE
  WHEN config->>'targetDate' IS NOT NULL THEN
    (config->>'targetDate')::timestamptz + interval '2 days'
  WHEN config#>>'{date,day}' IS NOT NULL
   AND config#>>'{date,month}' IS NOT NULL
   AND config#>>'{date,year}' IS NOT NULL THEN
    make_date(
      (config#>>'{date,year}')::int,
      CASE lower(config#>>'{date,month}')
        WHEN 'enero' THEN 1 WHEN 'febrero' THEN 2 WHEN 'marzo' THEN 3 WHEN 'abril' THEN 4
        WHEN 'mayo' THEN 5 WHEN 'junio' THEN 6 WHEN 'julio' THEN 7 WHEN 'agosto' THEN 8
        WHEN 'septiembre' THEN 9 WHEN 'setiembre' THEN 9 WHEN 'octubre' THEN 10
        WHEN 'noviembre' THEN 11 WHEN 'diciembre' THEN 12
        ELSE (config#>>'{date,month}')::int
      END,
      (config#>>'{date,day}')::int
    ) + interval '2 days'
  ELSE NULL
END
WHERE status = 'published'
  AND expires_at IS NULL;

-- Revisar manualmente los que sigan sin expires_at (config sin fecha reconocible):
-- SELECT id, slug, title, config FROM events WHERE status = 'published' AND expires_at IS NULL;
