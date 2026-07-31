# Rediseño de la plantilla Costa

> **Estado:** especificación. No implementado.
> **Ejecutor:** Claude Code.
> **Archivo objetivo principal:** `src/components/templates/costa/CostaTemplate.tsx` (1036 líneas)
> **Fecha:** 2026-07-29

---

## 0. Objetivo

Costa se ve **lineal y genérica**. El objetivo es que lea como una invitación de boda en playa —textura, color, ritmo irregular— sin tocar la lógica funcional (RSVP, `getCapabilities`, contrato de config).

**Decisiones ya tomadas** (no reabrir):

| Decisión | Valor |
|---|---|
| Alcance | Rediseño completo de la capa visual y de composición |
| Dependencias nuevas | Solo `lenis` (~3 KB). Todo lo demás nativo: SVG filters, CSS masks, blend modes, `motion` (ya instalado) |
| Descartado | three.js / react-three-fiber, GSAP, p5.js, Lottie, Rive, shaders WebGL |

---

## 1. Diagnóstico (por qué se ve lineal)

Evidencia concreta del archivo actual:

### 1.1 Todas las secciones son la misma sección

El componente `Section` (líneas 333–352) siempre produce el mismo patrón: `CurveTop` + padding + `SectionHeading` centrado (eyebrow + `h2` en Cinzel + reglita dorada). Se usa en **countdown, itinerario, destino, detalles, no-niños y footer**: 6 de 7 bloques.

El comentario de la línea 89 afirma *"cada sección varía de composición (no todas son eyebrow + bloque centrado)"* — es falso en la implementación actual. **Esta es la causa #1 de la linealidad.**

### 1.2 Las curvas SVG son un divisor de landing page

Solo existen dos paths: `HeroCurve` (310–316) y `CurveTop` (318–324). `CurveTop` se repite en **cada** transición, alternando con `scaleX(-1)`. Una onda simétrica de 70px se detecta a la tercera repetición y no lee como "mar", lee como plantilla de constructor web.

### 1.3 La paleta está bien elegida pero mal usada

```css
--sand: #FBF6EC;   /* línea 94 */
--foam: #FFFDFA;   /* línea 95 */
```

Están a **~3% de luminancia de diferencia**. La alternancia sand/foam que estructura toda la página es **visualmente imperceptible**.

Además:
- `--coral` solo aparece en textos de 9–11px y bordes de 1px.
- `--lagoon` casi siempre como `rgba(42,172,166,0.2)` en bordes de tarjeta.

Resultado percibido: **beige + azul petróleo**. No playa.

### 1.4 Cero textura

Todo es `background: <color sólido>` + `border-radius` + `box-shadow`. No hay grano, papel, acuarela, degradado ni un solo elemento decorativo.

### 1.5 Las fotos parecen cards de dashboard

`.cs-photo` (línea 213): `border-radius: 10px` + `box-shadow: 0 20px 40px` idéntico en todas.
Lo único que sí funciona es `.cs-photo-breakout` (210) con su `21/9` a ancho de viewport.

### 1.6 Tres tipografías peleando

Cormorant Garamond (bien) + Jost (bien) + **Cinzel** con `letter-spacing: 0.08em` (línea 107). Cinzel es capital romana: evoca mármol e imperio, no costa. Es lo que más endurece los títulos.

### 1.7 Una sola animación

`fadeUp` (328–331: `opacity` + `y: 26`) se aplica a absolutamente todo lo que hace reveal. Predecible desde el segundo scroll.

### 1.8 Lo que sí funciona — conservar y multiplicar

Son los únicos tres momentos con voz propia del archivo:

1. `.cs-parents-note` (181): nota rotada `-2.2deg` flotando sobre el itinerario.
2. `.cs-hero` (128–135): split 58/42 con parallax.
3. Countdown (607): pills con `marginTop` alternado.

**El rediseño consiste en producir ~8 momentos más de ese calibre.**

---

## 2. Sistema visual nuevo

### 2.1 Paleta

Reemplazar el bloque `:root` (líneas 92–103).

