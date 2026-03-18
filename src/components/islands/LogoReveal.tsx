// client:load — excepción justificada: el reveal debe ejecutarse antes de que
// el usuario vea cualquier contenido. Si se difiere con client:visible, el
// usuario ve la página sin animación y el efecto se rompe.

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const LOGO_VIEWBOX = '0 0 259.8 206.1';
const POLYGON_1_POINTS =
  '0 206.1 58.2 206.1 57.9 145.5 158.1 45.4 112.7 0 0 0 0 52.6 76.9 52.6 0 128.7';
const POLYGON_2_POINTS =
  '122.6 206.1 200.1 206.1 152.2 157.8 173 137.1 182.4 146.4 259.8 146.4 169.6 55.6 130.5 94.2 131.8 95.6 141.1 105.4 120.3 125.8 109.8 115.4 70.8 153.9';

const SESSION_KEY = 'ph-logo-revealed';

function restoreLayout() {
  document.documentElement.style.overflow = '';
  document.documentElement.style.paddingRight = '';
}

function dismissOverlay(overlay: HTMLDivElement) {
  overlay.style.display = 'none';
  restoreLayout();
  document.dispatchEvent(new CustomEvent('ph:logo-revealed'));
}

export default function LogoReveal() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<SVGPolygonElement>(null);
  const line2Ref = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    if (!overlay || !container || !line1 || !line2) return;

    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const isHome = path === '/' || path === '/en';
    if (!isHome) {
      dismissOverlay(overlay);
      return;
    }

    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = navEntry?.type === 'reload';

    if (!isReload && sessionStorage.getItem(SESSION_KEY)) {
      dismissOverlay(overlay);
      return;
    }

    const len1 = line1.getTotalLength();
    const len2 = line2.getTotalLength();

    gsap.set([line1, line2], {
      strokeDasharray: (i) => (i === 0 ? len1 : len2),
      strokeDashoffset: (i) => (i === 0 ? len1 : len2),
    });

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    document.documentElement.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        overlay.style.display = 'none';
        if (!isReload) sessionStorage.setItem(SESSION_KEY, '1');
        document.dispatchEvent(new CustomEvent('ph:logo-revealed'));
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
    tl.to(overlay, {
      opacity: 0,
      duration: 0.3,
      onStart: restoreLayout, // layout restaurado cuando el overlay aún cubre todo
    }, '-=0.25');
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#0d0f12',
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
