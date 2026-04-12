# Skill: RSVPTransactional (Moments)

Guía para implementar el flujo de confirmación de asistencia (RSVP) real conectado a la base de datos de Supabase.

## 1. Disparadores (Triggers)
Activar esta skill cuando el usuario pida:
- "Conecta el modal de RSVP a la base de datos"
- "Implementa el flujo real de confirmación"
- "Haz que el botón de confirmar guarde en la tabla rsvps"

## 2. Estándares Técnicos
- **API Endpoint**: `src/app/api/rsvp/route.ts`.
- **Validación de Token**: Toda petición DEBE incluir un `token` de invitado. Se debe validar contra la tabla `public.guests`.
- **Lógica de Asientos**: No permitir confirmar más personas (`seats`) que las definidas en `guests.max_seats`.
- **Tabla de Destino**: `public.rsvps`.

## 3. Receta de Implementación
1. **Crear API Route**: Un manejador `POST` que:
   - Reciba `token`, `name`, `seats`, `dietary` (opcional) y `status` ('confirmed'|'declined').
   - Busque el `guest_id` y `event_id` correspondientes al token en la tabla `guests`.
   - Inserte o actualice el registro en la tabla `rsvps`.
2. **Actualizar Layout (Frontend)**:
   - Asegurar que la página `[type]/[slug]/page.tsx` pase el `event_id` y obtenga el `id` (token) del query string (`?id=token`) para pasarlo al componente de la plantilla.
3. **Modificar Template (Deluxe/Plus)**:
   - Sustituir la lógica de "Mock RSVP" por una llamada `fetch` al endpoint `/api/rsvp`.
   - Manejar estados de `loading` (spinner) y `success` (mensaje de agradecimiento).
   - Recuerda que el plan plus solo se configura el número de acompañantes, pero en el modo deluxe se configura un invitado base y además sus acompañantes con nombre, por default en el formulario deben de estar marcados por default que todos asistirá, el invitado desmarca a quienes no vayan a asistr.

## 4. Restricciones (Guardrails)
- **RLS**: La API debe usar el cliente de Supabase con los permisos adecuados para no exponer datos de otros eventos.
- **Feedback**: El modal de RSVP debe cerrarse o transformarse en un mensaje de éxito tras la confirmación.
