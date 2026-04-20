import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Reduced motion ────────────────────────────────────────────────────────────
export const reducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── DOM helpers ───────────────────────────────────────────────────────────────

/**
 * Wraps each word in an overflow:hidden clip container (.ph-clip / .ph-clip-inner)
 * so GSAP can slide each word up independently (curtain-reveal effect). Walks
 * child nodes so existing inline elements (e.g. `<span class="abt-gold">`) are
 * preserved: their inner words get wrapped, but the wrapper element survives.
 */
export function wrapWords(el: HTMLElement): HTMLElement[] {
  const makeClip = (word: string): HTMLSpanElement => {
    const clip = document.createElement('span');
    clip.className = 'ph-clip';
    const inner = document.createElement('span');
    inner.className = 'ph-clip-inner';
    inner.textContent = word;
    clip.appendChild(inner);
    return clip;
  };

  const transformTextNode = (node: Text): Node[] =>
    (node.textContent ?? '')
      .split(/(\s+)/)
      .filter((p) => p.length > 0)
      .map((p) => (/^\s+$/.test(p) ? document.createTextNode(p) : makeClip(p)));

  const transform = (parent: Element) => {
    Array.from(parent.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const replacements = transformTextNode(child as Text);
        replacements.forEach((r) => parent.insertBefore(r, child));
        parent.removeChild(child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        transform(child as Element);
      }
    });
  };

  transform(el);
  return Array.from(el.querySelectorAll<HTMLElement>('.ph-clip-inner'));
}

/**
 * Wraps each word in a plain inline-block span for blur/opacity reveal.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent?.trim() ?? '';
  el.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span style="display:inline-block">${w}</span>`)
    .join(' ');
  return Array.from(el.querySelectorAll<HTMLElement>('span'));
}

// ── Character scramble ────────────────────────────────────────────────────────
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const activeScrambles: Array<(time: number, deltaTime: number) => void> = [];

/**
 * Animates el.textContent through random chars before resolving to the real text.
 * Uses GSAP ticker for reliable frame-rate synchronization.
 */
export function scrambleReveal(el: HTMLElement, delay = 0): void {
  const finalText = el.textContent ?? '';
  const len = finalText.length;
  const DURATION = 1.3;
  let elapsed = -delay;
  let visible = false;

  gsap.set(el, { opacity: 0 });

  const tick = (_time: number, deltaTime: number) => {
    elapsed += deltaTime / 1000;
    if (elapsed < 0) return;
    if (!visible) {
      gsap.set(el, { opacity: 1 });
      visible = true;
    }

    const progress = Math.min(elapsed / DURATION, 1);
    const settled = Math.floor(progress * len * 1.1);

    let result = '';
    for (let i = 0; i < len; i++) {
      if (finalText[i] === ' ' || finalText[i] === '.') {
        result += finalText[i];
      } else if (i < settled) {
        result += finalText[i];
      } else {
        result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    el.textContent = result;

    if (progress >= 1 || !document.contains(el)) {
      el.textContent = finalText;
      gsap.ticker.remove(tick);
      const idx = activeScrambles.indexOf(tick);
      if (idx > -1) activeScrambles.splice(idx, 1);
    }
  };

  activeScrambles.push(tick);
  gsap.ticker.add(tick);
}

// ── Tracking (letter-spacing) compression ────────────────────────────────────
export function trackingReveal(
  el: HTMLElement,
  scrollTrigger?: ScrollTrigger.Vars,
): gsap.core.Tween {
  return gsap.from(el, {
    letterSpacing: '0.3em',
    opacity: 0,
    duration: 0.9,
    ease: 'expo.out',
    scrollTrigger,
  });
}

// ── Number counter ────────────────────────────────────────────────────────────
export function counterReveal(
  el: HTMLElement,
  target: number,
  scrollTrigger?: ScrollTrigger.Vars,
): gsap.core.Tween {
  const obj = { val: 0 };
  el.textContent = '00';
  return gsap.to(obj, {
    val: target,
    duration: 0.8,
    ease: 'power3.out',
    onUpdate() {
      el.textContent = String(Math.round(obj.val)).padStart(2, '0');
    },
    scrollTrigger,
  });
}

// ── Cleanup on View Transitions swap ─────────────────────────────────────────
document.addEventListener('astro:before-swap', () => {
  activeScrambles.forEach((t) => gsap.ticker.remove(t));
  activeScrambles.length = 0;
  ScrollTrigger.getAll().forEach((t) => t.kill());
});
