# Skill: TemplateFactory (Moments)

Guía técnica completa para la generación de nuevas plantillas premium en el ecosistema de Moments. Este documento contiene todo el contexto necesario para producir plantillas funcionales, consistentes y listas para producción en cualquiera de los tres planes.

---

## 1. Disparadores (Triggers)

Activar esta skill cuando el usuario pida:
- "Crea una nueva plantilla para [Evento]"
- "Genera un diseño nivel [Tier]"
- "Crea una variante de [Plantilla existente]"
- "Adapta el diseño de [Referencia visual] al proyecto"
- "Quiero un nuevo estilo de invitación"

---

## 2. Antes de Empezar: Preguntas Obligatorias

Antes de escribir código, confirmar con el usuario:

1. **¿Qué plan/tier?** → Essential, Plus o Deluxe (determina las funcionalidades disponibles).
2. **¿Qué tipo de evento?** → Boda, XV años, bautizo, graduación, etc.
3. **¿Slug identificador?** → Nombre corto en kebab-case (ej. `boda-rustica`, `elegance-garden`).
4. **¿Estilo visual deseado?** → Rústico, moderno, minimalista, romántico, tropical, etc.
5. **¿Paleta de colores?** → Si no la tiene, proponer una coherente con el estilo.
6. **¿Tipografías preferidas?** → Si no las tiene, seleccionar del catálogo aprobado (ver sección 5).

---

## 3. Arquitectura del Sistema de Templates

### 3.1 Principio Fundamental
**NUNCA crear layouts desde cero.** Siempre copiar el componente base del tier correspondiente y personalizarlo. Los templates base ya contienen toda la lógica funcional (RSVP, observers, música, etc.).

### 3.2 Archivos Base por Tier

| Tier | Archivo base | Ruta |
|------|-------------|------|
| Essential | `EssentialTemplate.tsx` | `src/components/templates/essential/` |
| Plus | `PlusTemplate.tsx` | `src/components/templates/plus/` |
| Deluxe | `DeluxeTemplate.tsx` | `src/components/templates/deluxe/` |

### 3.3 Props que Recibe Todo Template

Todos los templates reciben las mismas props desde `src/app/[type]/[slug]/page.tsx`:

```typescript
{
  config: EssentialConfig | PlusConfig | DeluxeConfig;  // Configuración del evento
  eventId?: string;            // UUID del evento (para llamadas al API de RSVP)
  guestToken?: string;         // Token único del invitado (Deluxe: datos precargados)
  maxCompanions?: number;      // Número de acompañantes permitidos
  companionNames?: string[];   // Nombres precargados de acompañantes
  guestName?: string;          // Nombre precargado del invitado
  hasExistingRsvp?: boolean;   // Ya confirmó anteriormente
  invalidToken?: boolean;      // Token inválido o expirado
}
```

### 3.4 Registro Central en `src/lib/templates.ts`

Cada template nuevo debe registrarse aquí:

```typescript
import NuevoTemplate from '@/components/templates/[slug]/[Nombre]Template';

export const TEMPLATES: Record<string, TemplateEntry> = {
  // ... templates existentes ...
  '[slug-identificador]': {
    component: NuevoTemplate as TemplateComponent,
    label: '[Nombre descriptivo]',
    plan: 'essential' | 'plus' | 'deluxe',
  },
};
```

---

## 4. Funcionalidades por Tier (Matriz de Referencia)

Usar esta tabla para saber exactamente qué incluir y qué omitir según el plan:

| Funcionalidad | Essential | Plus | Deluxe |
|--------------|-----------|------|--------|
| Hero con foto de fondo | ✅ | ✅ | ✅ |
| Frase / Cita bíblica | ✅ | ✅ | ✅ |
| Nombres de padres | ✅ | ✅ | ✅ |
| Galería de fotos | Hasta 5 (estática) | 5-10 (carrusel manual) | Ilimitada (auto, distribuida) |
| Itinerario | Estático | Animado + imágenes | Animado + imágenes |
| Dress Code | ✅ (swatches) | ✅ (swatches + avoid) | ✅ (swatches + avoid) |
| Mesa de Regalos | ✅ | ✅ | ✅ |
| Notas adicionales | ✅ | ✅ | ✅ |
| Cuenta regresiva | ❌ | ✅ | ✅ |
| Google Maps interactivo | ❌ | ✅ | ✅ |
| Sección Destino (hoteles/transporte) | ❌ | ✅ | ✅ |
| Loader animado | ❌ | ❌ | ✅ |
| Música de fondo | ❌ | ❌ | ✅ |
| Monograma | ❌ | ❌ | ✅ |
| Google Calendar | ❌ | ❌ | ✅ |
| RSVP vía WhatsApp | ✅ | ❌ | ❌ |
| RSVP modal (nombre manual) | ❌ | ✅ | ❌ |
| RSVP modal (link único, datos precargados) | ❌ | ❌ | ✅ |
| Dashboard de gestión | ❌ | General | Completo (por invitado) |
| ContentProtection (anti-copia) | ✅ | ✅ | ✅ |

