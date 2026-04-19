// client:load — excepción justificada: el reveal debe ejecutarse antes de que
// el usuario vea cualquier contenido. Si se difiere con client:visible, el
// usuario ve la página sin animación y el efecto se rompe.

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { isDocumentReload } from '@/lib/is-document-reload';

const LOGO_VIEWBOX = '0 0 259.8 206.1';
const POLYGON_1_POINTS =
  '0 206.1 58.2 206.1 57.9 145.5 158.1 45.4 112.7 0 0 0 0 52.6 76.9 52.6 0 128.7';
const POLYGON_2_POINTS =
  '122.6 206.1 200.1 206.1 152.2 157.8 173 137.1 182.4 146.4 259.8 146.4 169.6 55.6 130.5 94.2 131.8 95.6 141.1 105.4 120.3 125.8 109.8 115.4 70.8 153.9';

const SESSION_KEY = 'ph-logo-revealed';

/** Oculta chrome (header) mientras el overlay está activo: el island vive en main (z-index bajo) y el header fijo quedaría encima del overlay.
 *  El header no es interactivo durante el reveal (ver comentario en BaseLayout.astro). */
const REVEAL_CHROME_CLASS = 'ph-logo-reveal-active';

const REF_RETRY_MAX = 40;
/** Si getTotalLength() es 0 (SVG aún sin layout), reintentar; no usar umbral que dispare dismiss: eso saltaba la animación entera. */
const LAYOUT_LENGTH_RETRIES_MAX = 32;
const FALLBACK_LEN_1 = 920;
const FALLBACK_LEN_2 = 780;

function setRevealChromeVisible(visible: boolean) {
  document.documentElement.classList.toggle(REVEAL_CHROME_CLASS, !visible);
}

/** Entrada suave del header tras el overlay (GSAP). Sin duplicar lógica en dismissOverlay / reduced motion. */
function revealHeaderAfterIntro() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) {
    setRevealChromeVisible(true);
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setRevealChromeVisible(true);
    return;
  }

  gsap.killTweensOf(header);
  gsap.set(header, { opacity: 0, y: -14, pointerEvents: 'none' });
  setRevealChromeVisible(true);
  gsap.to(header, {
    opacity: 1,
    y: 0,
    duration: 0.55,
    ease: 'power3.out',
    onComplete: () => {
      gsap.set(header, { clearProps: 'opacity,transform,pointerEvents' });
    },
  });
}

function restoreLayout() {
  document.documentElement.style.overflow = '';
  document.documentElement.style.paddingRight = '';
}

function dispatchLogoRevealedToDocument() {
  document.dispatchEvent(new CustomEvent('ph:logo-revealed'));
}

/**
 * Si el dismiss ocurre en el mismo tick que la hidratación, el listener de Hero
 * (astro:page-load) puede no existir aún y el evento se pierde → texto congelado ~4s.
 */
function scheduleLogoRevealed() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => dispatchLogoRevealedToDocument());
  });
}

function dismissOverlay(overlay: HTMLDivElement) {
  overlay.style.display = 'none';
  restoreLayout();
  setRevealChromeVisible(true);
  scheduleLogoRevealed();
}

