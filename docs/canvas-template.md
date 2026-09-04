# Plantilla Canvas

## Qué es

Las plantillas de boda (Classic, Elegance, Costa, Jardín) son secciones con CSS hardcodeado — el diseño vive en el código. Canvas es lo opuesto: **el diseño es una imagen**, y el código solo coloca texto encima en coordenadas porcentuales. Sirve para cualquier temática (fiesta infantil, bautizo, XV) cambiando el arte y los `slots` del `config`, sin tocar el componente.

Nace de un caso concreto: recrear una invitación tipo Canva/udois para una fiesta infantil, donde no hay secciones (itinerario, dress code, etc.) — solo una tarjeta con texto sobre una ilustración.

## Arquitectura

- `src/components/templates/canvas/CanvasTemplate.tsx` — el motor, ~330 líneas
- `src/lib/demo-data.ts` → `CANVAS_DEMO` — ejemplo con arte real (fiesta de "Alicia")
- `src/app/plantillas/canvas/page.tsx` — preview con selector de plan
- `src/lib/templates.ts` → registrado como `'canvas'`
- `public/templates/canvas/` — arte del demo (en producción va a Cloudinary, igual que las fotos de boda)

### Config

```ts
interface CanvasScreen {
  art: string;              // URL del arte (retrato)
  aspect: string;            // '1092 / 1440' — debe ser el aspecto real del arte
  slots: CanvasSlot[];       // textos posicionados en % del lienzo
  ctaAt?: { x, y, size };    // botón de confirmación embebido en el lienzo
  desktop?: CanvasView;      // arte + slots alternativos para pantallas anchas (≥900px)
}

interface CanvasSlot {
  text: string;              // admite \n; {invitado} se sustituye por el nombre del invitado
  x, y: number;               // % del lienzo (centro del bloque)
  size: number;               // tamaño de fuente en cqw (escala con el ancho del contenedor)
  font, color, weight, italic, letterSpacing, lineHeight, width, align, rotate;
}
```

El texto escala con `cqw` (container query units) vía `container-type: inline-size`, así que la tipografía mantiene su proporción exacta con el arte en cualquier ancho de pantalla — sin breakpoints.

### RSVP

Reutiliza `/api/rsvp` y la misma lógica de `JardinTemplate`: WhatsApp en Essential, modal con stepper en Plus, modal con acompañantes precargados por token en Deluxe. El botón (`ctaAt`) puede vivir **dentro** del lienzo (ancla en % + `cqw`, escala junto con el arte) o, si ninguna vista lo declara, cae a un botón externo debajo de la tarjeta.

### Móvil vs. desktop

Un arte vertical no se ve bien estirado en pantallas anchas. `CanvasScreen.desktop` permite una segunda imagen (horizontal) con sus propios `slots` — en landscape el texto casi nunca va en la misma posición que en retrato. El swap es puro CSS (`@media (min-width: 900px)`), y la variante oculta no se descarga (`loading="lazy"`).

## Flujo de trabajo con arte generado por IA

1. **El arte se pide SIN texto.** Todo lo escrito lo pone el código — es lo que cambia por cliente y lo que se personaliza con `{invitado}`.
2. **Dos imágenes por invitación:** vertical (1080×1350, relación 4:5) y horizontal (1920×1080, relación 16:9), mismo estilo y paleta entre ambas.
3. **Zona central despejada:** el rectángulo central (~12%–88% x, 15%–82% y en vertical; ~28%–72% x, 15%–88% y en horizontal) debe quedar vacío — solo textura de fondo, sin personajes ni objetos.
4. **Personajes originales, no de franquicias con copyright** (ver nota legal abajo).
5. Se guardan en `public/templates/canvas/<evento>-movil.jpg` y `-desktop.jpg` (optimizadas a JPEG progresivo, no el PNG crudo del generador — de 2.6 MB bajó a 349 KB).
6. **Los textos se centran en `x: 50`** (centro geométrico de la tarjeta), no en el centro del hueco de papel — el ojo del usuario compara contra los bordes de la tarjeta, no contra dónde el arte dejó espacio libre. Solo se corrige si un personaje invade el centro, y ahí la solución correcta es pedir el arte con más margen, no descuadrar el texto.

### Prompts usados (con referencia de imagen adjunta)

Base para pedirle a un generador que recree la composición de una referencia sin copiar personajes con copyright:

> Usa la imagen adjunta como referencia visual exacta. Recrea la composición, encuadre, paleta y técnica idénticas. Cambia únicamente los personajes por unos originales con el mismo espíritu. El centro de la imagen (55% central) debe quedar completamente vacío — solo textura de fondo. Sin texto, sin letras, sin números, en ninguna parte.

Luego se pide la variante horizontal en el mismo chat, con *"mismos personajes, mismo estilo, ahora en 16:9, reagrupados en dos racimos a los costados"*, para mantener continuidad visual entre las dos.

## Decisiones y pendientes

- **No se construyó un editor visual de slots.** Hoy posicionar el texto es manual (leer el arte, ajustar `x/y/size` a ojo, verificar con captura de pantalla). Un editor drag-and-drop en `/superadmin` es la mejora obvia, pero se pospuso a propósito — se paga solo hasta la tercera o cuarta invitación Canvas vendida, no antes.
- **El arte del demo actual (Monsters Inc-style) es solo de prueba.** Sirvió para validar el mecanismo (escalado, RSVP, doble formato), pero tiene personajes con copyright — no es vendible tal cual. Dos caminos para producción:
  - Arte propio para catálogo (`/plantillas`), generado con personajes originales o encargado a un ilustrador (~$30–60 USD por estilo).
  - Flujo "el cliente sube su arte" — el cliente trae la imagen que ya compró/generó, y Moments solo le agrega texto + RSVP interactivo encima. Evita el problema de licencias porque la responsabilidad del arte es del cliente.
- **Overlays para las plantillas de boda existentes** (Classic, Elegance, Costa, Jardín): se propuso como mejora de bajo costo — que el `config` acepte imágenes decorativas (texturas, florituras, dividers) sin tocar el CSS del componente — pero no se implementó en esta sesión.
- **Sin cuenta regresiva, música ni mapa en Canvas** por ahora — el formato de una sola tarjeta no los pide. Se agregarían como bloques adicionales bajo el lienzo si un cliente los necesita.
- **Sin campo de dietary/alergias** (sí existe en Jardín). Pendiente decidir si aplica a fiestas infantiles.

## Verificación

Cada iteración de posicionamiento se validó con capturas Playwright en 390×844 (móvil) y 1280×900 (desktop) contra `/plantillas/canvas`, más un recorrido del flujo de RSVP completo (abrir modal → confirmar → acompañantes precargados → enviar). `npm run lint` y `tsc --noEmit` limpios.
