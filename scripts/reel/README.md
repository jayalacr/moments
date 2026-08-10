# Generador del Reel de 2 columnas

Genera el video de lanzamiento: columna de texto a la izquierda, mockup de celular
con la invitación a la derecha, y el momento de RSVP con el contador subiendo.

## Cómo funciona

En vez de componer el video con ffmpeg (frágil y difícil de sincronizar), **toda la
composición es una página HTML** que se graba con Playwright:

- `public/reel/index.html` — el lienzo de 1080×1920 con las dos columnas
- La invitación va en un `<iframe>` apuntando a las demos locales
- Un timeline en JS mueve el scroll del iframe y cambia el texto **en el mismo reloj**,
  así la sincronía es exacta por construcción
- Playwright graba la página completa a 1080×1920

Como el iframe y la página comparten origen (`localhost:3000`), el JS puede controlar
el scroll interno. Por eso la composición vive en `public/`, no en un archivo suelto.

## Requisitos

```bash
npm i -D playwright
npx playwright install chromium
```

`ffmpeg` para la conversión a MP4 (opcional pero recomendado):

```bash
brew install ffmpeg
```

## Uso

```bash
# Terminal 1
npm run dev

# Terminal 2
node scripts/reel/grabar.mjs
```

Salida en `scripts/reel/salida/reel.mp4`, listo para Instagram.

## Ajustes

### Cambiar la línea de tiempo

En `public/reel/index.html`, la constante `TIMELINE`:

```js
{ t: 6.0, beat:2, frame:'costa', scrollTo:0.72, rsvp:true }
```

- `t` — segundo en que arranca el beat
- `beat` — qué bloque de texto se muestra (`data-beat` en el HTML)
- `frame` — qué plantilla se ve: `costa`, `classic` o `elegance`
- `scrollTo` — posición del scroll, de `0` (arriba) a `1` (final)
- `rsvp` — dispara la animación del contador

### Cambiar los textos

Cada bloque `.beat` en el HTML. Usan las tipografías y colores reales del sitio
(Cormorant Garamond + Jost, paleta charcoal/ivory/gold), así que el reel se ve como
extensión de la marca y no como un anuncio genérico.

### Ajustar el scroll a las secciones exactas

Los valores de `scrollTo` son aproximados. Para afinarlos, abre
`http://localhost:3000/plantillas/costa?plan=deluxe&ui=hidden` en un viewport de
390×844, desplázate a la sección que quieres y calcula
`window.scrollY / (document.body.scrollHeight - window.innerHeight)`.

## Problemas comunes

**`waitForFunction: Timeout` / la página carga pero no pasa nada**
La URL debe ser `/reel/index.html`, no `/reel/`. Next sirve `public/` como estáticos
pero no resuelve el índice de un directorio, así que `/reel/` cae en el 404 del router:
la página carga bien (por eso `goto` no falla) pero no existe el script del reel.

**Los iframes tardan muchísimo la primera vez**
Normal en `npm run dev`: Next compila cada ruta bajo demanda. El script ya precalienta
las tres plantillas antes de grabar. Si aun así va lento, corre `npm run build && npm start`
en vez de `npm run dev` — compila una sola vez y el render es más fluido, que además
se nota en la calidad del scroll.

**El video sale con pantallas en blanco al inicio**
Se está grabando mientras Next todavía compila. Corre el script dos veces: la segunda
ya encuentra todo compilado en caché.

## Notas

- **El panel de confirmaciones está simulado** en el HTML (recreado con la estética
  real del admin). Se hizo así para no exponer datos de clientes ni requerir sesión.
  Si prefieres el panel real, graba esa parte por separado con sesión iniciada y
  sustituye el bloque `.panel`.
- El reel sale **sin audio**. Agrega la música en CapCut, Canva o el editor de
  Instagram — conviene elegir un audio en tendencia dentro de la app para que el
  algoritmo lo favorezca.
- Si el scroll se ve entrecortado, baja el `crf` a 16 o sube la duración de cada beat.
