# Plan de lanzamiento en Instagram — Moments (@code4u_mx)

## Formato principal: Reel, no post estático

IG en 2026 empuja Reels muy por encima de posts estáticos en alcance, y con Moments tienes el mejor tipo de contenido posible para reel: **scroll a través de una invitación real**. Las tres plantillas son capturas de página completa (no solo el viewport), así que se prestan perfecto para un screen-recording de scroll suave.

Recomendación: el Reel es la pieza hero. El carrusel es contenido de respaldo/fijado en el perfil. Las historias amplifican ambos.

---

## Reel (pieza principal) — formato de 2 columnas

Layout: columna izquierda con texto que va cambiando, columna derecha con un mockup de celular reproduciendo el screen-recording de la invitación. Es el formato correcto para esta audiencia: la mayoría ve Reels sin sonido, así que el texto tiene que cargar el mensaje solo, sin depender del caption ni del audio.

**Duración:** 15–18 segundos. El texto necesita un instante para leerse, así que va un poco más lento que un reel de puro scroll.

**Regla de sincronía:** el texto de la izquierda cambia **justo antes** de que el celular llegue a esa sección — nunca después. Si el texto llega tarde, se siente como subtítulo mal sincronizado.

**Guion, beat por beat:**

| Tiempo | Celular (derecha) | Columna izquierda |
|--------|--------------------|---------------------|
| 0–3s | Portada de Costa, nombres apareciendo | Texto: "Así se ve una invitación de boda en 2026." |
| 3–6s | Scroll a cuenta regresiva / itinerario / mapa | Texto: "Itinerario, mapa y cuenta regresiva — todo en un link." |
| **6–10s** | **Invitado toca "Confirmar asistencia" y llena el modal** | **⚡ CAMBIA A PANEL: el dashboard con el contador saltando 47 → 48 confirmados** |
| 10–13s | Corte: Classic y Elegance | Texto: "3 colecciones. Cualquiera funciona con cualquier plan." |
| 13–16s | Pantalla de cierre / wordmark | Texto: "Desde $699 MXN. Publica hasta 2 meses antes de tu boda." |
| 16–18s | Wordmark "moments" | Texto: "Link en bio." |

### El beat de 6–10s es el más importante del reel

Es la única toma que muestra **causa y efecto simultáneo**: el invitado confirma en el celular, y el contador del organizador sube en vivo del otro lado. Comunica el producto completo en 4 segundos y es lo que diferencia a Moments de cualquiera vendiendo plantillas.

- Los datos son reales: `src/lib/rsvpStats.ts` ya calcula confirmados / pendientes / declinados a nivel persona, además de invitaciones respondidas vs. no respondidas. No hay que inventar la cifra.
- Sincroniza el salto del contador **exactamente** con el tap de confirmación. Si hay retraso, se pierde la relación causa-efecto y se lee como dos cosas sin conexión.
- Texto sugerido encima del panel, chico y discreto: *"Tú lo ves al instante."*

**Lo que NO va en este beat:** lista de eventos, editor de precios, configuración, gestión de invitados. Un recorrido del panel se come 6 segundos y nadie lo procesa. Solo el contador subiendo. Todo lo demás va al Post 2.

**Estilo del texto (columna izquierda):** usa la paleta del sitio para que se sienta el mismo producto — fondo charcoal (`#1C1611`), texto en ivory (`#FAF7F2`), la palabra clave de cada línea en dorado (`#B8965A`). Tipografía: Cormorant Garamond para el texto grande, Jost para cualquier detalle pequeño (precio, "link en bio") — son las mismas fuentes del sitio, así que el reel se ve como una extensión de la marca, no como un anuncio genérico.

**Producción del mockup de celular:**
- No grabes el scroll a mano con el mouse — se ve entrecortado. Si quieres, te ayudo a generar el screen-recording con un scroll parejo y controlado por script (usando el navegador del workspace), y te entrego el video en bruto listo para meter al mockup.
- Para el marco del celular: Figma tiene mockups gratuitos de iPhone que aceptan video de fondo: busca "phone mockup video" en Community. CapCut y Canva también traen frames de celular compatibles con clips.
- Graba en el viewport móvil real (390×844 o similar) para que el contenido llene el marco sin distorsión — las capturas ya guardadas (`classic.jpg`, `elegance.jpg`, `costa.jpg`) sirven de referencia de encuadre pero son estáticas; para el reel necesitas el video del scroll, no la imagen fija.

**Audio:** aunque el texto carga el mensaje, deja música de fondo suave (piano/strings) para el % de gente que sí escucha — instrumental, sin voz, que no compita con el texto en pantalla.

**Caption del Reel:**

> Construimos Moments: invitaciones de boda digitales con RSVP en tiempo real, itinerario animado y panel de control para el organizador. Nada de imprimir, nada de perseguir confirmaciones por WhatsApp una por una.
>
> 3 colecciones de diseño, 3 planes, desde $699 MXN pago único.
>
> Link en bio para ver las demos completas.

---

## Carrusel (post fijado / respaldo)

**Slide 1 — Portada/hook**
Imagen: Costa a pantalla completa, sin texto encima o mínimo.
Overlay: "Invitaciones de boda digitales, hechas por code4u"