---

## 5. Interfaces de Configuración por Tier

### 5.1 EssentialConfig

```typescript
interface EssentialConfig {
  heroLabel: string;                    // Texto sobre el hero (ej. "Nuestro gran día")
  couple: { person1: string; person2: string };
  fullNames: { person1: string; person2: string };
  date: { day: string; month: string; year: string };
  location: string;
  images: string[];                     // Hasta 5 URLs de imágenes
  quote?: { text: string; reference: string };
  parents?: { person1: string; person2: string };
  itinerary: Array<{
    time: string;
    name: string;
    venue: string;
    address: string;
  }>;
  dressCode?: {
    label: string;
    women: string;
    men: string;
    swatches: Array<{ color: string; name: string }>;
    avoid?: Array<{ color: string; name: string }>;
  };
  notes?: string[];
  gifts?: {
    bank: string; holder: string;
    account: string; clabe: string;
    giftListUrl?: string; giftListLabel?: string;
    giftTypes?: string[];
    envelopeMessage?: string;
  };
  whatsapp: { number: string; message: string };  // Obligatorio en Essential
  noChildren?: boolean;
  noChildrenMessage?: string;
  rsvpDeadline?: string;
  theme?: {
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    displayFont: string;
    bodyFont: string;
  };
  sections?: {
    quote: boolean;
    parents: boolean;
    dressCode: boolean;
    notes: boolean;
    gifts: boolean;
  };
}
```

### 5.2 PlusConfig (extiende Essential)

Todo lo de Essential más:

```typescript
interface PlusConfig extends Omit<EssentialConfig, 'whatsapp'> {
  targetDate: string;                   // ISO 8601 para cuenta regresiva
  itinerary: Array<{
    time: string;
    name: string;
    venue: string;
    address: string;
    image?: string;                     // Imagen del venue
    mapsUrl?: string;                   // Enlace a Google Maps
    imageObjectPosition?: string;
    imageScale?: number;
  }>;
  destination?: {
    hotels: Array<{
      name: string;
      category: string;
      address: string;
      note?: string;
      phone?: string;
    }>;
    transport?: {
      info: string;
      schedule?: string;
      contact?: string;
    };
  };
  rsvp?: {
    maxPlusOnes: number;
    deadline: string;
    dietaryOptions?: string[];          // Ej: ["Vegetariano", "Vegano", "Sin gluten"]
  };
  photos?: PhotoEntry[];               // Modelo avanzado (ver sección 6)
}
```

### 5.3 DeluxeConfig (extiende Plus)

Todo lo de Plus más:

```typescript
interface DeluxeConfig extends PlusConfig {
  music?: { url: string; title: string; artist: string };
  monogram?: string;                   // Iniciales para el loader (ej. "I&A")
  photos: PhotoEntry[];                // Obligatorio: modelo avanzado con roles
  sections?: {
    quote: boolean;
    parents: boolean;
    itinerary: boolean;
    dressCode: boolean;
    notes: boolean;
    gifts: boolean;
    destination: boolean;
  };
}
```

---

## 6. Sistema de Fotos (PhotoEntry)

El proyecto usa dos modelos de imágenes. **Preferir siempre el modelo nuevo (`PhotoEntry[]`)** para Plus y Deluxe:

```typescript
// Definido en src/lib/imageLayout.ts
type ImageLayout = 'full' | 'duo' | 'trio' | 'carousel';

interface PhotoEntry {
  url: string;
  role: 'hero' | 'block' | null;       // hero = portada, block = en sección, null = no asignada
  afterSection?: string;                // Dónde insertar (ej. 'hero', 'quote', 'itinerary')
  layout?: ImageLayout;                 // Cómo mostrar el bloque
  blockGroup?: number;                  // Agrupar fotos en un mismo bloque
  orderInBlock?: number;                // Orden dentro del bloque (0-indexed)
  objectPosition?: string;              // CSS object-position (ej. "40% 20%")
  scale?: number;                       // Zoom [1, 3], se aplica como transform: scale(N)
}
```