```css
:root {
  /* Fondos — ahora sí distinguibles entre sí */
  --foam:       #FFFCF7;  /* espuma, fondo base */
  --sand:       #F4EADA;  /* arena seca, fondo alterno */
  --wet-sand:   #E3D3BC;  /* NUEVO: tono intermedio, bordes y separadores */

  /* Agua */
  --lagoon:     #1F9B9B;  /* más saturado que el #2AACA6 actual */
  --shallow:    #7FCFC8;  /* NUEVO: agua baja, solo para degradados */

  /* Acentos cálidos */
  --coral:      #E2725B;  /* más terracota, menos salmón */
  --coral-soft: #F2A38C;  /* NUEVO */

  /* Oscuros */
  --deep:       #0B2A31;
  --ink:        #14343B;
  --champagne:  #C2A26B;
}
```

**Por qué:** `--foam` vs `--sand` pasa de ~3% a ~6% de diferencia real, así la alternancia de secciones por fin se percibe. `--wet-sand` da un tercer escalón para que no todo sea "claro u oscuro". `--shallow` y `--coral-soft` existen para poder hacer degradados sin recurrir a opacidades sobre blanco (que es lo que aplana el diseño actual).

**Reglas de uso obligatorias:**

- `--coral` deja de ser detalle de 11px y pasa a acento estructural: números del countdown, monograma del footer, subrayados tipo acuarela, marcas de las notas.
- `--lagoon` deja de vivir en `border: 1px solid rgba(...,0.2)`. Va en degradados (`linear-gradient(--lagoon → --shallow)`) y en fondos de sección.
- `--champagne` se limita a hairlines y eyebrows. Ya cumple bien ese rol.

### 2.2 Gotcha crítico: `buildThemeCSS` y el demo

`buildThemeCSS` (302–305) sobrescribe `--lagoon` con `config.theme.accentColor`. Y `COSTA_DEMO` en `src/lib/demo-data.ts` trae `accentColor: '#2AACA6'` (el valor viejo).

**Si solo se cambia `:root`, el preview seguirá viéndose con la paleta antigua.** Hay que:

1. Actualizar `COSTA_DEMO.theme.accentColor` → `#1F9B9B`.
2. Actualizar `COSTA_DEMO.dressCode.swatches` — hoy usan los hex viejos (`#FBF6EC`, `#2AACA6`, `#E8836B`).
3. Extender `buildThemeCSS` para derivar `--shallow` del accent con `color-mix()`, para que un accent personalizado no rompa los degradados:

```ts
function buildThemeCSS(theme?: CostaConfig['theme']): string {
  if (!theme?.accentColor) return '';
  return `:root {
    --lagoon: ${theme.accentColor};
    --shallow: color-mix(in oklab, ${theme.accentColor} 45%, white);
  }`;
}
```

### 2.3 Tipografía: fuera Cinzel, entra Fraunces

Reemplazar en las líneas 14–16.

```ts
import { Cormorant_Garamond, Jost, Fraunces } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],   // ← sin `weight`, ver nota
  variable: '--font-fraunces',
});
```

> **Gotcha de `next/font`:** cuando se pasa `axes`, **no** se puede pasar `weight` con valores estáticos — la fuente deja de ser variable y el build falla. Omitir `weight` para obtener el rango completo.

```css
.cs-heading {
  font-family: var(--font-fraunces), serif;
  font-variation-settings: 'SOFT' 60, 'WONK' 1, 'opsz' 48;
  letter-spacing: -0.01em;   /* antes 0.08em */
}
```

**Por qué Fraunces:** los ejes `SOFT` (redondeo de terminales) y `WONK` (variantes caligráficas irregulares) le dan carácter orgánico e imperfecto, que es exactamente lo contrario de la rigidez de Cinzel. Y el tracking negativo compacta los títulos en vez de estirarlos.

Actualizar también el `className` del contenedor raíz (líneas 537 y 557): `${cinzel.variable}` → `${fraunces.variable}`, y la var CSS `--font-cinzel` (línea 101) → `--font-fraunces`. Hay usos de `var(--font-cinzel)` en `.cs-cd-num` (167) y `.cs-dress-label` (227).

### 2.4 Textura de grano (SVG `feTurbulence`, 0 KB)

Overlay fijo, renderizado una sola vez, encima de todo menos del modal.

```jsx
<svg className="cs-grain" aria-hidden="true" focusable="false">
  <filter id="cs-grain-filter">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
  <rect width="100%" height="100%" filter="url(#cs-grain-filter)" />
</svg>
```

```css
.cs-grain {
  position: fixed; inset: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 50;               /* debajo del modal (200) y del botón de música (100) */
  opacity: 0.045;
  mix-blend-mode: multiply;
}
```

