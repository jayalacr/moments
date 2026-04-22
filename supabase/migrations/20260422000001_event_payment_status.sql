-- ---------------------------------------------------------------------------
-- Agrega campo payment_status a la tabla events
-- Un evento solo es visible públicamente si status='published' AND payment_status='paid'
-- ---------------------------------------------------------------------------

-- Crear el tipo enum
CREATE TYPE public.event_payment_status AS ENUM ('pending', 'paid', 'expired', 'refunded');

-- Agregar columna con default 'pending'
ALTER TABLE public.events
  ADD COLUMN payment_status public.event_payment_status NOT NULL DEFAULT 'pending';

-- ---------------------------------------------------------------------------
-- Actualizar política pública de events: exige published + paid
-- ---------------------------------------------------------------------------
DROP POLICY "public_published_event" ON public.events;

CREATE POLICY "public_published_event" ON public.events
  FOR SELECT
  USING (status = 'published' AND payment_status = 'paid');

-- ---------------------------------------------------------------------------
-- Actualizar política pública de venues: hereda la misma restricción
-- ---------------------------------------------------------------------------
DROP POLICY "public_venues" ON public.venues;

CREATE POLICY "public_venues" ON public.venues
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = venues.event_id
        AND status = 'published'
        AND payment_status = 'paid'
    )
  );

-- ---------------------------------------------------------------------------
-- Actualizar política pública de rsvps (INSERT): misma restricción
-- ---------------------------------------------------------------------------
DROP POLICY "public_insert_rsvp" ON public.rsvps;

CREATE POLICY "public_insert_rsvp" ON public.rsvps
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = rsvps.event_id
        AND status = 'published'
        AND payment_status = 'paid'
    )
  );
