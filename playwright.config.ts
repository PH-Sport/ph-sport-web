import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke E2E contra el build real, no contra el dev server: lo que se verifica es
 * lo que se sube a Vercel. `astro preview` sirve `dist/`, así que el build tiene
 * que existir — de ahí que el webServer lo construya antes.
 *
 * Puerto 4322 por defecto: el 4321 es el del dev server, que tiene strictPort.
 * Si los tests usaran ese, fallarían con `npm run dev` abierto en otra terminal.
 *
 * `PH_E2E_PORT` lo cambia sin editar este archivo, para cuando el 4322 esté
 * ocupado por otra cosa:
 *
 *     PH_E2E_PORT=4488 npm run test:e2e
 *
 * Y `globalSetup` comprueba antes de empezar que lo que responde ahí es este
 * proyecto: `reuseExistingServer` da por bueno cualquier servidor que encuentre,
 * y una vez midió la web de otro proyecto durante 37 tests. Ver el porqué en
 * `tests/e2e/comprobar-servidor.ts`.
 */
const PORT = Number(process.env.PH_E2E_PORT ?? 4322);

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/comprobar-servidor.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
