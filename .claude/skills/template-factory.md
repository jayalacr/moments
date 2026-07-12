# Skill: TemplateFactory (Moments)

Guía técnica para la creación de nuevas plantillas en Moments. Una plantilla es un **diseño visual** que funciona con los 3 planes (Essential, Plus, Deluxe). El plan determina las funcionalidades disponibles en tiempo de render — no está fijo en la plantilla.

---

## 1. Disparadores (Triggers)

Activar esta skill cuando el usuario pida:
- "Crea una nueva plantilla para [Evento]"
- "Nuevo diseño de invitación estilo [X]"
- "Adapta el diseño de [Referencia visual] al proyecto"
- "Quiero un nuevo estilo de invitación"

---

## 2. Antes de Empezar: Preguntas Obligatorias

1. **¿Slug identificador?** → Nombre corto en kebab-case (ej. `jardin`, `rustico`, `moderno`).
2. **¿Estilo visual?** → Rústico, moderno, minimalista, romántico, tropical, etc.
3. **¿Paleta de colores?** → Si no la tiene, proponer una.
4. **¿Tipografías?** → Si no las tiene, seleccionar del catálogo aprobado (sección 6).

**NO preguntar el plan** — la plantilla soporta los 3 automáticamente.

---

## 3. Arquitectura del Sistema

### 3.1 Principio Fundamental

**1 diseño × 3 planes.** Una plantilla recibe `plan` como prop y activa/desactiva features según `PLAN_CAPABILITIES` de `src/lib/plans.ts`. El plan no va en el registro de templates.

```
src/components/templates/
  classic/       ← diseño oscuro, soporta essential/plus/deluxe
  elegance/      ← diseño claro, soporta essential/plus/deluxe
  [nuevo-slug]/  ← nuevo diseño, misma estructura
```

### 3.2 Props que Recibe Todo Template

```typescript
// Definido en src/lib/templates.ts como TemplateComponent
{
  config: any;                  // Configuración del evento (del campo JSONB en DB)
  plan?: EventPlan;             // 'essential' | 'plus' | 'deluxe'
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
  invalidToken?: boolean;
}
```

### 3.3 Cómo Usar el Plan Dentro del Template

```typescript
import { getCapabilities } from '@/lib/plans';

// Dentro del componente:
const caps = getCapabilities(plan);

// Luego usar caps para condicionales:
{caps.countdown && <CountdownSection targetDate={config.targetDate} />}
{caps.music && config.music && <MusicPlayer ... />}
{caps.carousel === 'auto' ? <AutoCarousel ... /> : <StaticGallery ... />}
```

### 3.4 Funcionalidades por Plan

| Funcionalidad | Essential | Plus | Deluxe |
|--------------|-----------|------|--------|
| Loader animado | ❌ | ❌ | ✅ |
| Música de fondo | ❌ | ❌ | ✅ |
| Cuenta regresiva | ❌ | ✅ | ✅ |
| Google Maps interactivo | ❌ | ✅ | ✅ |
| Sección Destino | ❌ | ✅ | ✅ |
| Google Calendar | ❌ | ❌ | ✅ |
| Fotos | 5 (estática) | 5-10 (manual) | 20 (auto) |
| RSVP | WhatsApp | Modal manual | Modal token |
| Dashboard | ❌ | Global | Individual |

Fuente de verdad: `src/lib/plans.ts` → `PLAN_CAPABILITIES`.

### 3.5 Registro Central (`src/lib/templates.ts`)

```typescript
import NuevoTemplate from '@/components/templates/[slug]/[Nombre]Template';

export const TEMPLATES: Record<string, TemplateEntry> = {
  // ... existentes ...
  '[slug]': {
    component: NuevoTemplate as TemplateComponent,
    label: '[Nombre descriptivo]',
    // Sin campo `plan` — soporta los 3
  },
};
```

---

## 4. Config Compartida entre Planes

A diferencia de la arquitectura anterior (EssentialConfig / PlusConfig / DeluxeConfig separadas), ahora **una sola interfaz** cubre los 3 planes. Los campos de planes superiores simplemente se ignoran cuando el plan no los soporta.

### Config Base (campos comunes a todos los planes)

