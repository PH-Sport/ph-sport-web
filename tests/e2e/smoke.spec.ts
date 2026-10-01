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

/** /en/* en inglés, /it/* en italiano, el resto en español. */
function idiomaDeRuta(ruta: string): 'es' | 'en' | 'it' {
  if (ruta.startsWith('/en/')) return 'en';
  if (ruta.startsWith('/it/')) return 'it';
  return 'es';
}

/** Los `<link rel="alternate" hreflang>` de la página, sin el x-default. */
async function leerHreflang(page: Page): Promise<Record<string, string>> {
  const enlaces = await page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((els) => els.map((el) => [el.getAttribute('hreflang')!, el.getAttribute('href')!]));
  return Object.fromEntries(enlaces.filter(([codigo]) => codigo !== 'x-default'));
}

/** El grupo de versiones como idioma → ruta normalizada, para comparar entre páginas. */
function grupoNormalizado(alternas: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(alternas).map(([codigo, href]) => [codigo, normalizar(new URL(href).pathname)]),
  );
}

// 6 en español, 6 en inglés y 4 en italiano: el aviso legal y la privacidad no
// se traducen al italiano (DECISIONS.md, 2026-10-01).
test('el build genera las 16 páginas declaradas', () => {
  expect(RUTAS).toHaveLength(16);
  expect(RUTAS.filter((r) => idiomaDeRuta(r) === 'it')).toHaveLength(4);
});

for (const ruta of RUTAS) {
  test.describe(`página ${ruta}`, () => {
    test('carga sin errores y con el marcado esencial', async ({ page }) => {
      const problemas = vigilarConsola(page);

      const respuesta = await page.goto(ruta, { waitUntil: 'load' });
      expect(respuesta?.status()).toBe(200);

      await expect(page).toHaveTitle(/\S/);

      // El idioma del documento decide qué voz sintetiza un lector de pantalla
      // y cómo indexa Google.
      await expect(page.locator('html')).toHaveAttribute('lang', idiomaDeRuta(ruta));

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, 'falta el canonical').toBeTruthy();
      expect(canonical!.startsWith(SITE_URL), `canonical no absoluto: ${canonical}`).toBe(true);
      expect(normalizar(new URL(canonical!).pathname)).toBe(normalizar(ruta));

      expect(problemas, `problemas en ${ruta}`).toEqual([]);
    });

    test('declara hreflang recíproco', async ({ page }) => {
      await page.goto(ruta);

      const alternas = await leerHreflang(page);
      const xDefault = await page.locator('link[hreflang="x-default"]').getAttribute('href');

      // Toda página existe en español y en inglés; el italiano, solo donde se
      // tradujo. Que el grupo sea coherente lo comprueba la ida y vuelta de abajo.
      expect(alternas.es, 'falta hreflang es').toBeTruthy();
      expect(alternas.en, 'falta hreflang en').toBeTruthy();
      // x-default manda a la versión española para quien no habla ninguno de los tres.
      expect(xDefault).toBe(alternas.es);

      // Cada página se declara a sí misma. Cuando una ruta no está en
      // STATIC_ROUTES, getLangUrls() devuelve el grupo de la home en silencio
      // (el aviso solo salta en dev): esto lo caza en el build.
      const idioma = idiomaDeRuta(ruta);
      expect(alternas[idioma], `falta el hreflang de su propio idioma (${idioma})`).toBeTruthy();
      expect(normalizar(new URL(alternas[idioma]).pathname)).toBe(normalizar(ruta));

      for (const [codigo, href] of Object.entries(alternas)) {
        const rutaAlterna = new URL(href).pathname;

        // La alternativa tiene que ser una página que exista de verdad, y en
        // el idioma que se anuncia.
        expect(
          RUTAS.some((r) => normalizar(r) === normalizar(rutaAlterna)),
          `${ruta} apunta a ${rutaAlterna} (${codigo}), que no existe en el build`,
        ).toBe(true);
        expect(idiomaDeRuta(rutaAlterna), `hreflang ${codigo} de ${ruta}`).toBe(codigo);

        if (codigo === idioma) continue;

        // Ida y vuelta: cada versión declara exactamente el mismo grupo. Así
        // una página española que olvida a su gemela italiana también falla.
        await page.goto(rutaAlterna);
        expect(
          grupoNormalizado(await leerHreflang(page)),
          `${rutaAlterna} no declara las mismas versiones que ${ruta}`,
        ).toEqual(grupoNormalizado(alternas));
      }
    });

    test('el selector de idioma lleva a esta misma página en cada idioma', async ({ page }) => {
      await page.goto(ruta);
      const grupo = grupoNormalizado(await leerHreflang(page));

      // Si la página no existe en un idioma (los textos legales en italiano),
      // el selector lleva a la home de ese idioma.
      const homes: Record<string, string> = { es: '/', en: '/en', it: '/it' };

      // La cabecera persiste entre navegaciones y su script reescribe estos
      // enlaces al cargar: se comprueba lo que queda después, no el HTML servido.
      for (const codigo of ['es', 'en', 'it']) {
        const opcion = page.locator(`[data-header] [data-lang-option="${codigo}"]`);
        await expect(opcion, `opción ${codigo} del selector en ${ruta}`).toHaveAttribute(
          'href',
          new RegExp(`^${(grupo[codigo] ?? homes[codigo]).replace(/\/$/, '')}/?$`),
        );
      }
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

test('el desplegable de idioma cambia de idioma sin perder la página', async ({ page }) => {
  await page.goto('/servicios');

  const boton = page.locator('[data-header] [data-lang-trigger]');
  const panel = page.locator('[data-header] [data-lang-panel]');

  await expect(boton).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await boton.click();
  await expect(boton).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();

  // Escape lo cierra sin navegar.
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();

  await boton.click();

  // La View Transition fotografía la cabecera antes del cambio de página: si el
  // panel sigue abierto en ese momento, se ve encima durante toda la transición.
  // `astro:before-swap` llega con esa foto ya tomada.
  await page.evaluate(() => {
    document.addEventListener(
      'astro:before-swap',
      () => {
        const p = document.querySelector('[data-header] [data-lang-panel]')!;
        (window as any).__panelAlFotografiar = getComputedStyle(p).visibility;
      },
      { once: true },
    );
  });
  await panel.locator('[data-lang-option="it"]').click();

  // Navegación del ClientRouter: la cabecera persiste y su script tiene que
  // ponerse al día con el idioma nuevo.
  await expect(page).toHaveURL(/\/it\/servizi\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  await expect(boton).toContainText('IT');
  await expect(panel).toBeHidden();
  expect(await page.evaluate(() => (window as any).__panelAlFotografiar)).toBe('hidden');
  await expect(panel.locator('[data-lang-option="es"]')).toHaveAttribute('href', /^\/servicios\/?$/);
});
