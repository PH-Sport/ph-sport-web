import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  integrations: [react(), sitemap()],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // Evita 504 "Outdated Optimize Dep" al cargar three en dev (caché .vite desincronizada)
    optimizeDeps: {
      include: [
        'three',
        'three/examples/jsm/controls/OrbitControls.js',
        'three/examples/jsm/environments/RoomEnvironment.js',
      ],
    },
  },
});
