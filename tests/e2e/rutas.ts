import { existsSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

// `process.cwd()` y no `import.meta.url`: el package.json no declara
// "type": "module", así que Playwright transpila estos tests a CommonJS y
// `import.meta` revienta al cargarlos. Playwright ejecuta desde la raíz del
// proyecto, que es donde vive playwright.config.ts.
const DIST = resolve(process.cwd(), 'dist');

/**
 * Las rutas a probar se derivan del `dist/` construido, no de una lista escrita a
 * mano: así una página nueva entra en el smoke sin que nadie se acuerde de
 * añadirla, que es exactamente el olvido que estos tests existen para atrapar.
 *
 * Astro construye en formato directorio (`/servicios/index.html`), así que cada
 * index.html es una ruta servible.
 */
function buscarHtml(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) return buscarHtml(ruta);
    return entrada.name === 'index.html' ? [ruta] : [];
  });
}

export function rutasConstruidas(): string[] {
  if (!existsSync(DIST)) {
    throw new Error(
      `No existe ${DIST}. Los tests corren contra el build: ejecuta "npm run build" ` +
        `o lanza "npm run test:e2e", que lo construye antes de arrancar el preview.`,
    );
  }

  const rutas = buscarHtml(DIST).map((archivo) => {
    const dirRelativo = relative(DIST, archivo).split(sep).slice(0, -1);
    return dirRelativo.length === 0 ? '/' : `/${dirRelativo.join('/')}/`;
  });
  return rutas.sort();
}

/** `/servicios/` y `/servicios` son la misma página; el canonical elige una. */
export function normalizar(ruta: string): string {
  return ruta === '/' ? '/' : ruta.replace(/\/+$/, '');
}

export const SITE_URL = 'https://phsport.es';
