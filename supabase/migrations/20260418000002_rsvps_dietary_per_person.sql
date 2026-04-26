-- =============================================================================
-- Migration: rsvps — dietary_per_person
-- Agrega campo JSONB para guardar preferencias dietarias individuales
-- por cada asistente confirmado (titular + acompañantes).
-- Formato: { "María García": "Vegetariano", "Carlos García": "Sin gluten" }
-- El campo dietary original se preserva por compatibilidad.
-- =============================================================================

ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS dietary_per_person jsonb NOT NULL DEFAULT '{}';