```typescript
interface [Nombre]Config {
  // Siempre presentes
  heroLabel: string;
  couple: { person1: string; person2: string };
  fullNames: { person1: string; person2: string };
  date: { day: string; month: string; year: string };
  location: string;
  images: string[] | PhotoEntry[];
  quote?: { text: string; reference: string };
  parents?: { person1: string; person2: string };
  itinerary: Array<{
    time: string; name: string; venue: string; address: string;
    image?: string; mapsUrl?: string;
  }>;
  dressCode?: {
    label: string; women: string; men: string;
    swatches: Array<{ color: string; name: string }>;
    avoid?: Array<{ color: string; name: string }>;
  };
  gifts?: {
    bank?: string; holder?: string; account?: string; clabe?: string;
    giftListUrl?: string; giftListLabel?: string;
    envelopeMessage?: string;
  };
  noChildren?: boolean;
  rsvpDeadline?: string;
  sections?: Record<string, boolean>;

  // Plus/Deluxe
  targetDate?: string;           // ISO 8601 para cuenta regresiva
  destination?: { hotels: [...]; transport?: {...} };
  rsvp?: { deadline: string; };
  dietary?: { enabled: boolean; options: string[] };

  // Deluxe
  music?: { url: string; title: string; artist: string };
  monogram?: string;

  // Essential RSVP
  whatsapp?: { number: string; message: string };
}
```

El template decide internamente qué renderizar según `caps = getCapabilities(plan)`.

---

## 5. Sistema de Fotos (PhotoEntry)

```typescript
// src/lib/imageLayout.ts
type ImageLayout = 'full' | 'duo' | 'trio' | 'carousel';

interface PhotoEntry {
  url: string;
  role: 'hero' | 'block' | null;
  afterSection?: string;
  layout?: ImageLayout;
  blockGroup?: number;
  orderInBlock?: number;
  objectPosition?: string;
  scale?: number;
}
```

- **Essential** (`caps.carousel === 'none'`): usar `images: string[]` (primeras 5 del array)
- **Plus** (`caps.carousel === 'manual'`): carrusel manual con `PhotoEntry[]`
- **Deluxe** (`caps.carousel === 'auto'`): carrusel automático distribuido, `PhotoEntry[]`

---

## 6. Tipografías Aprobadas (Google Fonts)

**Display (títulos, nombres):**
- Cormorant Garamond (elegante serif — default Classic)
- Playfair Display (editorial)
- Pinyon Script (script cursivo — usado en Elegance)
- Great Vibes (script ligero)

**Headings:**
- Cinzel (romano, usado en Elegance)
- EB Garamond (clásico)

**Body:**
- Jost (geométrica moderna)
- Lora (serif de lectura — usado en Elegance)
- Raleway (sans elegante)
- Montserrat (limpia)
- DM Sans (compacta)

---

## 7. Flujo de Implementación (Receta)

### Paso 1: Copiar Template Existente

```
src/components/templates/classic/ClassicTemplate.tsx
→ src/components/templates/[slug]/[Nombre]Template.tsx
```

Copiar Classic (oscuro) o Elegance (claro) según la estética más cercana.

### Paso 2: Personalizar

**2a. Variables CSS** (bloque `<style>` interno):
```css
--ivory: #...;   /* fondo */
--charcoal: #...; /* texto */
--gold: #...;     /* acento */
```

**2b. Renombrar la interfaz de config**:
```typescript
export interface JardinConfig { ... }
```

**2c. Ajustar elementos visuales** (SVGs decorativos, formas de sección, etc.)

**2d. Mantener intacta la lógica funcional**:
- `getCapabilities(plan)` para condicionales de features
- IntersectionObserver para reveals
- Lógica RSVP (ver sección 8)
- ContentProtection wrapper

### Paso 3: Demo Data

```typescript
// src/lib/demo-data.ts
import { JardinConfig } from '@/components/templates/jardin/JardinTemplate';

export const JARDIN_DEMO: JardinConfig = {
  // Datos ficticios completos — cubrir todos los campos incluyendo Plus/Deluxe
  // Imágenes Unsplash: hero ?w=1400&q=80, interiores ?w=1200&q=80
};
```

### Paso 4: Registrar en `templates.ts`

```typescript
import JardinTemplate from '@/components/templates/jardin/JardinTemplate';

'jardin': {
  component: JardinTemplate as TemplateComponent,
  label: 'Jardín',
},
```

### Paso 5: Página de Preview

```typescript
// src/app/plantillas/jardin/page.tsx
import JardinTemplate from '@/components/templates/jardin/JardinTemplate';
import { JARDIN_DEMO } from '@/lib/demo-data';
import FloatingPlanSwitcher from '@/components/templates/shared/FloatingPlanSwitcher';
import type { EventPlan } from '@/lib/plans';

const VALID_PLANS: EventPlan[] = ['essential', 'plus', 'deluxe'];

export default async function JardinPreviewPage({
  searchParams,
}: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: rawPlan } = await searchParams;
  const plan: EventPlan = VALID_PLANS.includes(rawPlan as EventPlan)
    ? (rawPlan as EventPlan)
    : 'deluxe';

  return (
    <>
      <FloatingPlanSwitcher activePlan={plan} baseUrl="/plantillas/jardin" />
      <JardinTemplate key={plan} config={JARDIN_DEMO} plan={plan} />
    </>
  );
}
```

