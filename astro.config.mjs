import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://phsport.es',
  /**
   * Sitemap sin `i18n` a propósito: esa opción empareja versiones por path y
   * aquí los slugs están traducidos (/servicios ↔ /en/services), así que solo
   * anotaba 2 de 12 URLs. El hreflang vive en el HTML (BaseLayout), completo y
   * recíproco, que es uno de los tres métodos válidos de Google — basta con ese.
   */
  integrations: [sitemap()],
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
  /**
   * Los redirects viven en `vercel.json`, no aquí: en build estático Astro los
   * materializa como HTML con `meta refresh` y respuesta 200, que Google trata
   * como redirección débil. En vercel.json son 301 reales a nivel de servidor.
   */
  vite: {
    plugins: [tailwindcss()],
    /** Si 4321 está ocupado, falla en lugar de servir en 4322+ (evita abrir la URL equivocada). */
    server: {
      port: 4321,
      strictPort: true,
    },
  },
});