**Por qué:** un grano al 4.5% es el cambio de mayor relación esfuerzo/percepción que existe. Convierte la sensación de "web plana" en "impreso". Cuesta 0 KB de JS.

> **Si hay jank en móvil de gama baja:** `feTurbulence` a pantalla completa puede ser caro en el primer paint. Fallback: generar un tile de 128×128 en base64 y usarlo como `background-image` repetido. Medir antes de optimizar.

### 2.5 Manchas de acuarela

Filtro que desplaza una elipse con ruido, para manchas irregulares detrás de los títulos y en las esquinas de las secciones.

```jsx
<filter id="cs-watercolor">
  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="7" result="noise" />
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="55" xChannelSelector="R" yChannelSelector="G" />
  <feGaussianBlur stdDeviation="6" />
</filter>
```

Aplicar a `<ellipse>` rellenas con `--shallow` o `--coral-soft`, con `mix-blend-mode: multiply` y `opacity` entre 0.12 y 0.22. Variar el `seed` por instancia para que no se repita la misma forma.

**Dónde:** detrás del `h2` del countdown, en la esquina inferior izquierda de la sección de detalles, y sangrando desde el borde derecho en destino. **Nunca simétricas, nunca centradas.**

### 2.6 Máscaras orgánicas — el reemplazo de `CurveTop`

**Eliminar por completo `CurveTop` y sus llamadas.** Sustituir por tres mecanismos, alternados:

**(a) Sangrado por degradado** — la transición más discreta, para cuando dos secciones deban fluir:

```css
.cs-bleed-to-sand { background: linear-gradient(to bottom, var(--foam) 0%, var(--sand) 100%); height: 120px; }
```

**(b) Borde desgarrado con máscara SVG** — irregular, no una onda:

```css
.cs-torn {
  -webkit-mask-image: url("data:image/svg+xml,<svg .../>");
  mask-image: url("data:image/svg+xml,<svg .../>");
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
}
```

El path debe ser **asimétrico** y **distinto en cada uso** (mínimo 3 variantes). Una onda `C`-simétrica repetida es justo el problema actual.

**(c) Invasión — el mecanismo con más impacto:** un elemento de la sección A cruza físicamente el borde hacia la sección B (`margin-bottom` negativo + `z-index`). Ya existe el precedente en `.cs-parents-note` (181), que usa `top: -2.25rem`. Replicar ese gesto en al menos 3 transiciones más: una foto que cruza, un título que se parte entre dos fondos, una tarjeta de hotel que sobresale.

**Por qué:** los divisores de onda anuncian "aquí termina un bloque y empieza otro". La invasión hace lo contrario — cose las secciones y elimina la sensación de lista vertical.

---

## 3. Composición: 4 arquetipos de sección

**Eliminar el componente `Section` uniforme (333–352).** Definir cuatro y rotarlos sin repetir dos seguidos.

| Arquetipo | Descripción | Heading |
|---|---|---|
| **A — Full-bleed** | Foto a sangre completa con texto encima, alineado a un tercio | Sin `SectionHeading`; el texto es el heading |
| **B — Offset** | Título anclado a la izquierda con hairline vertical; contenido desplazado a la derecha | Heading rotado 90° o pegado al margen |
| **C — Editorial** | Dos columnas desiguales y desalineadas verticalmente (una arranca 4rem más abajo) | Heading dentro de la columna estrecha |
| **D — Centrado** | El actual. **Máximo 2 usos en toda la página** | `SectionHeading` clásico |

### Orden propuesto

```
hero (split, ya existe)
  ↓ invasión: la foto del hero cruza al countdown
countdown         → B offset
  ↓ sangrado por degradado
quote             → A full-bleed (ya lo es, conservar)
  ↓ borde desgarrado v1
itinerario        → C editorial + scroll horizontal con pin en desktop
  ↓ invasión: la nota de padres (conservar tal cual)
fotos (breakout)  → conservar, agregar máscaras de arco
  ↓ borde desgarrado v2
destino           → B offset
  ↓ sangrado
detalles          → C editorial
  ↓ borde desgarrado v3
no-niños          → D centrado (mini, sin heading block completo)
  ↓ invasión
footer + RSVP     → A full-bleed oscuro
```

