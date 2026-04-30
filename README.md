# Moments ✦ Invitaciones Digitales Premium

Moments es una plataforma diseñada para crear y gestionar invitaciones digitales de alto nivel para eventos sociales exclusivos (Bodas, XV Años, Bautizos). 

## Características Principales

- **Tres Tiers de Servicio**: 
  - **Essential**: Elegancia simplificada con confirmación vía WhatsApp.
  - **Plus**: Experiencia interactiva con cuenta regresiva, itinerarios animados y dashboard de gestión.
  - **Deluxe**: Inmersión total con música, fuentes exclusivas, loaders personalizados y RSVP inteligente.
- **RSVP Inteligente**: Control de acompañantes, restricciones dietéticas y links únicos para invitados.
- **Panel de Administración**: Gestión completa de eventos, invitados y confirmaciones para organizadores.
- **Diseño Responsive**: Optimizado para dispositivos móviles, donde ocurre la mayoría de la interacción.

## Stack Tecnológico

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **UI Components**: shadcn/ui.
- **Backend & DB**: Supabase (PostgreSQL, Auth, RLS).
- **Media**: Cloudinary.
- **Emails**: Resend + React Email.

## Desarrollo

### Requisitos Previos

- Node.js 20+
- Cuenta de Supabase
- Credenciales de Cloudinary y Resend

### Configuración Local

1. Clona el repositorio.
2. Instala las dependencias: `npm install`.
3. Configura las variables de entorno en `.env.local` (usa el ejemplo de abajo).
4. Inicia el servidor de desarrollo: `npm run dev`.

### Comandos Útiles

- `npm run dev`: Inicia el entorno de desarrollo.
- `npm run build`: Crea la versión de producción.
- `npm run lint`: Ejecuta el linter.
- `npm run test`: Ejecuta las pruebas unitarias (Vitest).

## Estructura del Proyecto

- `src/app`: Rutas de la aplicación (Público, Admin, Superadmin).
- `src/components`: Componentes UI y plantillas de invitaciones.
- `src/lib`: Servicios, utilidades y configuración de Supabase.
- `supabase/migrations`: Historial de cambios en la base de datos.

---
Hecho con amor en México 🇲🇽
