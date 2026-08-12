import { test, expect, type Page } from '@playwright/test';
import { rutasConstruidas, normalizar, SITE_URL } from './rutas';

const RUTAS = rutasConstruidas();

/**
 * Warnings que el proyecto emite a propósito y no son un fallo. Se listan uno a
 * uno en vez de silenciar la consola entera: si mañana aparece un error nuevo,
 * tiene que hacer fallar el test.
 */
const CONSOLA_ESPERADA = [
  // <meta name="apple-mobile-web-app-capable"> está deprecado, pero iOS aún lo
  // lee y por eso se mantiene junto al estándar (ver BaseLayout.astro).
  /apple-mobile-web-app-capable/i,
];

function vigilarConsola(page: Page) {
  const problemas: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const texto = msg.text();
    if (CONSOLA_ESPERADA.some((patron) => patron.test(texto))) return;
    problemas.push(`console.error: ${texto}`);
  });

  page.on('pageerror', (err) => problemas.push(`excepción: ${err.message}`));

  page.on('response', (res) => {
    if (res.status() >= 400) problemas.push(`HTTP ${res.status()}: ${res.url()}`);
  });

  return problemas;
}

test('el build genera las 12 páginas declaradas', () => {
  expect(RUTAS).toHaveLength(12);
});

for (const ruta of RUTAS) {
  test.describe(`página ${ruta}`, () => {
    test('carga sin errores y con el marcado esencial', async ({ page }) => {
      const problemas = vigilarConsola(page);

      const respuesta = await page.goto(ruta, { waitUntil: 'load' });
      expect(respuesta?.status()).toBe(200);

      await expect(page).toHaveTitle(/\S/);

      // El idioma del documento decide qué voz sintetiza un lector de pantalla
      // y cómo indexa Google. /en/* en inglés, el resto en español.
      const esIngles = ruta.startsWith('/en/');
      await expect(page.locator('html')).toHaveAttribute('lang', esIngles ? 'en' : 'es');

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, 'falta el canonical').toBeTruthy();
      expect(canonical!.startsWith(SITE_URL), `canonical no absoluto: ${canonical}`).toBe(true);
      expect(normalizar(new URL(canonical!).pathname)).toBe(normalizar(ruta));

      expect(problemas, `problemas en ${ruta}`).toEqual([]);
    });

    test('declara hreflang recíproco', async ({ page }) => {
      await page.goto(ruta);

      const es = await page.locator('link[hreflang="es"]').getAttribute('href');
      const en = await page.locator('link[hreflang="en"]').getAttribute('href');
      const xDefault = await page.locator('link[hreflang="x-default"]').getAttribute('href');

      expect(es, 'falta hreflang es').toBeTruthy();
      expect(en, 'falta hreflang en').toBeTruthy();
      // x-default manda a la versión española para quien no es ni es ni en.
      expect(xDefault).toBe(es);

      // La alternativa tiene que ser una página que exista de verdad. Cuando una
      // ruta no está en STATIC_ROUTES, getAlternateLangUrl() devuelve '/' en
      // silencio (el aviso solo salta en dev): esto lo caza en el build.
      const propia = ruta.startsWith('/en/') ? en : es;
      const alterna = ruta.startsWith('/en/') ? es : en;
      expect(normalizar(new URL(propia!).pathname)).toBe(normalizar(ruta));

      const rutaAlterna = new URL(alterna!).pathname;
      expect(
        RUTAS.some((r) => normalizar(r) === normalizar(rutaAlterna)),
        `${ruta} apunta a ${rutaAlterna}, que no existe en el build`,
      ).toBe(true);

      // Ida y vuelta: la página alternativa debe señalar de vuelta a esta.
      await page.goto(rutaAlterna);
      const deVuelta = ruta.startsWith('/en/')
        ? await page.locator('link[hreflang="en"]').getAttribute('href')
        : await page.locator('link[hreflang="es"]').getAttribute('href');
      expect(normalizar(new URL(deVuelta!).pathname)).toBe(normalizar(ruta));
    });

    test('emite el JSON-LD que le corresponde', async ({ page }) => {
      await page.goto(ruta);

      const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
      const tipos = bloques.map((b) => JSON.parse(b)['@type']);

      // Identidad de marca: va en todas las páginas.
      expect(tipos).toContain('SportsOrganization');

      // WebSite SOLO en la home del dominio. Google resuelve el site name leyendo
      // la raíz e ignora los subdirectorios, así que en cualquier otra página es
      // ruido. Ir contra esto costó 4 meses de "phsport" en minúsculas en la SERP
      // (DECISIONS.md, 2026-08-11) — de ahí que sea un test y no un comentario.
      const debeLlevarWebSite = ruta === '/';
      expect(tipos.includes('WebSite'), `WebSite en ${ruta}`).toBe(debeLlevarWebSite);
    });
  });
}

test('la marca se escribe PHSPORT en el marcado que lee Google', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'PHSPORT');

  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const bloque of bloques) {
    expect(JSON.parse(bloque).name).toBe('PHSPORT');
  }
});
