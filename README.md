# ph-sport-web

Web de PHSPORT construida con Astro 5, i18n ES/EN, vídeo hero y animaciones GSAP.

## Scripts

- `npm run dev` — entorno local en `http://localhost:4321`
- `npm run build` — build de producción
- `npm run preview` — previsualización del build
- `npm run astro -- check` — validación Astro/TypeScript
- `npm run test:e2e` — smoke E2E sobre el build (construye y sirve él solo)
- `npm run test:e2e:ui` — el mismo smoke en modo interactivo

El smoke corre **solo** antes de cada push a `main` (lo aborta si falla) y en
GitHub Actions. En un clon nuevo se activa con `npm install`, sin más pasos.

### Regeneración de assets

Solo se ejecutan a mano al cambiar un original de `assets/source-media/`; su
salida se versiona en `public/`.

- `npm run assets:badges` — escudos PNG → WebP 128×128
- `npm run assets:hero` — master del vídeo → variantes 480p y 720p
- `npm run assets:favicons` — favicons, apple-touch-icon y `og-image.jpg`

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Home — Hero, talentos, servicios, about, contacto |
| `/talentos/` | Roster completo con filtro y ordenación (cards no clicables) |
| `/servicios` | 6 pilares del servicio |
| `/sobre-nosotros` | Historia, equipo (21 integrantes) y cierre |
| `/en/*` | Mirror completo en inglés (`/en/talents/`, `/en/services`, `/en/about`) |

## Stack

Astro 5 (SSG + Islands) · Tailwind CSS 4 · GSAP · TypeScript · Vercel
