-- Agrega el rol 'wedding-planner' al CHECK constraint de profiles.role
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('superadmin', 'organizador', 'wedding-planner'));

-- El wedding-planner accede a guests/rsvps igual que un organizador
-- (las políticas RLS existentes ya usan event_organizers para el acceso,
--  por lo que no se requieren nuevas políticas — solo asignarlo al evento via event_organizers)
