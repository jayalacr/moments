# Checklist de lanzamiento — Moments

> Auditoría técnica y de marketing previa a producción.
> Fecha: 28 de julio de 2026 · Commit base: `b8aa0b0`

---

## Cómo usar este documento

Está dividido en dos partes que **no se pisan entre sí**:

- **[Parte A — Código](#parte-a--código)**: trabajo que se resuelve editando el repo. Este bloque es el que se le entrega a Claude Code.
- **[Parte B — Manual](#parte-b--manual)**: cuentas, compras, credenciales, contenido y SQL en el dashboard de Supabase. Solo Juan puede hacerlo.

Cada ítem de la Parte A trae **archivo, qué cambiar y criterio de aceptación**. Los ítems marcados con **⛔ depende de B‑n** no se pueden cerrar hasta que Juan complete el paso manual correspondiente.

Prioridades: **P0** = no lanzar sin esto · **P1** = semana 1 · **P2** = después del lanzamiento.

---

## Veredicto

**No salir a producción todavía.** El diseño y la arquitectura están bien resueltos, pero hoy publicarías un sitio donde la mayoría de los botones de compra no llevan a ningún lado, el cotizador público promete precios distintos a los de tu panel interno, y las invitaciones de tus clientes se indexarían en Google.

Casi todo son arreglos de una a tres líneas. **Estimado: 3 a 5 días.**

---

# PARTE A — Código

## A0 · Modelo de publicación: 2 meses incluidos + contador de meses extra `P0`

Cambio de negocio nuevo. Toca precios, copy, expiración y base de datos, así que **va primero**: varios ítems de abajo dependen de él.

### Reglas del modelo

| Concepto | Valor |
|----------|-------|
| Meses incluidos en todos los planes | **2** |
| Se cuentan a partir de | La fecha del evento |
| Meses adicionales | Contador libre (+1 / −1), elegido por el cliente |
| Precio por mes adicional | Essential **$99** · Plus **$149** · Deluxe **$199** |
| Paquetes con descuento | **Se eliminan.** Cada mes vale lo mismo |
| Precios base | **Sin cambio** — $699 / $1,199 / $1,499 |

Fórmula: `total = BASE_PRICES[plan] + (mesesExtra × EXTRA_MONTH_PRICE_BY_PLAN[plan]) + diseñoPersonalizado`

### A0.1 — Reescribir el modelo en `src/lib/pricing.ts`

- Eliminar `EXTRA_MONTH_PRICE` (constante plana de $99) y `EXTENSION_PRICES` (paquetes por key).
- Eliminar el tipo `ExtensionKey` y `EXTENSION_LABEL`.
- Agregar:
  ```ts
  export const INCLUDED_MONTHS = 2;
  export const EXTRA_MONTH_PRICE_BY_PLAN: Record<Plan, number> = {
    essential: 99, plus: 149, deluxe: 199,
  };
  ```
- Cambiar la firma de `QuoteInput`: `extensionKey: ExtensionKey` → `extensionMonths: number` (entero ≥ 0).
- En `calcularTotal()`: `extension = extensionMonths * EXTRA_MONTH_PRICE_BY_PLAN[plan]`.
- Actualizar el `detail` del line item base: `'Pago único · 2 meses de publicación incluidos'`.
- El line item de extensión solo aparece si `extensionMonths > 0`, con detalle tipo `'3 meses adicionales × $149'`.
- Limpiar el código comentado de dominios (`DOMAIN_PRICES`, `DOMAIN_LABEL`) que quedó muerto en el archivo.

**Aceptación:** `calcularTotal({ plan:'deluxe', designType:'template', extensionMonths:3 })` devuelve `total = 1499 + 597 = 2096`.

### A0.2 — Unificar el cotizador público con `calcularTotal()`

**Archivo:** `src/app/cotizar/page.tsx`

Hoy calcula por su cuenta (`línea 59`) con la constante plana de $99, mientras el panel de superadmin usa `calcularTotal()` con precios por plan. **Son dos motores de precio que dan resultados distintos para el mismo escenario.** Ejemplo: Deluxe + 3 meses extra → la web dice $297 de extensión, el panel dice $447.

- Borrar el cálculo local y consumir `calcularTotal()`.
- Conservar el stepper de meses (ya existe, `líneas 470-510`), pero que ahora represente meses adicionales sobre los 2 incluidos.
- El precio por mes mostrado debe cambiar al cambiar de plan.
- Reemplazar `WHATSAPP_NUMBER` hardcodeado (`línea 38`) por el helper de A1.

**Aceptación:** el total de `/cotizar` y el del panel de superadmin coinciden exactamente en los 3 planes con 0, 1, 3 y 6 meses extra.

### A0.3 — Cambiar el selector del panel de superadmin a contador

**Archivo:** `src/app/superadmin/eventos/[id]/_components/PricingEditor.tsx`

- Sustituir el `<select>` de extensión (`líneas 175-186`, opciones `none/1m/3m`) por un stepper numérico igual al público.
- Actualizar la llamada a `calcularTotal()` (`línea 86`) a `extensionMonths`.
- Actualizar `updateEventPricing` en `src/app/superadmin/_actions.ts:89` y su tipo `PricingPayload` para persistir el número de meses.

### A0.4 — `expires_at` ya no depende de esto — corregido, aclaración de modelo

**Archivo:** `src/lib/eventDate.ts`

Este ítem existía en la v1 del documento por una lectura incorrecta del modelo. Aclarado con Juan: **`expires_at` siempre es la fecha de la boda, punto** — no se le suma nada, y no depende de cuántos meses se compraron. Los meses incluidos/extra **no extienden la vida útil después de la boda**; una invitación deja de tener sentido en cuanto pasa el evento (ya no hay RSVP que confirmar).

- `computeExpiresAt(config)` → `fechaBoda` tal cual (ya corregido en el repo).
- `PURGE_GRACE_DAYS = 30` (también en `eventDate.ts`) es un concepto **separado**: días de gracia después de `expires_at` antes de que sea seguro purgar el evento de BD + Cloudinary. No se guarda en DB, se calcula al momento de revisar. El dashboard de `/superadmin` ya distingue "vigente" / "inactiva (día X/30)" / "lista para depurar".
- **No requiere nada de B4.** Ítem cerrado, sin acción de código pendiente.

### A0.4b — No aplica, cerrado

Los meses incluidos/extra determinan cuánto antes de la boda se puede publicar una
invitación. Se consideró validar esto en código (bloquear/advertir/cobrar automático
si se publica fuera de la ventana pagada), pero **no hace falta**: solo Juan
(superadmin) puede publicar un evento — los organizadores no tienen ese botón. Como
Juan ya conoce el precio al momento de publicar, no hay riesgo de que alguien se
salte la ventana pagada sin que él se dé cuenta. No construir esto salvo que cambie
quién puede publicar.

### A0.5 — Actualizar el copy de "1 mes" en todo el sitio

13 ubicaciones. Todas pasan a **2 meses**:

| Archivo | Líneas |
|---------|--------|
| `src/app/page.tsx` | 521 (FAQ), 715 (lede de planes), 728 (`plan__free`) |
| `src/app/planes/page.tsx` | 835, 886, 891, 896 (`price-note`) |
| `src/app/cotizar/page.tsx` | 71, 463, 511, 530 |
| `src/lib/pricing.ts` | 40, 109 |

Ojo con el matiz de marketing: hoy dice *"1 mes **gratis**"*. Con 2 meses conviene decir **"2 meses de publicación incluidos"** — "gratis" sugiere que lo normal es pagar aparte y abarata la percepción del plan.

**Aceptación:** `grep -rn "1 mes" src/` no devuelve nada relacionado con publicación.

---

## A1 · Centralizar el número de WhatsApp — cerrado

**Archivos:** `src/app/page.tsx:30` · `src/components/site/SiteFooter.tsx:7` · `src/app/cotizar/page.tsx:38` · `src/app/plantillas/page.tsx:226`

Hay tres comportamientos distintos conviviendo:

| Ubicación | Valor actual | ¿Funciona? |
|-----------|--------------|-----------|
| `/cotizar` | `528126390927` hardcodeado | Sí |
| Landing y footer | `process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5200000000'` | **No** — la variable no existe |
| `/plantillas` card "Próximo diseño" | `https://wa.me/` sin número | **No** |

En producción eso significa que el CTA del hero, los tres botones de plan, el de diseño a medida, el CTA final y el del footer **llevan todos a un número inventado**. Es la fuga de conversión más cara del proyecto y es invisible hasta que alguien intenta comprarte.

- Crear `src/lib/contact.ts` que exporte el número y un helper `waLink(mensaje?: string)`.
- Sin fallback a un número falso: si la variable no existe, que falle el build o que el botón no se renderice. Un número inventado es peor que un botón ausente.
- Reemplazar los 4 usos.

**Aceptación:** `grep -rn "wa.me" src/` solo aparece dentro de `contact.ts`.

---

## A2 · Evitar que las invitaciones se indexen — cerrado

**Archivo:** `src/app/[type]/[slug]/page.tsx`

Ninguna ruta del proyecto declara `noindex`. Las invitaciones publicadas contienen nombres completos, fechas, direcciones y a veces datos bancarios. Todo eso terminaría en resultados de búsqueda. No es un tema de SEO sino de privacidad con tus clientes, y una vez indexado cuesta mucho revertirlo.

- Agregar `robots: { index: false, follow: false }` al `generateMetadata` de la invitación.
- Crear `src/app/robots.ts` con `Disallow` para `/admin`, `/superadmin` y las rutas de invitación.
- Crear `src/app/sitemap.ts` **solo** con páginas de marketing: `/`, `/plantillas`, `/planes`, `/cotizar`.

---

## A3 · Unificar dominios — cerrado

Hay **cuatro dominios distintos** hardcodeados:

| Dominio | Ubicación |
|---------|-----------|
| `moments.events` | `src/app/[type]/[slug]/page.tsx:36` (fallback OG) |
| `moments.mx` | `src/app/[type]/[slug]/page.tsx:157` · `src/lib/cloudinary.ts:1` (watermark) |
| `moments-mx.com` | `src/proxy.ts:7` · `src/lib/invitation.ts:1` · 2 archivos de superadmin |
| `tudominio.com` | `.env.example` |

Los subdominios de cliente, los links de invitación y el watermark de las imágenes apuntan a dominios diferentes entre sí. Al menos tres de los cuatro están mal.

- Unificar todo bajo `NEXT_PUBLIC_ROOT_DOMAIN` y `NEXT_PUBLIC_BASE_URL`, sin fallbacks hardcodeados.
- Agregar `NEXT_PUBLIC_ROOT_DOMAIN` y `NEXT_PUBLIC_WHATSAPP_NUMBER` a `.env.example` (faltan las dos).
- Corregir el watermark de Cloudinary.

---

## A4 · Open Graph del sitio de marketing — código cerrado, ⛔ falta imagen de **B5**

**Archivo:** `src/app/layout.tsx:16-22`

Solo las invitaciones tienen `openGraph`. El layout raíz tiene únicamente `title` y `description`, y le falta `metadataBase`. Al compartir el dominio por WhatsApp o Instagram aparece sin imagen ni preview — crítico, porque WhatsApp **es** tu canal de distribución.

- Agregar `metadataBase`, `openGraph` y `twitter` al layout raíz.
- Verificar que `public/og-default.jpg` exista (hoy se referencia en `[slug]/page.tsx:36` pero **el archivo no está en `public/`** → imagen rota en toda invitación sin portada).

---

## A5 · Bug de título duplicado — cerrado

**Archivo:** `src/app/plantillas/page.tsx:12`

El layout define `template: "%s | Moments"` y la página usa `title: 'Plantillas · Moments'`. Resultado visible en Google: **"Plantillas · Moments | Moments"**.

- Cambiar a `title: 'Plantillas'`.

---

## A6 · Instalar analytics — cerrado

`@vercel/analytics` instalado y montado en el layout raíz. Los clics a WhatsApp en la
landing y el cotizador se registran como evento de conversión ("WhatsApp Click") en
Vercel Analytics, visible en el dashboard del proyecto.

**Decisión de Juan: sin Meta Pixel.** Se construyó y se revirtió a petición explícita —
no se quiere ese tracking. No reintentar esto sin que Juan lo pida de nuevo.

---

## A7 · Páginas legales — rutas creadas, ⛔ falta texto real de **B7**

- Crear `/aviso-de-privacidad` y `/terminos` con el texto que entregue Juan.
- Enlazarlas desde `SiteFooter.tsx`.

---

## A8 · Reemplazar los previews falsos de plantillas `P1` ⛔ depende de **B8**

**Archivo:** `src/app/plantillas/page.tsx:180-190`

Las tres cards renderizan el mismo bloque CSS genérico con "Sofía & Mateo". Classic, Elegance y Costa se ven prácticamente idénticas; el cliente no puede distinguirlas sin abrir cada demo, y la mayoría no lo hará.

**Es el cambio de mayor impacto por esfuerzo invertido de toda la lista.**

- Sustituir el mockup CSS por las capturas reales usando `next/image`.
- Mantener el marco de celular y el badge de nombre.

---

## A9 · Arreglar los demos de la página de planes — cerrado

**Archivo:** `src/app/planes/page.tsx:769, 848, 854, 861`

Los seis links de "Ver demo" apuntan **todos** a `/plantillas/deluxe`. El mensaje central de esa página es *"el plan no define tu diseño, cualquier colección funciona con cualquier plan"* — y luego demuestras exactamente lo contrario: desde ahí nunca puedes ver Elegance ni Costa.

- Agregar selector de plantilla o rotar los links entre las tres colecciones.

---

## A10 · Copy del hero — cerrado

**Archivo:** `src/app/page.tsx:592-602`

Dice *"moments / Invitaciones digitales / Una invitación tan única como tu boda."* Bonito, pero no informa precio, tiempo de entrega ni que incluye RSVP.

Detalle revelador: la clase `.hero__sub` está definida en el CSS (`línea 291`) **pero nunca se usa en el JSX** — es su única aparición en el archivo. Ya tienes el espacio de copy diseñado y vacío.

- Agregar el subtítulo. Propuesta: *"Con confirmación de asistencia y panel de control. Desde $699 MXN, lista en 5 días."*

---

## A11 · Captura de leads — no por ahora (decisión de Juan)

Todo termina en un link externo de WhatsApp. Si alguien navega en desktop sin WhatsApp Web, se pierde completo — y nunca construyes una lista. `/cotizar` es una calculadora bien hecha que no guarda absolutamente nada.

La infraestructura ya está: Supabase y Resend ya están integrados.

- Server action que inserte en la tabla `leads` (creada en **B4**).
- Formulario en `/cotizar` junto al botón de WhatsApp: nombre, fecha de boda, WhatsApp, plan de interés.
- Notificación por Resend usando el patrón de `src/lib/resend.ts`.
- Guardar el desglose de la cotización junto al lead.

---

## A12 · Destacar el plan correcto — cerrado (corregido en page.tsx y también en planes/page.tsx, que tenía el mismo bug sin documentar)

**Archivo:** `src/app/page.tsx:576`

`featured: true` está en **Deluxe**, pero `CLAUDE.md` define Plus como "Más popular". Además, marcar el más caro como "más popular" resta credibilidad: el anclaje que funciona es destacar el de en medio.

- Mover `featured: true` a Plus (cambiar `featured: false` de la `línea 559`) y poner `featured: false` en Deluxe.

---

## A13 · Pendientes menores `P2`

- [x] **FAQ con objeciones reales de compra** — 5 preguntas nuevas agregadas (preview antes de pagar, corrección post-publicación, invitados mayores, pago/factura sin inventar método).
- [ ] **Precio de referencia en "Diseño desde cero"** (`page.tsx:701`) ⛔ depende de **B9**
- [x] **Link de navegación mal apuntado** — corregido, `/#como` en vez de `/#que-es`.
- [x] **Dos rutas de conversión compitiendo** — resuelto: `/cotizar` es la ruta principal (decisión de Juan). El CTA secundario del hero ahora lleva ahí en vez de a WhatsApp directo.
- [ ] **Footer incompleto** — Juan confirmó dejarlo como está (WhatsApp + Instagram + legales), sin agregar más contacto.
- [ ] **Landing es `'use client'` completa** — evaluado y descartado por ahora: el efecto de scroll-reveal (`IntersectionObserver`) toca casi todas las secciones de la página, no solo el FAQ/nav. Separar en server/client component es un refactor grande y riesgoso (rompe la animación visual de toda la landing) para un beneficio marginal de LCP en una landing que ya server-renderiza su HTML. No hacerlo salvo que el LCP real sea un problema medido.

---

# PARTE B — Manual

Trabajo que Claude Code **no puede hacer**. Varios bloquean ítems de la Parte A.

### B1 · Definir y comprar el dominio — cerrado

Dominio definitivo confirmado por Juan: `www.moments-mx.com`, ya apuntando a Vercel.

### B2 · Configurar variables de entorno en Vercel — cerrado

- [x] `NEXT_PUBLIC_WHATSAPP_NUMBER` — agregada vía CLI (Production + Preview), activa desde el próximo deploy
- [x] `NEXT_PUBLIC_ROOT_DOMAIN` — ya estaba configurada
- [x] `NEXT_PUBLIC_BASE_URL` — ya estaba configurada
- [x] Supabase, Resend, Cloudinary y `CRON_SECRET` — confirmado que ya están en producción (`vercel env ls`)

### B3 · Verificar el número de WhatsApp de ventas — cerrado

Confirmado por Juan: `528126390927` es el correcto.

### B4 · Aplicar SQL en el dashboard de Supabase `P0` → desbloquea **A11**

El repo no usa migraciones por CLI (política declarada en `supabase/migrations/20260421000001_event_pricing.sql`), así que esto se aplica a mano.

**Migración 1 — extensión por meses.** La columna actual es `extension_key TEXT CHECK (extension_key IN ('none','1m','3m','6m','permanent'))`, que no admite un contador libre:

```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS extension_months INTEGER NOT NULL DEFAULT 0
  CHECK (extension_months >= 0);

UPDATE events SET extension_months = CASE extension_key
  WHEN '1m' THEN 1 WHEN '3m' THEN 3 WHEN '6m' THEN 6
  WHEN 'permanent' THEN 120 ELSE 0 END;

-- Ejecutar solo después de verificar que la app ya no lee extension_key:
-- ALTER TABLE events DROP COLUMN extension_key;
```

**Migración 2 — tabla de leads** (para A11): campos nombre, whatsapp, fecha de evento, plan de interés, desglose de cotización, `created_at`; con RLS que permita insert anónimo y select solo a superadmin.

- [ ] Aplicar migración 1
- [ ] Aplicar migración 2
- [ ] Guardar ambos scripts en `supabase/migrations/` para dejar registro

### B5 · Diseñar las imágenes OG `P0` → desbloquea **A4**

- [ ] `public/og-default.jpg` — 1200×630, fallback de invitaciones sin portada (hoy referenciada pero **inexistente**)
- [ ] Imagen OG de marca para el sitio de marketing

### B6 · Analytics — cerrado

Vercel Analytics ya está instalado y activo (A6), no requiere cuenta adicional —
usa el mismo proyecto de Vercel. Meta Pixel descartado por decisión de Juan.

### B7 · Redactar los textos legales `P0` → desbloquea **A7**

En México la LFPDPPP lo exige si captas datos personales — y captas nombres y teléfonos de invitados de tus clientes. Meta además lo pide como requisito para aprobar anuncios.

- [ ] Aviso de privacidad (mencionar datos de invitados, Cloudinary y Supabase como encargados)
- [ ] Términos y condiciones (entregables, tiempos, política de expiración, reembolsos)

### B8 · Capturar screenshots de las plantillas `P1` → desbloquea **A8**

- [ ] Capturar Classic, Elegance y Costa en viewport móvil (390×844)
- [ ] Exportar optimizadas a `public/templates/`

### B9 · Decisiones de negocio pendientes `P1`

- [ ] **Precio de referencia del diseño personalizado** — desbloquea el ítem de A13
- [ ] **¿Se cobra la carga de datos?** La landing dice "con costo adicional, sujeto a disponibilidad" (`page.tsx:751`) pero no está en el cotizador
- [ ] **Método de pago** — no aparece en ningún lado del sitio. Es la primera pregunta que va a llegar por WhatsApp

### B10 · Prueba social `P1`

- [ ] Dos invitaciones demo completas con fotografía real
- [ ] Testimonios, aunque sean de las primeras parejas

### B11 · Instagram — cerrado

`@code4u_mx` en el footer es correcto — confirmado por Juan, no es un error. No cambiar.

### B12 · Prueba final en dispositivo real `P0`

- [ ] Cada CTA de WhatsApp abre el chat correcto, en iOS y Android
- [ ] Cotizador da el mismo total que el panel de superadmin
- [ ] Una invitación de prueba compartida por WhatsApp muestra preview con imagen
- [ ] Flujo RSVP completo end-to-end

---

## Ya resuelto

Revisado y correcto, no hay que tocarlo:

- Crons de Vercel configurados (`vercel.json`): keep-alive y `check-expirations` diarios
- Columnas `published_at` / `expires_at` / `custom_domain` migradas
- `expires_at` calculado correctamente como fecha de boda en `src/lib/eventDate.ts` + dashboard de `/superadmin` con estado vigente/inactiva/lista-para-depurar
- OG de invitaciones con transformación Cloudinary correcta para WhatsApp (1200×630, JPEG)
- Watermark de preview en imágenes
- Arquitectura plantilla-agnóstica del plan
- RLS y roles implementados, incluido wedding planner
- Deadline de RSVP y estados de pago

---

## Decisiones ya tomadas

| Tema | Decisión |
|------|----------|
| Precios base | Essential $699 · Plus $1,199 · Deluxe $1,499 — **sin cambio** |
| Fuente de verdad de precios | `src/lib/pricing.ts`, ya alineado con `CLAUDE.md` |
| Meses incluidos | **2** — rigen cuánto antes de la boda se puede publicar sin pagar extra, **no** cuánto dura viva la invitación |
| Extensiones | Contador de meses (+1), precio por mes según plan — comprar más solo permite publicar con más anticipación |
| Paquetes con descuento (3m/6m/permanente) | **Se eliminan** |
| `expires_at` (corte funcional) | **Siempre la fecha de la boda**, sin importar plan ni extensión — la invitación no tiene razón de ser después del evento |
| Purga de BD + Cloudinary | 30 días de gracia después de `expires_at` (`PURGE_GRACE_DAYS`), no se guarda en DB, se calcula al momento de revisar |

---

## Orden sugerido

| Día | Parte A (Claude Code) | Parte B (Juan) |
|-----|----------------------|----------------|
| **1** | A0 completo, A2, A5, A12 | B1, B2, B3 |
| **2** | A1, A3 | B4, B5, B6 |
| **3** | A4, A6, A7, A9, A10 | B7, B8 |
| **4** | A8 (cuando esté B8) | B9, B10 |
| **5** | A13 | **B12** |

A11 (captura de leads) descartado por ahora — decisión de Juan. B11 (Instagram) cerrado, `@code4u_mx` es correcto.
