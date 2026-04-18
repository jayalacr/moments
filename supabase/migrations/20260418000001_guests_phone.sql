-- =============================================================================
-- Migration: guests — phone como identificador de negocio
-- Agrega campo de teléfono/WhatsApp para cada invitado.
-- Es único por evento: evita duplicados y sirve para dirigir el mensaje de WA.
-- =============================================================================

ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS phone text;

-- El teléfono debe ser único dentro del mismo evento
CREATE UNIQUE INDEX IF NOT EXISTS guests_event_phone_unique
  ON public.guests (event_id, phone)
  WHERE phone IS NOT NULL;
