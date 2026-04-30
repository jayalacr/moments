-- =============================================================================
-- Migration: init
-- Sprint 1 — Plan Essential
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- Extiende auth.users. Se crea automáticamente via trigger al invitar usuario.
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  full_name  text,
  role       text NOT NULL DEFAULT 'organizador'
               CHECK (role IN ('superadmin', 'organizador')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Superadmin ve todos los perfiles; cada usuario ve solo el suyo.
CREATE POLICY "superadmin_all_profiles" ON public.profiles
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );

CREATE POLICY "own_profile" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Trigger: crear perfil automáticamente cuando Supabase Auth crea un usuario.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'organizador')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
CREATE TABLE public.events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  event_type   text NOT NULL
                 CHECK (event_type IN ('boda', 'xv', 'bautizo', 'graduacion')),
  plan         text NOT NULL DEFAULT 'essential'
                 CHECK (plan IN ('essential', 'plus', 'deluxe')),
  status       text NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'setup', 'published', 'paused', 'finished')),
  owner_id     uuid NOT NULL REFERENCES public.profiles(id),
  config       jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Superadmin ve y gestiona todos los eventos.
CREATE POLICY "superadmin_all_events" ON public.events
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );

-- Organizador solo ve y edita sus propios eventos.
CREATE POLICY "owner_select_event" ON public.events
  FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "owner_update_event" ON public.events
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Invitados públicos solo ven eventos publicados (sin autenticación).
CREATE POLICY "public_published_event" ON public.events
  FOR SELECT
  USING (status = 'published');

-- Trigger: actualizar updated_at automáticamente.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- venues (usado en Sprint 2 — Plus con mapas; se crea ahora para no migrar después)
-- ---------------------------------------------------------------------------
CREATE TABLE public.venues (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name       text NOT NULL,
  place      text NOT NULL,
  time       text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0,
  map_url    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin_all_venues" ON public.venues
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );

CREATE POLICY "owner_venues" ON public.venues
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = venues.event_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "public_venues" ON public.venues
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = venues.event_id AND status = 'published'
    )
  );

-- ---------------------------------------------------------------------------
-- guests (usado en Sprint 2 — Plus/Deluxe)
-- ---------------------------------------------------------------------------
CREATE TABLE public.guests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name       text NOT NULL,
  token      text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  max_seats  int  NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin_all_guests" ON public.guests
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );

CREATE POLICY "owner_guests" ON public.guests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = guests.event_id AND owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- rsvps (usado en Sprint 2 — Plus/Deluxe)
-- ---------------------------------------------------------------------------
CREATE TABLE public.rsvps (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id   uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  name       text NOT NULL,
  seats      int  NOT NULL DEFAULT 1,
  dietary    text,
  status     text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('confirmed', 'declined', 'pending')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin_all_rsvps" ON public.rsvps
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );

CREATE POLICY "owner_rsvps" ON public.rsvps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = rsvps.event_id AND owner_id = auth.uid()
    )
  );

-- Invitado puede insertar su propio RSVP (sin autenticación).
CREATE POLICY "public_insert_rsvp" ON public.rsvps
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = rsvps.event_id AND status = 'published'
    )
  );
