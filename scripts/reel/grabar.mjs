/**
 * Graba el reel de 2 columnas.
 *
 * Requisitos previos:
 *   1. npm run dev   (en otra terminal, servidor en localhost:3000)
 *   2. npm i -D playwright && npx playwright install chromium
 *
 * Uso:
 *   node scripts/reel/grabar.mjs
 *
 * Salida:
 *   scripts/reel/salida/reel.webm  (crudo, de Playwright)
 *   scripts/reel/salida/reel.mp4   (listo para Instagram)
 */

import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'salida');

const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION_MS = 35_300;      // 34.8s de timeline + medio segundo de cola
const BASE = 'http://localhost:3000';

// OJO: Next sirve public/ como estáticos pero NO resuelve el index.html de un
// directorio. Hay que pedir el archivo completo, o /reel/ cae en el 404 del router.
const URL = `${BASE}/reel/index.html`;

// Plantillas que se precalientan antes de grabar (en dev, Next compila bajo demanda)
const PRECALENTAR = [
  '/plantillas/costa?plan=deluxe&ui=hidden',
  '/plantillas/deluxe?plan=deluxe&ui=hidden',
  '/plantillas/classic-elegance?plan=deluxe&ui=hidden',
];

mkdirSync(OUT, { recursive: true });

console.log('▶ Lanzando navegador…');

const browser = await chromium.launch({
  args: ['--autoplay-policy=no-user-gesture-required', '--font-render-hinting=none'],
});

/* ------------------------------------------------------------------
   PASO 1 — Precalentar las plantillas SIN grabar.
   En dev, Next compila cada ruta la primera vez que se pide. Si eso pasa
   durante la grabación, el video arranca con pantallas en blanco.
------------------------------------------------------------------- */
{
  const warm = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const wp = await warm.newPage();
  for (const ruta of PRECALENTAR) {
    process.stdout.write(`▶ Compilando ${ruta.split('?')[0]}… `);
    try {
      await wp.goto(BASE + ruta, { waitUntil: 'load', timeout: 120_000 });
      console.log('ok');
    } catch {
      console.log('lento (continuo)');
    }
  }
  await warm.close();
}

/* ------------------------------------------------------------------
   PASO 2 — Grabar la composición
------------------------------------------------------------------- */
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT, size: { width: WIDTH, height: HEIGHT } },
});

const page = await context.newPage();

console.log('▶ Cargando composición…');
let resp;
try {
  // 'load' en vez de 'networkidle': el websocket de HMR de Next nunca queda inactivo
  resp = await page.goto(URL, { waitUntil: 'load', timeout: 60_000 });
} catch {
  console.error('✗ No se pudo abrir', URL, '\n  ¿Está corriendo `npm run dev`?');
  await browser.close();
  process.exit(1);
}

if (!resp || !resp.ok()) {
  console.error(`✗ ${URL} respondió ${resp ? resp.status() : 'sin respuesta'}.`);
  console.error('  Verifica que exista public/reel/index.html');
  await browser.close();
  process.exit(1);
}

// Confirma que cargó la composición y no el 404 de Next
const esComposicion = await page.evaluate(() => typeof window.startTimeline === 'function');
if (!esComposicion) {
  console.error('✗ La página cargó pero no es la composición del reel.');
  console.error('  Probablemente estás viendo el 404 de Next. La URL debe terminar en /index.html');
  await browser.close();
  process.exit(1);
}

// Espera a que los 3 iframes carguen (ya precalentados, debería ser rápido)
try {
  await page.waitForFunction(() => window.__reelReady === true, { timeout: 90_000 });
} catch {
  const p = await page.evaluate(() => window.__reelProgress);
  console.error(`✗ Los iframes no terminaron de cargar (${p?.cargados ?? 0}/${p?.total ?? 3}).`);
  await browser.close();
  process.exit(1);
}

console.log('▶ Iframes listos. Grabando 29 s…');

await page.evaluate(() => window.startTimeline());
await page.waitForTimeout(DURATION_MS);

await context.close();   // cerrar el contexto es lo que finaliza el video
await browser.close();

// Playwright nombra el archivo con un hash: renombrar a algo predecible
const webm = readdirSync(OUT).find((f) => f.endsWith('.webm'));
if (!webm) {
  console.error('✗ No se generó el video.');
  process.exit(1);
}
const rawPath = join(OUT, 'reel.webm');
renameSync(join(OUT, webm), rawPath);
console.log('✓ Video crudo:', rawPath);

// Conversión a MP4 (H.264 + yuv420p = máxima compatibilidad con Instagram)
console.log('▶ Convirtiendo a MP4…');
try {
  execSync(
    `ffmpeg -y -i "${rawPath}" ` +
    `-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 ` +
    `-vf "scale=${WIDTH}:${HEIGHT}:flags=lanczos" ` +
    `-movflags +faststart "${join(OUT, 'reel.mp4')}"`,
    { stdio: 'inherit' },
  );
  console.log('\n✓ Listo:', join(OUT, 'reel.mp4'));
  console.log('  Súbelo a CapCut/Canva para agregar música y publícalo.');
} catch {
  console.warn('⚠ ffmpeg no disponible. Usa el .webm y conviértelo en tu editor.');
}
