import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke E2E contra el build real, no contra el dev server: lo que se verifica es
 * lo que se sube a Vercel. `astro preview` sirve `dist/`, así que el build tiene
 * que existir — de ahí que el webServer lo construya antes.
 *
 * Puerto 4322 a propósito: el 4321 es el del dev server, que tiene strictPort.
 * Si los tests usaran ese, fallarían con `npm run dev` abierto en otra terminal.
 */
const PORT = 4322;

export default defineConfig({
  testDir: './tests/e2e',
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
