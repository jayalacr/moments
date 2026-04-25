-- ---------------------------------------------------------------------------
-- Tabla pivote para soporte de múltiples organizadores por evento.
-- owner_id en events se conserva como referencia al dueño principal.
-- ---------------------------------------------------------------------------

-- 1. Crear la tabla PRIMERO (la función sql valida su cuerpo al crearse,
--    por lo que la tabla debe existir antes que la función).
CREATE TABLE public.event_organizers (
  event_id   uuid NOT NULL REFERENCES public.events(id)   ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'collaborator'
               CHECK (role IN ('owner', 'collaborator')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, profile_id)
);

CREATE INDEX event_organizers_profile_idx ON public.event_organizers(profile_id);

ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;

-- Superadmin gestiona todo
CREATE POLICY "superadmin_all_event_organizers" ON public.event_organizers
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- Cada organizador puede ver sus propias membresías
CREATE POLICY "organizer_select_own" ON public.event_organizers
  FOR SELECT
  USING (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. Función SECURITY DEFINER (ahora la tabla ya existe)
-- Evita recursión en RLS: las políticas de events/venues/guests/rsvps
-- llaman a esta función, que consulta event_organizers sin pasar por RLS.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_event_organizer(p_event_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_organizers
    WHERE event_id = p_event_id
      AND profile_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Migrar owner_id existentes al nuevo sistema
-- ---------------------------------------------------------------------------
INSERT INTO public.event_organizers (event_id, profile_id, role)
SELECT id, owner_id, 'owner'
FROM public.events
ON CONFLICT (event_id, profile_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Actualizar políticas RLS en events
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "owner_select_event" ON public.events;
DROP POLICY IF EXISTS "owner_update_event" ON public.events;

CREATE POLICY "organizer_select_event" ON public.events
  FOR SELECT
  USING (public.is_event_organizer(id));

CREATE POLICY "organizer_update_event" ON public.events
  FOR UPDATE
  USING (public.is_event_organizer(id));

-- ---------------------------------------------------------------------------
-- 5. Actualizar políticas RLS en venues
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "owner_venues" ON public.venues;

CREATE POLICY "organizer_venues" ON public.venues
  FOR ALL
  USING (public.is_event_organizer(event_id));

-- ---------------------------------------------------------------------------
-- 6. Actualizar políticas RLS en guests
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "owner_guests" ON public.guests;

CREATE POLICY "organizer_guests" ON public.guests
  FOR ALL
  USING (public.is_event_organizer(event_id));

-- ---------------------------------------------------------------------------
-- 7. Actualizar políticas RLS en rsvps
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "owner_rsvps" ON public.rsvps;

CREATE POLICY "organizer_rsvps" ON public.rsvps
  FOR SELECT
  USING (public.is_event_organizer(event_id));