### Límites por Layout
| Layout | Mín | Máx | Descripción |
|--------|-----|-----|-------------|
| `full` | 1 | 1 | Ancho completo |
| `duo` | 2 | 2 | Dos imágenes lado a lado |
| `trio` | 3 | 3 | Tres imágenes en grid |
| `carousel` | 2 | ∞ | Carrusel deslizable |

### Essential usa el modelo legacy
Essential usa `images: string[]` (array plano de URLs, máximo 5). NO usa `PhotoEntry`.

---

## 7. Sistema de Estilos y Tematización

### 7.1 Variables CSS Estándar (bloque `<style>` interno)

Cada template define sus propias variables CSS. Al crear uno nuevo, modificar estas en el `:root` o scope del componente:

```css
:root {
  --ivory: #F8F3EC;       /* Color de fondo principal */
  --charcoal: #1C1611;    /* Color de texto principal */
  --dark: #14100C;        /* Overlays oscuros */
  --gold: #B8965A;        /* Color de acento (líneas, botones, detalles) */
  --muted: #E6DDD2;       /* Bordes y separadores */
  --muted-fg: #9B8B78;    /* Texto secundario */
  --section-gap: clamp(3rem, 5vw, 4.5rem);  /* Espaciado entre secciones */
}
```

**Para un nuevo template**, renombrar estas variables o crear un nuevo set coherente con la paleta elegida. NUNCA tocar `src/app/globals.css`.

### 7.2 Tipografías Aprobadas (Google Fonts)

**Display (títulos, nombres):**
- Cormorant Garamond (default, elegante serif)
- Playfair Display (clásico editorial)
- EB Garamond (romano tradicional)
- Great Vibes (script cursivo)
- Tangerine (script ligero)

**Body (texto general):**
- Jost (geométrica moderna)
- Raleway (elegante sans-serif)
- Montserrat (limpia y legible)
- DM Sans (moderna y compacta)

**Regla**: Cada template debe cargar sus fonts con `<link>` en el head o dinámicamente. El theme del config permite que el organizador elija fonts (`theme.displayFont`, `theme.bodyFont`).

### 7.3 Clases de Animación Disponibles

Estas clases ya están definidas en el CSS interno de los templates y funcionan con `IntersectionObserver`:

| Clase | Efecto |
|-------|--------|
| `.reveal` | Fade in + translateY(20px) → 0 |
| `.reveal--image` | Fade in + translateY(40px) + scale(0.98) → 1 |
| `.reveal--slide-left` | Fade in desde la izquierda (-32px) |
| `.reveal--slide-right` | Fade in desde la derecha (+32px) |
| `.delay-1` a `.delay-5` | Retraso escalonado (0.1s a 0.5s) |

**Curva de easing estándar**: `cubic-bezier(0.16, 1, 0.3, 1)`

### 7.4 Keyframes Disponibles

| Keyframe | Uso | Tier |
|----------|-----|------|
| `heroZoom` | Zoom lento en foto hero (scale 1.04→1.09) | Todos |
| `heroFadeUp` | Fade + translateY en contenido hero | Todos |
| `heroLine` | Línea decorativa que se expande (scaleX 0→1) | Todos |
| `scrollDown` | Indicador de scroll | Todos |
| `wave` | Barras de música animadas | Solo Deluxe |
| `glowPulse` | Brillo dorado pulsante | Solo Deluxe |

### 7.5 Clases de Layout para Secciones

```css
.section          /* max-width: 680px, padding: var(--section-gap) 2rem, centrado */
.section--wide    /* max-width: 860px */
.section--left    /* text-align: left */
```

### 7.6 Clases de Layout para Fotos

```css
.photo-full       /* height: clamp(380px, 55vw, 640px) */
.photo-center     /* height: clamp(440px, 65vw, 720px) con líneas decorativas */
.photo-duo        /* Grid de 2 columnas */
.photo-img--hover /* Scale 1.04 en hover con gradient overlay */
```

---

## 8. Integración RSVP por Tier

La lógica de RSVP es CRÍTICA y varía según el plan. El endpoint es `POST /api/rsvp`.

### Essential: WhatsApp directo
- Botón que abre `https://wa.me/{number}?text={encodedMessage}`
- NO hay formulario ni llamada al API
- Config requerida: `whatsapp: { number, message }`

