# Estado actual de Moments — corte v1

**Fecha:** 11 de agosto de 2026
**Producción:** `www.moments-mx.com` (Vercel) · 102 commits · ~27,000 líneas en `src/`

Este documento es una foto de lo que existe hoy, lo que está roto o a medias, y qué conviene hacer después. No es un plan comprometido: es un inventario para decidir.

---

## 1. Lo que ya está construido y funciona

### Invitaciones públicas
- **4 plantillas** registradas en `src/lib/templates.ts`: Classic, Elegance, Costa, Jardín (+2 alias legacy ocultos).
- **Arquitectura plantilla-agnóstica**: el plan (`essential`/`plus`/`deluxe`) es una prop, no está acoplado al diseño. Cualquier plantilla sirve para cualquier plan — `src/lib/plans.ts` decide qué se enciende.
- Render dinámico desde Supabase: fotos, itinerario, dress code, regalos, tema (tipografía + colores).
- ISR + revalidación bajo demanda al editar (`/api/revalidate`).
- Open Graph con transformaciones de Cloudinary (preview correcto en WhatsApp).
- Música de fondo con proxy para links de Google Drive (`/api/audio-proxy`).
- Pantalla de expiración con CTA de captación.

### RSVP
- Essential: botón directo a WhatsApp con mensaje prellenado.
- Plus y Deluxe: **link único por invitado** (`?id=<token>`). El servidor resuelve nombre, acompañantes y cupo antes de renderizar; sin token la invitación muestra "Esta invitación es personal" (`[type]/[slug]/page.tsx:204`). Confirmación con acompañantes y restricciones dietéticas por persona.
- `/api/rsvp` con validación de rango de asientos contra `max_companions` del invitado.
- Diferencia real Plus vs Deluxe en el RSVP: ambos usan link único, pero **cambia quién captura a los acompañantes**. En Plus el invitado los teclea él mismo con un stepper topado en `max_companions`; en Deluxe el organizador los precarga (`companion_names`) y el invitado solo desmarca a quien no asiste. De ahí se deriva el dashboard: global en Plus, individual por persona en Deluxe (`rsvpStats.ts` solo desglosa acompañantes `if (isDeluxe)`).

### Paneles
- **Superadmin**: crear/editar/publicar/pausar eventos, cambiar plan y plantilla, pricing con extensiones y pagos parciales, invitar organizadores (`inviteUserByEmail`), subdominios.
- **Organizador**: multi-evento, formulario completo de configuración, editor de layout de fotos, preview desktop/móvil.
- **Wedding planner**: rol acotado a la lista de invitados de su evento.
- Invitados: CRUD, import CSV, export, token único autogenerado.

### Negocio y marketing
- Landing, `/planes`, `/plantillas` con video previews en hover, `/cotizar` con el mismo `calcularTotal()` que usa superadmin.
- Legales: aviso de privacidad y términos con datos reales.
- Manual de usuario en `/manual`.
- Vercel Analytics activo.

### Infraestructura
- 15 migraciones versionadas, RLS con 24 políticas.
- Cron diario de keep-alive contra Supabase (evita pausa del plan free), protegido con `CRON_SECRET`.
- React Compiler activo, TypeScript strict.

---

## 2. Huecos reales (lo que hay que ver antes que nada)

### 🟠 El aviso de expiración no existe
`CLAUDE.md` describe un cron `/api/check-expirations` a las 9am que avisa 7 días antes. La columna `expiration_notified_at` está migrada, pero **la ruta no existe y el cron no está en `vercel.json`** (solo está keep-alive). Hoy nada avisa que una boda está por ocurrir ni que un evento entró en periodo de purga.

### 🟠 Resend está instalado pero no envía nada
`src/lib/resend.ts` son 5 líneas que exportan el cliente, y **nadie lo importa**. Los correos de invitación los manda Supabase Auth. O se usa (recordatorios, reenvío de links únicos, aviso de expiración) o se borra la dependencia y se corrige la documentación, que hoy promete "email de bienvenida con Resend".

### 🟡 `/api/rsvp` sin rate limit
Con un token válido cualquiera puede sobrescribir la confirmación de ese invitado tantas veces como quiera. El daño posible es bajo (es un token secreto por invitado), pero es la única ruta pública que escribe en la base.

### 🟡 Una sola prueba en todo el repo
`src/lib/utils.test.ts`. Vitest ya está configurado. Lo que más duele si se rompe en silencio no es la UI, es la lógica de dinero y fechas: `pricing.ts` (`calcularTotal`), `eventDate.ts` (`expires_at` con gracia), `rsvpStats.ts` (los conteos que ve el cliente). Tres archivos de prueba cubren el 90% del riesgo real.

