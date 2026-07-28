-- Fecha límite de confirmación (RSVP). Pasada esta fecha, invitados sin
-- respuesta previa ya no pueden acceder a la invitación; quienes ya
-- respondieron conservan acceso normal para actualizar su RSVP.
ALTER TABLE events ADD COLUMN IF NOT EXISTS rsvp_deadline DATE;