### Plus: Modal con nombre manual
- Modal que pide nombre, número de acompañantes y restricciones alimentarias
- El invitado escribe su nombre (no hay token)
- Llama a `/api/rsvp` en modo anónimo (`guest_id: null`)
- `maxCompanions` viene del parámetro `p` en la URL (codificado con `encodePasses()`)
- Config requerida: `rsvp: { maxPlusOnes, deadline, dietaryOptions }`

### Deluxe: Modal con link único
- El invitado accede con `?id={token}` en la URL
- El nombre y acompañantes se precargan desde la DB
- Llama a `/api/rsvp` en modo token (`guest_id` se resuelve server-side)
- Muestra estado "Ya confirmaste" si `hasExistingRsvp === true`
- Muestra error si `invalidToken === true`

**REGLA IRROMPIBLE**: No modificar la firma del endpoint `/api/rsvp` ni el payload esperado:
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

## 9. Flujo de Implementación Completo (Receta)

### Paso 1: Identificar Tier y Validar Funcionalidades
Cruzar lo que el usuario pide con la matriz de la sección 4. Si pide algo que no corresponde al tier, informar.

### Paso 2: Copiar Template Base
```
src/components/templates/[tier-base]/[Tier]Template.tsx
→ copiar a →
src/components/templates/[nuevo-slug]/[Nombre]Template.tsx
```

Ejemplo: Para crear "boda-rustica" en plan Plus:
```
src/components/templates/plus/PlusTemplate.tsx
→ src/components/templates/boda-rustica/BodaRusticaTemplate.tsx
```

### Paso 3: Personalizar el Componente

**3a. Actualizar las variables CSS** en el bloque `<style>` interno:
- Cambiar paleta de colores (--ivory, --gold, --charcoal, etc.)
- Ajustar tipografías en los `<link>` de Google Fonts
- Modificar espaciados si el estilo lo requiere

**3b. Actualizar la interfaz de config** (renombrar el export del tipo):
- `export interface BodaRusticaConfig { ... }` (basada en la interface del tier)

**3c. Ajustar elementos visuales únicos**:
- Decoradores SVG o imágenes de fondo
- Formas de secciones (bordes, separadores)
- Efectos de hover o animaciones adicionales

**3d. Mantener intacta toda la lógica funcional**:
- IntersectionObserver para reveals
- Lógica del RSVP (modal, fetch, estados)
- ContentProtection wrapper
- Reproductor de música (Deluxe)
- Countdown timer (Plus/Deluxe)

### Paso 4: Crear Demo Data

Agregar constante de ejemplo en `src/lib/demo-data.ts`:

```typescript
import { BodaRusticaConfig } from '@/components/templates/boda-rustica/BodaRusticaTemplate';

export const BODA_RUSTICA_DEMO: BodaRusticaConfig = {
  // Llenar con datos ficticios coherentes y completos
  // Usar imágenes de Unsplash de alta calidad
  // Cubrir TODAS las secciones habilitadas
};
```

**Reglas para demo data**:
- Usar nombres hispanos realistas
- Imágenes de Unsplash con `?w=1400&q=80` para hero, `?w=1200&q=80` para interiores
- Cubrir todas las secciones que el tier soporta
- Incluir al menos 3 items de itinerario
- Si tiene dress code, incluir 3+ swatches con nombres de color
- Si tiene regalos, incluir datos bancarios ficticios completos

### Paso 5: Registrar en `src/lib/templates.ts`

```typescript
import BodaRusticaTemplate from '@/components/templates/boda-rustica/BodaRusticaTemplate';

// Dentro del objeto TEMPLATES:
'boda-rustica': {
  component: BodaRusticaTemplate as TemplateComponent,
  label: 'Boda Rústica',
  plan: 'plus',  // El tier correspondiente
},
```

### Paso 6: Crear Página de Preview

Crear `src/app/plantillas/[slug]/page.tsx`:

```typescript
import BodaRusticaTemplate from '@/components/templates/boda-rustica/BodaRusticaTemplate';
import { BODA_RUSTICA_DEMO } from '@/lib/demo-data';

export const metadata = {
  title: 'Boda Rústica — Moments',
  description: 'Vista previa de la plantilla Boda Rústica para invitaciones digitales.',
};

export default function BodaRusticaPreviewPage() {
  return <BodaRusticaTemplate config={BODA_RUSTICA_DEMO} />;
}
```

### Paso 7: Verificación Final

Ejecutar `npm run dev` y revisar en `/plantillas/[slug]`.

---

## 10. Breakpoints y Responsividad