---

## 3. Deuda que no urge pero pesa

| Qué | Dónde | Costo de dejarlo |
|-----|-------|------------------|
| `ClassicTemplate.tsx` de **3,069 líneas** | `src/components/templates/classic/` | Cada ajuste es arqueología. Extraer las secciones compartidas a `templates/shared/` — que ya existe — cuando toque la siguiente plantilla. |
| **3 copias** de `InvitadosClient` (1535 + 958 + 951 = 3,444 líneas) | `admin/invitados/`, `admin/eventos/[id]/invitados/`, `superadmin/eventos/[id]/invitados/` | Un bug de invitados hay que arreglarlo tres veces. Es el refactor con mejor retorno del repo. |
| `EditarForm.tsx` de 1,528 líneas con estilos inline | `admin/editar/_components/` | Al menos aquí superadmin **sí** reutiliza el componente. Es feo, no está duplicado. |
| `config: any` en el tipo de plantilla | `src/lib/templates.ts` | TypeScript no valida nada de lo que entra a una invitación. Un `config` mal formado revienta en producción, no en build. |
| Alias legacy `deluxe-classic` / `classic-elegance` | `src/lib/templates.ts` | Ya tienen su comentario `ponytail:` con el UPDATE para borrarlos. Un `UPDATE events` y fuera. |
| Dos fuentes de verdad para la misma distinción de plan | `plans.ts` vs `isPlus` en las 4 plantillas | `plans.ts` expone `caps.rsvpMode` precisamente para esto, pero las plantillas lo ignoran y ramifican con `planProp === 'plus'` (`CostaTemplate.tsx:442`, `ClassicTemplate.tsx:1827`, `EleganceTemplate.tsx:511`, `JardinTemplate.tsx:486`). Funciona, pero un plan nuevo obliga a editar las 4 plantillas en vez de una tabla. Mover la diferencia a una capability (`companionEntry: 'manual' \| 'preloaded'`) cuando toque la siguiente plantilla. |

---

## 4. Qué implementar después — ordenado por retorno

### Antes de vender el siguiente evento
1. **Cron de expiración** — ruta + entrada en `vercel.json`. Sin esto, olvidar una boda es cuestión de tiempo.
2. **Tests de `pricing`, `eventDate` y `rsvpStats`.** Un archivo cada uno.

### Producto — lo que probablemente pida el cliente
4. **Recordatorio automático a quien no ha confirmado.** Es la petición número uno en cualquier plataforma de RSVP, y Resend ya está instalado esperando. Con la lista de invitados y el token, es un cron + una plantilla de correo.
5. **Reenvío de link único desde el panel** (está prometido en Deluxe; verificar si el botón existe y funciona).
6. **Mesa de regalos / sobre digital con link de pago.** Alto valor percibido, cero infraestructura: es un campo más en `config` y un bloque en la plantilla.
7. **Más plantillas.** Es lo que diferencia el producto y lo que menos código nuevo requiere ahora que la arquitectura es plantilla-agnóstica. Cuidado con el techo del punto 3: la quinta plantilla debe forzar la extracción de `shared/`.

### Operación
8. **Registrar métricas de la invitación** (vistas, clics en mapa, aperturas). Vercel Analytics da el agregado, pero un organizador quiere ver *su* evento. Una tabla simple y un contador bastan.
9. **Autoservicio de alta de eventos.** Hoy todo evento nace a mano en superadmin. Automatizarlo solo tiene sentido cuando el volumen duela — antes de eso, el alta manual es un punto de contacto con el cliente, no un problema.

### Lo que conviene NO hacer todavía
- Multi-idioma, app móvil, editor drag-and-drop de plantillas, marketplace de diseñadores. Todo eso es infraestructura para un volumen que aún no existe.
- Migrar de plan gratuito en Supabase/Vercel. El keep-alive ya cubre la única molestia real del tier free.

---

## 5. Documentación que quedó desactualizada

Tres archivos afirman cosas que el código no hace. Vale la pena corregirlos en el mismo commit que resuelva cada hueco:

- `CLAUDE.md` → describe el cron `/api/check-expirations` como si existiera.
- `CLAUDE.md` → dice que Plus es "formulario en modal (entrada de nombre manual)". Lo manual son **los nombres de los acompañantes**, no el del titular: Plus también entra por link único con el titular ya resuelto. Basta precisar la frase para que no se lea como que Plus no usa token.
- `CHANGELOG.md` → dice que `/api/rsvp` tiene "dos modos: token-based y eventId-based". Solo tiene uno, y es el correcto.
- `README.md` → lista Resend + React Email como parte del stack activo. React Email ni siquiera está en `package.json`.