`SectionHeading` (354–366) debe aceptar una prop `variant: 'centered' | 'offset' | 'vertical'` en lugar de renderizar siempre lo mismo.

---

## 4. Fotos

Reemplazar `.cs-photo` (213–214).

```css
/* Arco — para retratos verticales */
.cs-photo--arch {
  border-radius: 999px 999px 8px 8px / 45% 45% 2% 2%;
}
/* Óvalo suave — para paisajes */
.cs-photo--oval { border-radius: 50%; aspect-ratio: 4/3; }
/* Recta con sangrado — sin radius, cruzando el margen */
.cs-photo--bleed { border-radius: 0; margin-inline: -8vw; }
```

- Quitar el `box-shadow` uniforme. Sombra solo en las fotos que "flotan"; las que sangran no llevan.
- En `renderBlocks` (481–518) ya hay anchos alternados (`64%` / `78%`) y rotaciones — **conservar y ampliar**: agregar una tercera variante que cruce el borde del contenedor.
- Teñir al menos una foto con `background-blend-mode: multiply` sobre `--lagoon` para unificar la paleta.

---

## 5. Animación

Eliminar el uso universal de `fadeUp` (328–331). Definir un catálogo y asignar una variante por arquetipo:

| Variante | Uso |
|---|---|
| `fadeUp` | Conservar, pero solo para texto corrido |
| `maskReveal` | `clip-path: inset(100% 0 0 0)` → `inset(0)`. Para fotos |
| `slideIn` | Desde el margen. Para arquetipo B |
| `staggerChildren` | Listas: itinerario, swatches, hoteles |
| `drawLine` | `pathLength` de `motion` sobre un SVG. Para el hairline del timeline |

### Scroll-linked

- **Lenis** global (ver §6).
- **Itinerario horizontal con pin** en `>900px`: ya existe el layout horizontal en el media query de la línea 201. Falta convertirlo de `overflow-x: auto` (que nadie descubre) a un scroll horizontal manejado por `useScroll` + `useTransform` mientras la sección está pinneada.
- **Parallax del hero:** ya existe (400–401). Extenderlo con un segundo eje de velocidad distinta para el panel de texto.

---

## 6. Lenis (única dependencia nueva)

```bash
npm install lenis
```

Crear `src/hooks/useSmoothScroll.ts`:

```ts
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [enabled]);
}
```

En `CostaTemplate`:

```ts
useSmoothScroll(!isRsvpOpen);
```

**Por qué así:**
- `prefers-reduced-motion` — accesibilidad, y evita mareo.
- `!isRsvpOpen` — Lenis debe apagarse con el modal abierto o el scroll del backdrop se pelea con el del modal. **Es el bug más probable de esta integración.**
- Lenis usa scroll nativo, así que `useScroll` de `motion` sigue funcionando sin adaptador.

El hook es genérico a propósito: Classic y Elegance podrán usarlo después.

---

## 7. Prompts atómicos para Claude Code

Ejecutar en orden. Cada uno es independiente y verificable.

---

**Prompt 1 — Paleta y tipografía**

```
En src/components/templates/costa/CostaTemplate.tsx:

1. Reemplaza el bloque :root (líneas 92-103) con la paleta de la sección 2.1
   de REDISENO-COSTA.md. Agrega --wet-sand, --shallow y --coral-soft.
2. Sustituye la fuente Cinzel por Fraunces de next/font/google, usando
   axes: ['SOFT','WONK','opsz'] y SIN la prop weight (rompe el build si se
   pasan pesos estáticos junto con axes).
3. Renombra la variable CSS --font-cinzel a --font-fraunces en todos sus usos
   (.cs-heading, .cs-cd-num, .cs-dress-label) y en los className de las
   líneas 537 y 557.
4. En .cs-heading cambia letter-spacing de 0.08em a -0.01em y agrega
   font-variation-settings: 'SOFT' 60, 'WONK' 1, 'opsz' 48.

Además, en src/lib/demo-data.ts, dentro de COSTA_DEMO:
- theme.accentColor: '#2AACA6' → '#1F9B9B'
- dressCode.swatches: actualizar los tres hex a la paleta nueva.

Y en buildThemeCSS (línea 302), derivar también --shallow desde accentColor
con color-mix(in oklab, <accent> 45%, white).

Verifica con npm run build y revisa /plantillas/costa?plan=deluxe.
```

---

**Prompt 2 — Textura de grano y acuarela**

