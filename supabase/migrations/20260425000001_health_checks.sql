-- Tabla liviana para keep-alive de Supabase (evitar pausa por inactividad)
CREATE TABLE IF NOT EXISTS public.health_checks (
  id int PRIMARY KEY DEFAULT 1,
  pinged_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.health_checks (id, pinged_at) VALUES (1, now());

ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
