# ph-sport-web

Web de PH Sport construida con Astro, i18n ES/EN y una hero experience con reveal del logo.

## Scripts

- `npm run dev` — entorno local en `http://localhost:4321`
- `npm run build` — build de producción
- `npm run preview` — previsualización del build
- `npm run astro -- check` — validación Astro/TypeScript

## Estado actual

- Home centrada en Hero (la sección de jugadores destacados se implementará en una fase posterior).
- Seguridad de dependencias:
  - `npm audit --omit=dev` → sin vulnerabilidades en dependencias de producción
  - `npm audit` → avisos solo en dependencias de desarrollo