```
En CostaTemplate.tsx, agrega dos texturas SVG nativas (sin dependencias):

1. Overlay de grano global: un <svg> fijo con feTurbulence
   (type="fractalNoise", baseFrequency="0.85", numOctaves="4",
   stitchTiles="stitch") + feColorMatrix saturate="0", aplicado a un <rect>
   al 100%. CSS: position fixed, inset 0, pointer-events none, z-index 50,
   opacity 0.045, mix-blend-mode multiply.
   El z-index debe quedar POR DEBAJO del modal (200) y del botón de música (100).

2. Filtro de acuarela reutilizable: feTurbulence baseFrequency="0.012" +
   feDisplacementMap scale="55" + feGaussianBlur stdDeviation="6".
   Aplicarlo a elipses con --shallow o --coral-soft, opacity 0.12-0.22,
   mix-blend-mode multiply, en 3 posiciones asimétricas:
   - detrás del h2 del countdown
   - esquina inferior izquierda de la sección de detalles
   - sangrando desde el borde derecho en la sección de destino

   Usa un `seed` distinto en cada instancia para que las formas no se repitan.

No cambies ningún contenido ni lógica, solo agrega las capas decorativas.
```

---

**Prompt 3 — Eliminar las curvas divisoras**

```
En CostaTemplate.tsx, elimina el componente CurveTop (líneas 318-324) y todas
sus llamadas, incluida la que hace el componente Section internamente.

Reemplázalas por tres mecanismos alternados, sin repetir el mismo dos veces
seguidas:

(a) Sangrado por degradado: un div de ~120px con
    linear-gradient(to bottom, <color A>, <color B>).

(b) Borde desgarrado: mask-image con un SVG inline en data URI. El path debe
    ser ASIMÉTRICO y debes crear 3 variantes distintas. No uses curvas
    C simétricas (es el problema actual).

(c) Invasión: un elemento de la sección anterior cruza el borde hacia la
    siguiente usando margin negativo + z-index. Ya existe el precedente en
    .cs-parents-note (línea 181, top: -2.25rem). Aplícalo en 3 transiciones
    más: una foto que cruza, un título partido entre dos fondos, y una
    tarjeta de hotel que sobresale.

Conserva HeroCurve solo si el resultado se ve bien; si no, cámbialo por
invasión de la foto del hero hacia el countdown.
```

---

**Prompt 4 — Cuatro arquetipos de sección**

```
En CostaTemplate.tsx, elimina el componente Section uniforme (líneas 333-352),
que hoy produce el mismo layout en 6 de 7 bloques y es la causa principal de
que la plantilla se vea lineal.

Crea cuatro arquetipos:
- A FullBleed: foto a sangre con texto encima alineado a un tercio, sin
  SectionHeading.
- B Offset: título anclado al margen izquierdo con hairline vertical,
  contenido desplazado a la derecha.
- C Editorial: dos columnas desiguales y desalineadas verticalmente (una
  arranca ~4rem más abajo).
- D Centered: el layout actual. Máximo 2 usos en toda la página.

Asignación:
  countdown → B | quote → A (ya lo es) | itinerario → C | destino → B
  detalles → C | no-niños → D (mini) | footer+RSVP → A oscuro

Agrega a SectionHeading (líneas 354-366) una prop
variant: 'centered' | 'offset' | 'vertical' en vez de renderizar siempre
eyebrow + h2 + regla centrados.

NO toques: la lógica de getCapabilities, los condicionales de sección
(config.sections?.*), ni el contenido. Solo la composición.
```

---

**Prompt 5 — Fotos**

```
En CostaTemplate.tsx, reemplaza .cs-photo (líneas 213-214), que hoy usa
border-radius: 10px + box-shadow idéntico en todas las fotos y las hace
parecer cards de dashboard.

Crea tres tratamientos:
- .cs-photo--arch: border-radius: 999px 999px 8px 8px / 45% 45% 2% 2%
- .cs-photo--oval: border-radius 50%, aspect-ratio 4/3
- .cs-photo--bleed: sin radius, margin-inline: -8vw

Quita el box-shadow uniforme: solo las fotos que "flotan" lo llevan.

En renderBlocks (líneas 481-518) ya hay anchos alternados 64%/78% y
rotaciones — consérvalos y agrega una tercera variante que cruce el borde
del contenedor.

Aplica background-blend-mode: multiply sobre --lagoon a una sola foto para
unificar la paleta.

Conserva .cs-photo-breakout (línea 210) tal cual: es lo mejor del archivo.
```

