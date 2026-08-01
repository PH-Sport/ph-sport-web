import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://phsport.es',
  // `/lab-viewport` es una página de diagnóstico temporal (rama fix/ios-barra-navegador):
  // fuera del sitemap para que no se indexe si el deploy llegara a producción.
  integrations: [sitemap({ filter: (page) => !page.includes('/lab-viewport') })],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  redirects: {
    '/equipo': { status: 301, destination: '/sobre-nosotros#equipo' },
    '/en/team': { status: 301, destination: '/en/about#equipo' },
  },
  vite: {
    plugins: [tailwindcss()],
    /** Si 4321 está ocupado, falla en lugar de servir en 4322+ (evita abrir la URL equivocada). */
    server: {
      port: 4321,
      strictPort: true,
    },
  },
});
