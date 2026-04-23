# ph-sport-web

Web de PH Sport construida con Astro 5, i18n ES/EN, vídeo hero y animaciones GSAP.

## Scripts

- `npm run dev` — entorno local en `http://localhost:4321`
- `npm run build` — build de producción
- `npm run preview` — previsualización del build
- `npm run astro -- check` — validación Astro/TypeScript

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Home — Hero, jugadores, servicios, about, contacto |
| `/jugadores/` | Roster completo con filtro y ordenación |
| `/jugadores/[slug]` | Perfil individual de jugador |
| `/servicios` | 6 pilares del servicio |
| `/sobre-nosotros` | Historia, equipo (21 integrantes) y cierre |
| `/en/*` | Mirror completo en inglés |

## Stack

Astro 5 (SSG + Islands) · Tailwind CSS 4 · GSAP · TypeScript · Cloudflare Pages
