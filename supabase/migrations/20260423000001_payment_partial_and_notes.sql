-- ---------------------------------------------------------------------------
-- Agrega el valor 'partial' al enum event_payment_status y la columna payment_notes
-- ---------------------------------------------------------------------------

ALTER TYPE public.event_payment_status ADD VALUE IF NOT EXISTS 'partial';

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS payment_notes TEXT;