Todos los templates deben funcionar en estos breakpoints:

| Breakpoint | Ajustes esperados |
|------------|-------------------|
| `> 768px` | Layout completo, secciones a 680px max |
| `≤ 768px` | Secciones a padding reducido, fonts ligeramente menores |
| `≤ 600px` | Grids de regalos/fotos en 1 columna, imágenes más compactas |
| `≤ 480px` | Hero meta en columna, padding mínimo, photo-duo apilado |

**No crear media queries nuevas salvo que el diseño lo exija**. Los templates base ya traen responsive incorporado.

---

## 11. Componentes Compartidos

### ContentProtection (`src/components/templates/shared/ContentProtection.tsx`)
- Bloquea clic derecho, arrastrar imágenes, atajos de teclado (Ctrl+S, Ctrl+U, Ctrl+Shift+I)
- Prop `enabled` para activar/desactivar
- **Siempre incluirlo** como wrapper del template completo

### Optimización de Imágenes (`src/lib/cloudinary.ts`)
- Contiene presets de transformación en el objeto `T`: `heroMobile`, `heroDesktop`, `fullMobile`, `fullDesktop`, `centered`, `duo`
- Usar cuando las imágenes estén en Cloudinary (producción), no para Unsplash (demos)

---

## 12. Restricciones (Guardrails)

1. **NO** modificar `src/app/globals.css` para estilos de una plantilla específica. Usar siempre el `<style>` interno del componente.
2. **NO** alterar la lógica del RSVP ni el payload del endpoint `/api/rsvp`.
3. **NO** cambiar las props que recibe el template (la interfaz `TemplateComponent` es fija).
4. **NO** usar imágenes placeholder genéricas. Usar Unsplash de alta calidad con query params de tamaño.
5. **NO** omitir el `ContentProtection` wrapper.
6. **NO** agregar dependencias npm nuevas sin confirmar con el usuario.
7. **NO** romper la paridad con el sistema de tokens de Supabase.
8. **NO** crear archivos CSS separados para el template. Todo el estilo va dentro del componente (tag `<style>` o Tailwind inline).
9. **SÍ** exportar la interfaz de config del template para que `demo-data.ts` pueda importarla.
10. **SÍ** mantener las secciones como condicionales controladas por `config.sections` para que el organizador pueda activar/desactivar desde el admin.

---

## 13. Checklist de Calidad (Pre-entrega)

Antes de dar por terminado un template, verificar:

- [ ] **Compila sin errores**: `npm run dev` corre sin warnings en el template.
- [ ] **Registro correcto**: Template aparece en `TEMPLATES` con plan correcto.
- [ ] **Preview funcional**: La ruta `/plantillas/[slug]` renderiza correctamente.
- [ ] **Responsive**: Funciona en mobile (375px), tablet (768px) y desktop (1440px).
- [ ] **Todas las secciones**: Cada sección habilitada del tier se renderiza.
- [ ] **Secciones opcionales**: Las secciones con toggle `config.sections.X` se ocultan correctamente al poner `false`.
- [ ] **RSVP funcional**: El mecanismo de confirmación del tier funciona (WhatsApp / Modal anónimo / Modal con token).
- [ ] **Animaciones**: Los `reveal` se disparan al hacer scroll.
- [ ] **Fonts cargadas**: Las tipografías elegidas cargan correctamente.
- [ ] **Imágenes válidas**: Todas las URLs de demo resuelven y se ven bien.
- [ ] **ContentProtection**: El wrapper está aplicado.
- [ ] **Música** (solo Deluxe): El reproductor aparece y funciona.
- [ ] **Countdown** (Plus/Deluxe): Muestra la cuenta regresiva correctamente.
- [ ] **Demo data exportada**: La constante de demo está en `demo-data.ts` con el tipo correcto.

---

## 14. Ejemplo Rápido: Crear "Jardín Dorado" (Plus)

```
1. Tier: Plus → copiar PlusTemplate.tsx
2. Crear: src/components/templates/jardin-dorado/JardinDoradoTemplate.tsx
3. Paleta: --ivory: #FDF8F0, --gold: #C4A35A, --charcoal: #2C2416
4. Fonts: Great Vibes (display) + Raleway (body)
5. Demo: JARDIN_DORADO_DEMO en demo-data.ts
6. Registro: 'jardin-dorado' en templates.ts con plan: 'plus'
7. Preview: src/app/plantillas/jardin-dorado/page.tsx
8. Verificar: npm run dev → /plantillas/jardin-dorado
```
