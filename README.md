# ph-sport-web

Web de PH Sport construida con Astro 5, i18n ES/EN, vídeo hero y animaciones GSAP.

## Scripts

- `npm run dev` — entorno local en `http://localhost:4321`
- `npm run build` — build de producción
- `npm run preview` — previsualización del build
- `npm run astro -- check` — validación Astro/TypeScript

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
