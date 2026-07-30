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

## Modelo de Precios y Negocio

### Costos Operativos Mensuales
- **Claude Code** (generación de plantillas con IA): $20 USD/mes
- **Cloudinary**: Plan gratuito
- **Vercel**: Plan gratuito (Pro a $20 USD/mes si se escala)
- **Supabase**: Plan gratuito (Pro a $25 USD/mes si se escala)
- **Resend**: Plan gratuito (100 emails/día)
- **Dominio**: ~$12 USD/año (~$1 USD/mes)
- **Total estimado**: $21 – $41 USD/mes

### Precios Base por Plan (incluye 2 meses de anticipación)
| Plan | Precio único (MXN) | ~USD |
|------|-------------------|------|
| **Essential** | $699 | ~$35 |
| **Plus** | $1,199 | ~$60 |
| **Deluxe** | $1,499 | ~$75 |

> Fuente de verdad: `src/lib/pricing.ts` (`BASE_PRICES`). Si cambian los precios, actualizar primero ahí y luego este documento.

### Modelo de Publicación (MODELO B — importante)

Los meses **NO** son vida útil después de la boda. Son **cuánto antes de la boda se puede publicar** la invitación. Una invitación deja de servir en cuanto pasa el evento.

- Todos los planes incluyen **2 meses de anticipación**: la invitación puede publicarse hasta 2 meses antes de la fecha del evento.
- Los meses adicionales permiten publicarla **aún más temprano**, no mantenerla viva más tiempo.
- `expires_at` = **fecha del evento + 2 días** (cubre la madrugada y la tornaboda). No depende de cuántos meses se compraron.

> **Encuadre de venta:** en México las invitaciones se mandan 3–6 meses antes. Una pareja con noviazgo largo que quiera publicar 5 meses antes necesita +3 meses. El copy debe decir **"publica con más anticipación"**, nunca "extensión" ni "más tiempo publicada".

### Meses Adicionales de Anticipación
El cliente elige **cuántos meses adicionales** quiere mediante un contador (+1). El precio es **por mes** y varía por plan, debido al consumo diferenciado de recursos (imágenes, consultas al dashboard, emails de reenvío, etc.):

| Concepto | Essential | Plus | Deluxe |
|----------|-----------|------|--------|
| Meses de anticipación incluidos | 2 | 2 | 2 |
| Precio por mes adicional | $99 | $149 | $199 |

No hay paquetes con descuento: cada mes adicional se cobra al mismo precio unitario. El total es `mesesExtra × precioPorMes[plan]`.

> Fuente de verdad: `src/lib/pricing.ts` (`INCLUDED_MONTHS`, `EXTRA_MONTH_PRICE_BY_PLAN`). El cotizador público (`/cotizar`) y el panel de superadmin deben consumir **la misma** función `calcularTotal()`.

### Dominio Personalizado (Add-on)
- **Subdominio de Moments** (ej. `juan-y-maria.moments.mx`): Gratis en Plus y Deluxe, no disponible en Essential.
- **Dominio propio del cliente**:
  - Configuración técnica (DNS + SSL en Vercel): $499 MXN (pago único).
  - Dominio incluido (Moments lo compra por el cliente vía Cloudflare Registrar): $299 MXN/año.
  - Solo configuración (el cliente ya tiene su dominio): $499 MXN (pago único).

### Lógica de Expiración de Invitaciones
1. **`expires_at` = fecha del evento + 2 días** (`POST_EVENT_GRACE_DAYS` en `src/lib/eventDate.ts`). Los 2 días cubren la madrugada posterior a la boda y la tornaboda — la invitación NO debe morir a medianoche del día del evento, porque es cuando más se consulta para ver dirección y horario.
2. **Al expirar**: La invitación muestra una pantalla amable: *"Esta invitación ya no está disponible. ¿Quieres crear la tuya?"* (funciona como publicidad orgánica).
3. **`PURGE_GRACE_DAYS = 30`** después de `expires_at`: los datos se conservan en DB por si hay reactivación, y después el evento ya se puede purgar de DB + Cloudinary. El dashboard de `/superadmin` distingue "vigente" / "inactiva (día X/30)" / "lista para depurar".
4. **Correo de aviso** (`/api/check-expirations`, cron diario 9am): se dispara 7 días antes de `expires_at` y va **al superadmin**, nunca al organizador. Bajo el modelo B equivale a "la boda es en 7 días".

### Campos de Ciclo de Vida en DB
- `events.published_at` (TIMESTAMPTZ): Fecha en que se publica la invitación. **Existe pero aún no se escribe** — bajo el modelo B es el dato que sustenta lo que se vendió, conviene registrarlo al publicar.
- `events.expires_at` (TIMESTAMPTZ): Fecha del evento + 2 días. No depende del plan ni de las extensiones.
- `events.extension_months` (INTEGER): Meses adicionales de anticipación comprados.
- `events.custom_domain` (TEXT, nullable): Dominio personalizado asociado al evento.
- `events.is_expired` (BOOLEAN, computed o trigger): Estado derivado para consultas rápidas.

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