---

**Prompt 6 — Lenis**

```
1. npm install lenis
2. Crea src/hooks/useSmoothScroll.ts con el código de la sección 6 de
   REDISENO-COSTA.md. Requisitos no negociables:
   - 'use client'
   - Early return si prefers-reduced-motion: reduce
   - Cleanup de requestAnimationFrame y lenis.destroy()
   - Recibe un flag `enabled`
3. En CostaTemplate, llamarlo como useSmoothScroll(!isRsvpOpen).
   Es obligatorio apagarlo con el modal abierto: si no, el scroll del backdrop
   compite con el del modal.

El hook debe ser genérico para reutilizarlo luego en Classic y Elegance.
No lo acoples a Costa.
```

---

**Prompt 7 — Animaciones**

```
En CostaTemplate.tsx, hoy la variante fadeUp (líneas 328-331) se usa en
absolutamente todos los reveals. Diversifica:

- fadeUp: solo texto corrido.
- maskReveal: clip-path inset(100% 0 0 0) → inset(0). Para fotos.
- slideIn: desde el margen. Para el arquetipo B.
- staggerChildren: listas (itinerario, swatches, hoteles).
- drawLine: pathLength de motion sobre SVG, para el hairline del timeline.

Además, convierte el itinerario horizontal de desktop (media query de la
línea 201) de overflow-x: auto —que nadie descubre— a un scroll horizontal
scroll-linked con useScroll + useTransform mientras la sección está pinneada.
Mantén el layout vertical en móvil sin cambios.

Extiende el parallax del hero (líneas 400-401) con un segundo eje de
velocidad distinta para el panel de texto.
```

---

## 8. Restricciones — no tocar

Del `template-factory.md` y del contrato actual:

1. **No modificar la lógica de RSVP** ni el payload de `POST /api/rsvp` (líneas 449–475).
2. **No cambiar la interfaz `CostaConfig`** (32–73). Es la que consume el superadmin y `demo-data.ts`.
3. **No quitar `ContentProtection`** (536, 556).
4. **No fijar el plan.** Todos los condicionales siguen pasando por `caps = getCapabilities(planProp)`.
5. **No crear archivos CSS separados** ni tocar `globals.css`. Todo el estilo vive en el template string `css` del componente.
6. **No agregar dependencias** más allá de `lenis`.
7. **No romper `FloatingPlanSwitcher`** en `/plantillas/costa`.

---

## 9. Checklist de verificación

- [ ] `npm run build` sin errores ni warnings nuevos
- [ ] `/plantillas/costa?plan=essential` — sin countdown, sin música, sin loader, RSVP por WhatsApp
- [ ] `/plantillas/costa?plan=plus` — countdown visible, modal manual con stepper de acompañantes
- [ ] `/plantillas/costa?plan=deluxe` — loader con ripple, música, modal con datos precargados
- [ ] Responsive verificado en 375px / 768px / 1440px
- [ ] El grano no tapa el modal de RSVP ni el botón de música (z-index 50 < 100 < 200)
- [ ] Con el modal abierto, el fondo no hace scroll (Lenis apagado)
- [ ] `prefers-reduced-motion: reduce` desactiva Lenis y las animaciones de scroll
- [ ] Ninguna transición entre secciones usa el mismo mecanismo dos veces seguidas
- [ ] El arquetipo D (centrado) aparece como máximo 2 veces
- [ ] Los swatches del dress code coinciden con la paleta nueva
- [ ] Lighthouse móvil: performance no baja más de 5 puntos respecto a la versión actual

---

## 10. Fuera de alcance (posibles siguientes pasos)

- Las imágenes se renderizan con `<img>` crudo, no con `next/image`. Migrarlas daría LCP y peso, pero es un cambio transversal a las 3 plantillas — merece su propio ticket.
- El template string `css` (líneas 91–297, ~200 líneas) inyectado con `dangerouslySetInnerHTML` empieza a ser difícil de mantener. Si crece más con este rediseño, evaluar partirlo en constantes por sección dentro del mismo archivo (el skill prohíbe archivos CSS separados).
- Portar el sistema de arquetipos y el grano a Classic y Elegance, una vez validado en Costa.
