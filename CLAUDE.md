# Contexto del Proyecto: Moments

## Resumen
Moments es una plataforma premium de invitaciones digitales y gestión de confirmaciones (RSVP) diseñada para eventos sociales como bodas, XV años, bautizos y graduaciones.

## Stack Tecnológico
- **Framework**: Next.js 16 (App Router) / React 19
- **Backend/Base de Datos**: Supabase (PostgreSQL, Auth, RLS)
- **Estilos**: Tailwind CSS 4, shadcn/ui
- **Media**: Cloudinary
- **Correos**: Resend y React Email
- **Parsing**: Papaparse (para datos CSV)

## Estructura de Carpetas Principal
- `src/app/`: Páginas de Next.js y rutas de API.
  - `[type]/[slug]/`: Rutas públicas para ver eventos específicos.
  - `admin/`: Portal para organizadores.
  - `superadmin/`: Portal de gestión de la plataforma.
  - `plantillas/`: Previsualizaciones de los tiers (Essential, Plus, Deluxe).
- `src/components/`: Componentes React reutilizables.
  - `ui/`: Componentes base de shadcn.
  - `templates/`: Componentes de plantillas divididos por tiers.
  - `auth/`: UI de autenticación.
- `src/lib/`: Lógica y servicios externos.
  - `supabase/`: Clientes de DB y lógica de RLS.
  - `cloudinary.ts`: Gestión de imágenes.
  - `resend.ts`: Servicios de envío de correos.
  - `templates.ts`: Lógica de configuración de plantillas.
- `supabase/`: Orquestación del backend.
  - `migrations/`: Esquema de base de datos versionado.

## Esquema de Base de Datos y RBAC
El sistema utiliza un modelo estricto de **Row Level Security (RLS)**:
- `profiles`: Datos extendidos de usuario con roles (`superadmin`, `organizador`).
- `events`: Registros centrales del evento. Utiliza un campo `config` (JSONB) para personalización flexible.
- `venues`: Itinerarios y ubicaciones de los eventos.
- `guests`: Lista de invitados con un `token` único para rastreo de invitaciones.
- `rsvps`: Datos de confirmación vinculados a los invitados.

## Flujos de Trabajo de Desarrollo
- **Ejecución local**: `npm run dev`
- **Actualizaciones de DB**: Gestionadas mediante migraciones SQL en `supabase/migrations`.
- **Creación de Plantillas**: Las nuevas plantillas deben añadirse a `src/components/templates` y registrarse en `src/lib/templates.ts`.

## Tiers de Funcionalidad (Planes)
El sistema se divide en tres niveles estéticos y funcionales:

### 1. Essential (Sencillo y Elegante)
- **Presentación**: Datos básicos (frase, cita, nombres). Sin música ni cuenta regresiva.
- **Fotos**: 1 foto principal (hasta 5 imágenes en total).
- **Logística**: Itinerario estático y Dress Code. Sin mapas interactivos.
- **Confirmación**: Botón directo a WhatsApp con mensaje pre-escrito.
- **Gestión**: Sin Dashboard de control.

### 2. Plus (Experiencia Completa) - *Más Popular*
- **Presentación**: Incluye Cuenta Regresiva.
- **Fotos**: Carrusel de fotos manual (5 a 10 imágenes).
- **Logística**: Itinerario animado, Google Maps interactivo y sección de recomendaciones (Boda Destino).
- **Confirmación**: Formulario en modal (entrada de nombre manual) con número de acompañantes configurados por organizador.
- **Gestión**: Dashboard con conteo general (Confirmados / Pendientes / Declinaron) y control de cupo máximo global.

### 3. Deluxe (Premium e Inmersivo)
- **Presentación**: Loader animado personalizado, Música de fondo y Cuenta Regresiva.
- **Fotos**: Carrusel automático distribuido a lo largo de la invitación.
- **Logística**: Todo lo del plan Plus + botón para agendar en Google Calendar.
- **Confirmación**: Modal personalizado mediante Link Único con datos precargados del invitado.
- **Gestión**: Dashboard completo con estado individual por invitado, cupo asignado por persona y herramienta de reenvío de links únicos.

Para que sea mas clara la diferencia entre planes te puedes guíar por el archivo llamado: comparativo_planes_boda.html

## Patrones y Guías
- **Component-First**: Utilizar componentes de shadcn/ui siempre que sea posible.
- **Seguridad**: Verificar siempre las políticas RLS al añadir nuevas tablas.
- **Estética Visual**: Priorizar tipografía de alta calidad (Cormorant Garamond / DM Sans), animaciones (`tw-animate-css`) y patrones modernos de UI.
## Guías de Desarrollo (Skills)
El proyecto cuenta con un catálogo de "skills" técnicas en `.claude/skills/` que definen patrones específicos de automatización. Consulta estos archivos antes de realizar tareas complejas:
- [Template Factory](file:///Users/juanayala/Documents/github/code4u/moments/.claude/skills/template-factory.md): Para la creación de nuevas plantillas premium.
- [Guest Data Manager](file:///Users/juanayala/Documents/github/code4u/moments/.claude/skills/guest-data-manager.md): Para la importación y gestión de invitados.
- [RSVP Transactional](file:///Users/juanayala/Documents/github/code4u/moments/.claude/skills/rsvp-transactional.md): Para implementar flujos de confirmación reales.
- (Próximamente) Security Audit: Para auditoría de políticas RLS.
- (Próximamente) Email Architect: Para flujos de RSVP y correos.


## Agentes
El proyecto cuenta con el agente grill-me, utilizalo solo cuando te mencione que es un cambio grande o que aún no te quede claro lo que debes de implementar.