export default function LogoReveal() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<SVGPolygonElement>(null);
  const line2Ref = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    let cancelled = false;
    let ctx: gsap.Context | null = null;
    let revealDispatched = false;

    const dispatchRevealOnce = () => {
      if (revealDispatched) return;
      revealDispatched = true;
      dispatchLogoRevealedToDocument();
    };

    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const isHome = path === '/' || path === '/en';

    const teardownGsap = () => {
      if (ctx) {
        ctx.revert();
        ctx = null;
      }
      const line1 = line1Ref.current;
      const line2 = line2Ref.current;
      const container = containerRef.current;
      const overlay = overlayRef.current;
      if (line1) gsap.killTweensOf(line1);
      if (line2) gsap.killTweensOf(line2);
      if (container) gsap.killTweensOf(container);
      if (overlay) gsap.killTweensOf(overlay);
    };

    let attempts = 0;
    let lengthAttempts = 0;

    const tryRun = () => {
      if (cancelled) return;

      const overlay = overlayRef.current;
      const container = containerRef.current;
      const line1 = line1Ref.current;
      const line2 = line2Ref.current;

      if (!overlay) {
        attempts += 1;
        if (attempts >= REF_RETRY_MAX) {
          restoreLayout();
          setRevealChromeVisible(true);
          scheduleLogoRevealed();
          return;
        }
        requestAnimationFrame(tryRun);
        return;
      }

      if (!isHome) {
        dismissOverlay(overlay);
        return;
      }

      if (!container || !line1 || !line2) {
        attempts += 1;
        if (attempts >= REF_RETRY_MAX) {
          dismissOverlay(overlay);
          return;
        }
        requestAnimationFrame(tryRun);
        return;
      }

      const isReload = isDocumentReload();
      if (!isReload && sessionStorage.getItem(SESSION_KEY)) {
        dismissOverlay(overlay);
        return;
      }

      let len1 = line1.getTotalLength();
      let len2 = line2.getTotalLength();
      if (len1 < 1 || len2 < 1) {
        lengthAttempts += 1;
        if (lengthAttempts < LAYOUT_LENGTH_RETRIES_MAX) {
          requestAnimationFrame(tryRun);
          return;
        }
        len1 = FALLBACK_LEN_1;
        len2 = FALLBACK_LEN_2;
      }

      gsap.set(overlay, { opacity: 1, display: 'flex' });

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
      setRevealChromeVisible(false);

      ctx = gsap.context(() => {
        gsap.set([line1, line2], {
          strokeDasharray: (i) => (i === 0 ? len1 : len2),
          strokeDashoffset: (i) => (i === 0 ? len1 : len2),
        });

        const tl = gsap.timeline({
          onComplete: () => {
            overlay.style.display = 'none';
            if (!isReload) sessionStorage.setItem(SESSION_KEY, '1');
            dispatchRevealOnce();
            revealHeaderAfterIntro();
          },
        });

        tl.to(line1, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power3.inOut',
        })
          .to(
            line2,
            {
              strokeDashoffset: 0,
              duration: 0.7,
              ease: 'power3.inOut',
            },
            '-=0.45',
          )
          .to(
            container,
            { color: '#D6B25E', duration: 0.3, ease: 'power2.inOut' },
            '-=0.15',
          )
          .to(
            [line1, line2],
            { fill: '#D6B25E', duration: 0.35, ease: 'power2.inOut' },
            '-=0.1',
          )
          .to([line1, line2], { stroke: 'none', duration: 0.2 }, '-=0.05')
          .to({}, { duration: 0.3 });

        const exitDistance = window.innerWidth / 2 + 150;
        tl.to(line1, {
          x: -exitDistance,
          opacity: 0,
          duration: 0.6,
          ease: 'expo.in',
        }).to(
          line2,
          { x: exitDistance, opacity: 0, duration: 0.6, ease: 'expo.in' },
          '<',
        );
        tl.to(
          overlay,
          {
            opacity: 0,
            duration: 0.3,
            onStart: restoreLayout,
          },
          '-=0.25',
        );
      }, overlay);
    };

    requestAnimationFrame(tryRun);

    return () => {
      cancelled = true;
      teardownGsap();
      restoreLayout();
      setRevealChromeVisible(true);
      const header = document.querySelector<HTMLElement>('[data-header]');
      if (header) gsap.set(header, { clearProps: 'opacity,transform,pointerEvents' });
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(13, 15, 18, 0.52)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        ref={containerRef}
        className="logo-reveal-container"
        style={{ color: '#ffffff' }}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={LOGO_VIEWBOX}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="butt"
          strokeLinejoin="bevel"
          style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
        >
          <polygon
            ref={line1Ref}
            points={POLYGON_1_POINTS}
            strokeDasharray={9999}
            strokeDashoffset={9999}
          />
          <polygon
            ref={line2Ref}
            points={POLYGON_2_POINTS}
            strokeDasharray={9999}
            strokeDashoffset={9999}
          />
        </svg>
      </div>
    </div>
  );
}
