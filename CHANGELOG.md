# Changelog — Moments

Registro de cambios del proyecto. Actualizar con cada deploy a producción.

---

## [1.0.0] — 2026-04-25 — Deploy inicial a producción

Primer release de la plataforma. Incluye los tres planes funcionales, panel de administración, panel de superadmin y toda la infraestructura base.

### Plataforma e invitaciones

- Tres plantillas funcionales: Essential, Plus y Deluxe, cada una con su nivel de funcionalidad correspondiente según el plan.
- Renderizado de invitaciones con datos dinámicos desde Supabase (título, pareja, fecha, fotos, itinerario, dress code, regalos, etc.).
- ISR (Incremental Static Regeneration) en páginas públicas de invitación con revalidación cada 24 horas y revalidación bajo demanda al editar desde admin.
- Open Graph y Twitter Cards para preview al compartir invitaciones en WhatsApp y redes sociales.
- Sistema de expiración de invitaciones con pantalla amable al expirar y CTA hacia Moments.
- Música de fondo en plantilla Deluxe con player integrado.
- Cuenta regresiva en plantillas Plus y Deluxe.
- Carrusel de fotos en Plus (manual) y Deluxe (automático).
- Google Maps interactivo en Plus y Deluxe.
- Botón para agendar en Google Calendar en Deluxe.
- Loader animado personalizado en Deluxe.

### RSVP y confirmaciones

- Plan Essential: botón directo a WhatsApp con mensaje pre-escrito.
- Plan Plus: formulario en modal con entrada de nombre manual y número de acompañantes configurables.
- Plan Deluxe: modal personalizado mediante link único con datos precargados del invitado (token).
- Modo demo en formulario RSVP de Deluxe para previsualizaciones.
- API `/api/rsvp` con dos modos: token-based (Deluxe) y eventId-based (Plus).

### Gestión de invitados

- Dashboard de confirmaciones con conteo de asistentes (confirmados / pendientes / declinaron) en Plus y Deluxe.
- Control de cupo máximo global en Plus.
- Estado individual por invitado con cupo asignado por persona en Deluxe.
- Importación masiva de invitados por CSV.
- Exportación de invitados a Excel.
- CRUD completo de invitados con token único auto-generado.

### Panel de administración (organizadores)

- Soporte multi-eventos: un organizador puede gestionar varios eventos.
- Formulario de edición completo para toda la configuración del evento (fotos, itinerario, dress code, colores, tipografía, etc.).
- Vista previa de invitación en modo desktop y móvil desde el admin.
- Sidebar responsive con off-canvas en móvil.

### Panel de superadmin

- Gestión completa de eventos: crear, editar, publicar, pausar, cambiar plan y template.
- Sistema de pricing con costos, extensiones de tiempo y pagos parciales.
- Gestión de organizadores: invitar por email, asignar roles (owner/collaborator).
- Vista de detalle por evento con métricas y accesos rápidos.
- Diseño responsive optimizado para móvil.

### Imágenes y media

- Integración con Cloudinary: subida, transformaciones responsive (hero, full, thumbnail, duo), formato automático WebP/AVIF.
- Compresión inteligente de imágenes antes de subir.
- Layout flexible de fotos por plan con límites configurables.
- Marca de agua "PREVIEW" en eventos no pagados.
- Componente AudioUpload con subida a Cloudinary y conversión desde Google Drive.
- Audio proxy para archivos de Google Drive.

### Autenticación y seguridad

- Login con Supabase Auth (email + password).
- Roles: superadmin y organizador, con acceso diferenciado.
- Row Level Security (RLS) en todas las tablas: events, guests, rsvps, venues, profiles, event_organizers.
- Tokens de invitado con 128 bits de entropía (gen_random_bytes).
- Sistema de invitación a organizadores con email y setup de contraseña.
- Recuperación de contraseña.

### Emails

- Email de bienvenida para nuevos organizadores vía Resend.
- Email de aviso de expiración 7 días antes (cron diario).
- Remitente configurable por variable de entorno.

### Infraestructura

- Next.js 16 con App Router y React 19.
- Supabase como backend (PostgreSQL, Auth, RLS).
- Cloudinary para imágenes con CDN.
- Resend para correos transaccionales.
- Deploy en Vercel con preview deployments automáticos.
- Cron jobs configurados: keep-alive (mantener Supabase activo) y check-expirations (notificar eventos por expirar).
- Endpoint de revalidación ISR bajo demanda protegido con secret.
- 10 migraciones SQL versionadas.
- Configuración de Vitest y testing-library.

### Base de datos (migraciones incluidas)

- `20260406000001_init.sql` — Esquema inicial: events, profiles, venues, guests, rsvps con RLS.
- `20260412000001_guests_max_companions.sql` — Campo max_companions en guests.
- `20260418000001_guests_phone.sql` — Campo phone en guests.
- `20260418000002_rsvps_dietary_per_person.sql` — Preferencias alimentarias por persona en RSVPs.
- `20260421000001_event_pricing.sql` — Campos de pricing en events.
- `20260422000001_event_payment_status.sql` — Estado de pago en events.
- `20260422000002_event_expiration_notified.sql` — Flag de notificación de expiración.
- `20260423000001_payment_partial_and_notes.sql` — Pagos parciales y notas.
- `20260423000002_event_organizers.sql` — Tabla event_organizers con RLS y función is_event_organizer.
- `20260425000001_health_checks.sql` — Tabla de keep-alive para Supabase.

---

## Plantilla para futuros releases

<!--
Copiar este bloque para cada nuevo deploy:

## [X.X.X] — YYYY-MM-DD — Título descriptivo del release

Resumen breve de qué incluye este deploy.

### Nuevas funcionalidades
- Descripción del feature

### Correcciones
- Descripción del fix

### Cambios internos
- Refactors, migraciones, dependencias

### Migraciones de base de datos
- `YYYYMMDD_nombre.sql` — Descripción
-->
