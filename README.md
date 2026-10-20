# ph-sport-web

Web de PHSPORT construida con Astro 5, i18n ES/EN, vídeo de portada y animaciones GSAP.

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
salida se versiona en `public/` (las fotos de la oficina, en `src/assets/images/oficina/`).

- `npm run assets:badges` — escudos PNG → WebP 128×128
- `npm run assets:favicons` — favicons, apple-touch-icon y `og-image.jpg`
- `npm run assets:hero` — vídeos y pósters del hero, renderizados desde `scripts/hero-neon/neon.html`
- `npm run assets:oficina` — fotos de la oficina de Servicios y Contacto: recorte 16:10, ajuste de color y máscaras de luz

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Home — Hero, talentos, servicios, about, contacto |
| `/talentos/` | Selección del roster en el orden que fija Mario, con selector Profesionales / Cantera y buscador por nombre (cards no clicables) |
| `/servicios` | 6 pilares del servicio |
| `/sobre-nosotros` | Historia, equipo (23 integrantes) y cierre |
| `/en/*` | Mirror completo en inglés (`/en/talents/`, `/en/services`, `/en/about`) |
| `/it/*` | Mirror en italiano sin textos legales (`/it/talenti/`, `/it/servizi`, `/it/chi-siamo`). Texto pendiente de revisión nativa |

## Stack

Astro 5 (SSG + Islands) · Tailwind CSS 4 · GSAP · TypeScript · Vercel
