# Moments — Plataforma de invitaciones digitales

## Stack
Next.js 16 App Router · TypeScript · Tailwind · shadcn/ui · Supabase · Resend · Vercel

## Roles
- **Superadmin** (`/superadmin`) — yo, cuenta creada manualmente en Supabase
- **Organizador** (`/admin`) — creado por superadmin vía `inviteUserByEmail()`
- **Invitado** (`/[type]/[slug]`) — público, sin login

No hay registro público. Solo el superadmin crea usuarios.

## Tipos de evento
`boda` `xv` `bautizo` `graduacion`

## Planes

### Essential
- Foto principal a ancho completo + hasta 5 imágenes en total distribuidas
- Apartado inicial: frase o cita bíblica, nombres de novios y padres
- Itinerario estático con hora, nombre y lugar por evento
- Dress code con paleta de colores (círculos de color)
- Regalos: ícono de sobre con datos de transferencia + link a mesa de regalos
- Confirmación: botón que redirige a WhatsApp con mensaje pre-escrito
- Sin dashboard — el organizador gestiona confirmaciones manualmente

### Plus
Todo lo de Essential más:
- Countdown en tiempo real (días, horas, minutos, segundos)
- Carrusel de fotos (5 a 10 imágenes)
- Itinerario animado tipo línea de tiempo con miniatura de mapa por venue
- Sección boda destino: tarjetas de hotel, transporte y contacto
- Confirmación: modal dentro de la invitación con campo de nombre,
  contador de acompañantes con límite máximo definido por el organizador
  (no puede excederse), menú de restricción alimentaria
- Dashboard básico: conteo general de confirmados / pendientes / declinaron
- Email al organizador en tiempo real cuando alguien confirma

### Deluxe
Todo lo de Plus más:
- Loader animado de entrada con monograma de iniciales
- Reproductor de música flotante (píldora fija, play/pausa)
- Fotos distribuidas a lo largo de toda la invitación en distintos layouts
- Itinerario animado con animación lateral al hacer scroll +
  línea vertical que crece progresivamente
- Confirmación: link único por invitado (`?id=token`), modal con nombre
  y cupo pre-cargados — el invitado solo confirma sin escribir nada
- Dashboard completo: estado individual por invitado
  (confirmado / pendiente / declinó) + reenvío de link único
- Botón "Agendar en Google Calendar"
- Soporte para dominio personalizado (ej. sofiaymateo.com)
- Alerta por email al superadmin cuando el evento lleva 7 días expirado

## Confirmación de asistencia por plan
| Plan | Tipo | Control de cupo | Dashboard |
|------|------|----------------|-----------|
| Essential | Botón WhatsApp | Sin control | Sin dashboard |
| Plus | Modal en invitación | Límite global definido por organizador | Conteo general |
| Deluxe | Modal personalizado con token único | Cupo individual por invitado | Estado por invitado |

## Base de datos
Tablas: `events` `users` `guests` `rsvps` `venues` `templates`

Campos clave en `events`: `slug`, `event_type`, `plan`, `status`
(draft→setup→published→paused→finished), `template_type`,
`template_url`, `custom_domain`, `config` (jsonb), `owner_id`

## Notificaciones (Resend)
- Email al organizador cuando alguien confirma RSVP (Plus y Deluxe)
- Email al superadmin cuando evento lleva 7 días expirado (desactiva manualmente)
- Email de bienvenida al organizador al crear su cuenta

## Sprint actual — Sprint 1: Plan Essential
Objetivo: flujo completo del plan Essential funcionando end-to-end.

**Incluye:**
- Invitación pública `/[type]/[slug]` con template Essential
- Panel superadmin: crear evento, asignar organizador, activar/desactivar
- Panel organizador: editar datos del evento, vista previa
- Auth flow completo: login, setup-password, protección de rutas
- Email de bienvenida al organizador

**No incluye en este sprint:**
Countdown, carrusel, maps, dashboard, modal RSVP, música,
loader, Google Calendar, dominio custom, planes Plus y Deluxe.

## Estado actual
- [x] Next.js 16 + TypeScript + Tailwind instalado
- [x] Supabase vinculado
- [x] Clientes Supabase creados (client.ts, server.ts)
- [x] Proxy protegiendo /admin y /superadmin
- [ ] Migraciones SQL
- [ ] Auth flow
- [ ] Panel superadmin
- [ ] Panel organizador
- [ ] Invitación pública Essential
- [ ] Emails con Resend