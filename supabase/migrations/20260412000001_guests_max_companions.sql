-- =============================================================================
-- Migration: guests — max_companions y companion_names
-- Reemplaza max_seats (total asientos) por max_companions (acompañantes adicionales)
-- y agrega companion_names para Deluxe (nombres pre-cargados por el organizador).
-- =============================================================================

-- 1. Agregar columnas nuevas
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS max_companions int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS companion_names jsonb NOT NULL DEFAULT '[]';

-- 2. Migrar datos existentes: max_seats incluía al titular, max_companions son solo adicionales
UPDATE public.guests
  SET max_companions = GREATEST(max_seats - 1, 0)
  WHERE max_companions = 0 AND max_seats IS NOT NULL;

-- 3. Eliminar columna vieja (ya con datos migrados)
ALTER TABLE public.guests
  DROP COLUMN IF EXISTS max_seats;

-- 4. rsvps: guarda los nombres de acompañantes registrados por el invitado
ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS companion_names jsonb NOT NULL DEFAULT '[]';
