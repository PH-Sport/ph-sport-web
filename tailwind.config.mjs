// tailwind.config.mjs
// Tokens de diseño PH Sport — fuente de verdad visual del proyecto.
// Todos los valores referenciados desde src/styles/global.css como custom properties --ph-*.

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // --- Colores ---
      colors: {
        ph: {
          black:    '#0d0f12',   // Fondo base — charcoal authority
          white:    '#ffffff',   // Texto principal y contraste
          gold:     '#D6B25E',   // Acento único — usado con criterio, nunca como relleno
          'gold-muted': '#a8893e', // Versión más oscura para hover/estados
          'white-10': 'rgba(255,255,255,0.10)',
          'white-20': 'rgba(255,255,255,0.20)',
          'white-60': 'rgba(255,255,255,0.60)',
          'black-80': 'rgba(13,15,18,0.80)',  // Overlay para secciones con foto
        },
      },

      // --- Tipografía ---
      // Söhne: títulos y claims (self-hosted en /public/fonts/)
      // Helvetica: cuerpo, UI, navegación
      fontFamily: {
        display: ['"Sohne"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body:    ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },

      fontSize: {
        // Escala tipográfica — mobile first, con variantes sm: y lg:
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem',     { lineHeight: '1.6rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':  ['3rem',     { lineHeight: '1.1' }],
        '6xl':  ['3.75rem',  { lineHeight: '1.05' }],
        '7xl':  ['4.5rem',   { lineHeight: '1' }],
        '8xl':  ['6rem',     { lineHeight: '1' }],
      },

      fontWeight: {
        light:    '300',
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
        black:    '900',
      },

      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.02em',
        tight:    '-0.01em',
        normal:   '0em',
        wide:     '0.04em',
        wider:    '0.08em',
        widest:   '0.16em',   // Para labels en mayúsculas tipo "POSICIÓN"
      },

      // --- Espaciado ---
      // Escala base de Tailwind es suficiente; solo añadimos valores específicos
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '128': '32rem',
      },

      // --- Breakpoints ---
      // Mantenemos los de Tailwind + uno extra para pantallas grandes
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // --- Transiciones ---
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },

      transitionTimingFunction: {
        'ph': 'cubic-bezier(0.16, 1, 0.3, 1)',  // Ease out expo — suave y premium
      },

      // --- Bordes y radios ---
      borderRadius: {
        'none': '0',
        'sm':   '0.125rem',
        DEFAULT: '0.25rem',
        'md':   '0.375rem',   // --ph-radius: radio base para botones y UI
        'lg':   '0.5rem',     // --ph-radius-card: radio para cards y contenedores
        'xl':   '0.75rem',
        'full': '9999px',
      },

      // --- Sombras ---
      boxShadow: {
        'ph-sm':  '0 2px 8px rgba(13,15,18,0.4)',
        'ph':     '0 4px 24px rgba(13,15,18,0.6)',
        'ph-lg':  '0 8px 48px rgba(13,15,18,0.8)',
        'gold':   '0 0 24px rgba(214,178,94,0.25)',  // Halo dorado sutil para highlights
      },

      // --- Aspect ratios ---
      aspectRatio: {
        'player': '3 / 4',   // Ratio estándar para fotos de jugadores (portrait)
        'hero':   '16 / 9',
        'square': '1 / 1',
      },
    },
  },
  plugins: [],
};