**Slide 2 — Las 3 colecciones**
Las tres capturas (`classic.jpg`, `elegance.jpg`, `costa.jpg`) lado a lado o en grid 3-up.
Overlay: "Classic · Elegance · Costa — cada colección funciona con cualquier plan"

**Slide 3 — Qué resuelve**
Fondo simple (charcoal o ivory de la marca), 3–4 líneas de texto, no más:
- RSVP con conteo automático de confirmados
- Itinerario, ubicación y dress code en un solo link
- Comparten por WhatsApp, sin apps ni impresiones
- Panel de control para el organizador

**Slide 4 — Planes y precio**
Tabla simple de 3 columnas: Essential $699 · Plus $1,199 (marcar como el recomendado) · Deluxe $1,499. Nota abajo: "Pago único · publica hasta 2 meses antes de tu evento".

**Slide 5 — CTA**
Fondo oscuro, wordmark grande, "Ve las demos en vivo → link en bio" + ícono de WhatsApp con "o escríbenos directo".

**Caption del carrusel:** el mismo texto del Reel, puedes repetirlo — la gente rara vez ve ambos.

---

## Historias (día de lanzamiento)

Secuencia de 5, subidas con unos minutos de diferencia entre cada una para que el algoritmo las trate como contenido fresco, no como un solo bloque:

1. **Anuncio.** Reposteas el Reel/carrusel con sticker "NUEVO" o "Recién lanzado". Texto: "Después de meses trabajando en esto — Moments ya está aquí 👀"

2. **Sticker de encuesta.** Muestra las 3 plantillas en una imagen y pon encuesta: "¿Cuál te gusta más? Classic 🖤 vs Elegance 🤍" (o las 3 con sticker de cuestionario si prefieres). Esto es lo que más engagement real genera en historias — la gente vota.

3. **Detrás de cámara / proceso.** Un screenshot del panel de admin (RSVP dashboard) o del código si quieres mantener el ángulo "estudio técnico". Texto: "Cada invitación tiene su propio panel de confirmaciones en tiempo real."

4. **Prueba social / autenticidad.** Si tienes una boda demo montada con fotos reales, muéstrala aquí — es más creíble que el mockup con nombres genéricos.

5. **CTA final con sticker de link.** "Cotiza la tuya" con el sticker de link apuntando al sitio o directo a `/cotizar`. Guarda esta historia en un Highlight llamado **"Moments"** — así cualquiera que llegue al perfil después puede verla sin que se pierda a las 24h.

---

## Hashtags (carrusel y Reel, no en historias)

Mezcla de nicho + genéricos, 8–12 máximo (más que eso diluye alcance):

`#bodasmexico #invitacionesdigitales #bodasdigitales #rsvp #diseñoweb #bodas2026 #codigo4u #invitacionesdeboda #weddinginvitation #savethedateweb`

Ajusta `#bodas[ciudad]` si tienes una plaza objetivo (ej. `#bodasmonterrey`, `#bodascdmx`).

---

## Timing

- Publica el Reel entre 7–9pm hora local — es cuando más se navega Instagram por ocio, que es el estado mental correcto para contenido de bodas (decisión emocional, no urgente).
- Evita fin de semana para el lanzamiento inicial (la audiencia de code4u es más profesional/weekday); pero si luego haces contenido dirigido a novias, sábado por la mañana funciona mejor para esa audiencia.
- Historias: todas el mismo día del lanzamiento, espaciadas 15–30 min.

---

## Post 2 — "Lo que no se ve" (2–3 días después)

El reel de lanzamiento solo muestra **un** momento del panel (el contador subiendo). Todo lo demás del sistema merece su propia publicación, y esa va dirigida específicamente a la audiencia de code4u: founders, devs, gente que puede contratarte para construir algo.

**Formato:** carrusel de capturas, o reel con mockup de laptop (aquí el desktop sí encaja, porque ya no compite con el celular).

**Qué mostrar:**
- Dashboard de confirmaciones: confirmados / pendientes / declinaron, a nivel persona y a nivel invitación
- Gestión de lista de invitados con importación desde CSV
- Links únicos por invitado (plan Deluxe) y herramienta de reenvío
- Control de cupo por persona

**Ángulo del caption:** no vendas la invitación aquí, vende el sistema. Algo como:

> Detrás de cada invitación de Moments hay un panel completo: control de acceso por roles, confirmaciones en tiempo real, importación de listas, links únicos por invitado.
>
> No es una plantilla — es una plataforma. Next.js, Supabase con RLS, y un modelo de permisos que separa al organizador del wedding planner.
>
> ¿Necesitas algo así para tu negocio? Escríbenos.

Ese último renglón es el que convierte este post en generación de leads para code4u, no solo promoción de Moments.

---

## Después del lanzamiento

- Si el Reel funciona, repite el formato con Classic y Elegance como piezas separadas en los días siguientes — no metas las 3 en una sola pieza y ya, dan para 3 publicaciones.
- Considera un Reel de "antes y después": invitación de papel vs. Moments, comparando el proceso de RSVP. Ese ángulo (dolor real: perseguir confirmaciones) suele convertir mejor que mostrar solo el diseño.
- Cuando tengas la primera boda real publicada (con permiso de la pareja), ese testimonio vale más que cualquier mockup — súbelo en cuanto puedas.