### Paso 6: Agregar al Catálogo

Actualizar `src/app/plantillas/page.tsx` añadiendo la nueva plantilla al array `TEMPLATES`:

```typescript
{
  key: 'jardin',
  name: 'Jardín',
  tagline: 'Descripción breve.',
  description: 'Descripción más larga para la card.',
  previewBase: '/plantillas/jardin',
  style: 'light' as const, // o 'dark'
},
```

---

## 8. Integración RSVP por Plan

La lógica RSVP se decide con `caps.rsvpMode`:

### `'whatsapp'` (Essential)
```typescript
if (caps.rsvpMode === 'whatsapp') {
  // Botón directo: https://wa.me/{number}?text={message}
  // Config requerida: config.whatsapp.number, config.whatsapp.message
}
```

### `'modalManual'` (Plus)
- Modal con campo de nombre, acompañantes y dietary
- `guest_id: null` en el payload
- `maxCompanions` viene del query param `p` (codificado)

### `'modalToken'` (Deluxe)
- Link único por invitado con `?id={token}`
- Datos precargados del invitado desde BD
- `hasExistingRsvp` y `invalidToken` manejan estados especiales

**REGLA IRROMPIBLE**: No modificar la firma de `POST /api/rsvp`:
```typescript
{
  event_id: string;
  guest_id: string | null;
  name: string;
  seats: number;
  companion_names: string[];
  dietary: string | null;
  dietary_per_person: Record<string, string[]>;
  status: 'confirmed' | 'declined';
}
```

---

## 9. Estilos y Responsividad

**No crear archivos CSS separados.** Todo el estilo va en el `<style>` interno del componente.

**No modificar `src/app/globals.css`.**

### Breakpoints mínimos requeridos

| Breakpoint | Ajuste |
|------------|--------|
| `> 768px` | Layout completo |
| `≤ 768px` | Padding reducido, fonts menores |
| `≤ 600px` | Grids en 1 columna |
| `≤ 480px` | Hero en columna, padding mínimo |

### Clases de Animación (IntersectionObserver)

| Clase | Efecto |
|-------|--------|
| `.reveal` | Fade in + translateY(20px) |
| `.reveal--slide-left` | Desde izquierda (-32px) |
| `.reveal--slide-right` | Desde derecha (+32px) |
| `.delay-1` a `.delay-5` | Retraso escalonado 0.1s–0.5s |

---

## 10. Componentes Compartidos

- **`ContentProtection`** (`src/components/templates/shared/ContentProtection.tsx`): bloquea clic derecho, atajos, arrastrar imágenes. **Siempre incluirlo** como wrapper.
- **`FloatingPlanSwitcher`** (`src/components/templates/shared/FloatingPlanSwitcher.tsx`): UI de cambio de plan en preview. Solo en páginas `/plantillas/[slug]`.

---

## 11. Restricciones

1. **NO** fijar el plan en el registro de templates — siempre pasa como prop.
2. **NO** crear interfaces de config separadas por plan (Essential/Plus/Deluxe) — una sola por diseño.
3. **NO** alterar el payload de `/api/rsvp`.
4. **NO** cambiar la interfaz `TemplateComponent`.
5. **NO** omitir `ContentProtection`.
6. **NO** agregar dependencias npm sin confirmar.
7. **SÍ** exportar la interfaz de config para que `demo-data.ts` pueda importarla.
8. **SÍ** usar `getCapabilities(plan)` para todos los condicionales de features.
9. **SÍ** incluir `FloatingPlanSwitcher` en la página de preview.

---

## 12. Checklist Pre-entrega

- [ ] `npm run build` sin errores
- [ ] Template registrado en `templates.ts` sin campo `plan`
- [ ] Preview en `/plantillas/[slug]?plan=essential|plus|deluxe` funciona para los 3 planes
- [ ] Essential: solo foto estática, RSVP WhatsApp, sin countdown
- [ ] Plus: carrusel manual, modal RSVP anónimo, countdown visible
- [ ] Deluxe: loader, música, carrusel auto, modal token
- [ ] Responsive en 375px / 768px / 1440px
- [ ] ContentProtection aplicado
- [ ] Demo data en `demo-data.ts` con tipo correcto exportado
- [ ] Card agregada en `/plantillas/page.tsx`
