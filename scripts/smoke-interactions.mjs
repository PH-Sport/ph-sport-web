/**
 * Smoke test de interacciones: menú móvil, desplegables, pestañas, modal de jugador.
 * Requiere el servidor: `npm run dev` o `npm run preview` (por defecto http://127.0.0.1:4321).
 *
 * Uso: SMOKE_URL=http://127.0.0.1:4321 npm run smoke
 */

import puppeteer from 'puppeteer';

const BASE = process.env.SMOKE_URL || 'http://127.0.0.1:4321';

function fail(msg) {
  const e = new Error(msg);
  e.name = 'SmokeError';
  throw e;
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => {
    const f = req.failure();
    if (f) errors.push(`requestfailed: ${req.url()} — ${f.errorText}`);
  });

  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem('ph-logo-revealed', '1');
    } catch {
      /* ignore */
    }
  });

  // Misma rama que `reducedMotion()` en la app: revela toolbars/cards sin depender de ScrollTrigger (fiable en headless).
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  console.log(`Smoke: base URL = ${BASE}`);

  // ── Desktop: jugadores → ordenar → modal → pestaña entrenadores ─────────
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/jugadores`, { waitUntil: 'networkidle2', timeout: 60000 });

  await page.waitForSelector('#main-content', { timeout: 10000 });
  await page.evaluate(() => {
    document.querySelector('.players-section')?.scrollIntoView({ block: 'center' });
  });

  await page.waitForSelector('.players-grid.cards-revealed .card', { timeout: 20000 });

  // Hay dos paneles (móvil + desktop); querySelector('.players-sort-panel') cogería siempre el móvil.
  const desktopSort = '.players-toolbar--desktop .players-sort-trigger';
  await page.waitForSelector(desktopSort, { timeout: 10000 });
  await page.click(desktopSort);
  await page.waitForFunction(
    () => {
      const p = document.querySelector('.players-toolbar--desktop .players-sort-panel');
      return p && !p.hasAttribute('hidden');
    },
    { timeout: 8000 },
  );

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
    page.click('.players-toolbar--desktop .players-sort-panel [data-sort-value="az"]'),
  ]);

  if (!page.url().includes('sort=az')) {
    fail(`Tras ordenar A-Z la URL debería incluir sort=az; actual: ${page.url()}`);
  }

  await page.evaluate(() => {
    document.querySelector('.players-tabpanel:not([hidden]) .players-grid')?.scrollIntoView({
      block: 'center',
    });
  });

  await page.waitForSelector('.players-tabpanel:not([hidden]) a.card', { timeout: 5000 });
  await page.click('.players-tabpanel:not([hidden]) a.card');

  await page.waitForSelector('.player-modal-close', { timeout: 12000 });
  await page.keyboard.press('Escape');

  await page.waitForFunction(
    () => {
      const b = document.querySelector('.player-modal-backdrop');
      return !b || b.hidden;
    },
    { timeout: 8000 },
  );

  const hasTabs = await page.evaluate(() => !!document.querySelector('#players-tab-coaches'));
  if (hasTabs) {
    await page.click('#players-tab-coaches');
    await page.waitForFunction(
      () => {
        const p = document.getElementById('players-panel-coaches');
        return p && !p.hidden;
      },
      { timeout: 5000 },
    );
  }

  // ── Móvil: menú hamburguesa → ir a jugadores ─────────────────────────────
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 });

  await page.waitForSelector('[data-header] [data-menu-toggle]', { timeout: 5000 });
  await page.click('[data-header] [data-menu-toggle]');
  await page.waitForSelector('#mobile-menu.is-open', { timeout: 5000 });

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
    page.click('a.mobile-link[href*="/jugadores"]'),
  ]);

  await page.waitForSelector('.players-grid.cards-revealed .card', { timeout: 20000 });

  if (hasTabs) {
    await page.click('#players-view-trigger-mobile');
    await page.waitForFunction(
      () => {
        const p = document.getElementById('players-view-listbox-mobile');
        return p && !p.hasAttribute('hidden');
      },
      { timeout: 5000 },
    );
    await page.click('.players-view-panel [data-view-tab="coaches"]');
    await page.waitForFunction(
      () => {
        const p = document.getElementById('players-panel-coaches');
        return p && !p.hidden;
      },
      { timeout: 5000 },
    );
  }

  await browser.close();

  if (errors.length) {
    console.warn('Avisos durante la prueba (no abortan):');
    errors.forEach((e) => console.warn(' ', e));
  }

  console.log('SMOKE OK — clics y navegación respondieron como se esperaba.');
}

run().catch((e) => {
  console.error('SMOKE FALLIDO:', e.message || e);
  process.exit(1);
});
