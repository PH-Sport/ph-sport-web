/**
 * Comportamiento de las piezas compartidas de PHSPORT (estilos en
 * src/styles/ph-ui.css), con el lenguaje de movimiento de Mochi.
 *
 * Mochi se usa sin JavaScript en el navegador (React solo al construir), así que lo
 * que reacciona a lo que haces vive aquí: acordeones, pestañas, desplegables, la
 * etiqueta que viaja y el botón de copiar que confirma con un check. Las curvas y
 * tiempos son los de Mochi (`--mochi-ease-*`, `--mochi-duration-*`).
 *
 * Reglas (README de Mochi, «Movimiento»): el movimiento responde a lo que hace el
 * usuario. Nada se anima al cargar ni al hacer scroll; todo se puede interrumpir.
 *
 * Arranca en cada `astro:page-load` y lo deshace todo en `astro:before-swap`, para
 * no acumular listeners entre páginas del ClientRouter.
 */

type Cleanup = () => void;
let cleanups: Cleanup[] = [];
const on = <K extends keyof HTMLElementEventMap>(el: EventTarget, type: K | string, fn: (e: any) => void, opts?: AddEventListenerOptions) => {
  el.addEventListener(type, fn, opts);
  cleanups.push(() => el.removeEventListener(type, fn, opts));
};

export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Duración de un muelle de Mochi en ms, leída de su variable CSS. */
export function springMs(name: string): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--mochi-duration-${name}`);
  return reducedMotion() ? 0 : parseFloat(v) || 0;
}

/**
 * Indicador que se desplaza (pastilla de pestañas o del menú). El borde que va
 * delante se mueve con «lead» y el de detrás con «trail»: así se estira un poco.
 */
export function slider(container: HTMLElement, thumb: HTMLElement) {
  let cur: { l: number } | null = null;
  return (el: HTMLElement | null | undefined, instant = false) => {
    if (!el) return;
    const c = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const l = r.left - c.left + container.scrollLeft;
    const rr = c.right - r.right - container.scrollLeft;
    const lead = 'var(--mochi-duration-lead) var(--mochi-ease-lead)';
    const trail = 'var(--mochi-duration-trail) var(--mochi-ease-trail)';
    const right = !!cur && l > cur.l;
    const jump = instant || !cur || reducedMotion();
    thumb.style.transition = jump ? 'none' : `left ${right ? trail : lead}, right ${right ? lead : trail}, opacity var(--mochi-duration-fade-in) var(--mochi-ease-fade-in)`;
    thumb.style.setProperty('--l', `${l}px`);
    thumb.style.setProperty('--r', `${rr}px`);
    cur = { l };
    if (jump) requestAnimationFrame(() => { thumb.style.transition = ''; });
  };
}

/* ── Acordeón: una sección abierta a la vez ──────────────────────────────── */
function initAccordions(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-ph-accordion]').forEach((acc) => {
    const items = [...acc.querySelectorAll<HTMLElement>('.ph-acc__item')];
    items.forEach((item, i) => {
      const head = item.querySelector<HTMLButtonElement>('.ph-acc__head');
      if (!head) return;
      on(head, 'click', () => {
        const open = !item.classList.contains('is-open');
        items.forEach((x) => { x.classList.remove('is-open'); x.querySelector('.ph-acc__head')?.setAttribute('aria-expanded', 'false'); });
        if (open) { item.classList.add('is-open'); head.setAttribute('aria-expanded', 'true'); }
      });
      on(head, 'keydown', (e: KeyboardEvent) => {
        const go = ({ ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 } as Record<string, number>)[e.key];
        if (go === undefined) return;
        e.preventDefault();
        items[(go + items.length) % items.length].querySelector<HTMLButtonElement>('.ph-acc__head')?.focus();
      });
    });
  });
}

/* ── Pestañas segmentadas con cambio de contenido ───────────────────────── */
function initTabs(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-ph-tabs]').forEach((box) => {
    const seg = box.querySelector<HTMLElement>('.ph-seg');
    const thumb = box.querySelector<HTMLElement>('.ph-seg__thumb');
    const tabs = [...box.querySelectorAll<HTMLButtonElement>('.ph-seg__tab')];
    const panels = [...box.querySelectorAll<HTMLElement>('[data-ph-panel]')];
    if (!seg || !thumb || !tabs.length) return;
    const move = slider(seg, thumb);
    let idx = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    const choose = (i: number, focus = false) => {
      if (i === idx) return;
      const dir = i > idx ? 1 : -1;
      const prev = panels[idx];
      const next = panels[i];
      idx = i;
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      if (focus) tabs[i].focus();
      move(tabs[i]);
      tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
      if (prev) {
        prev.style.setProperty('--dir', String(dir));
        prev.dataset.state = 'out';
        const ms = springMs('fade-out');
        window.setTimeout(() => { if (prev.dataset.state === 'out') prev.hidden = true; }, ms + 40);
      }
      if (next) {
        next.hidden = false;
        next.style.setProperty('--dir', String(dir));
        next.dataset.state = 'pre';
        next.getBoundingClientRect();
        next.dataset.state = 'in';
      }
    };
    tabs.forEach((t, i) => on(t, 'click', () => choose(i)));
    on(seg, 'keydown', (e: KeyboardEvent) => {
      const n = ({ ArrowRight: idx + 1, ArrowLeft: idx - 1, Home: 0, End: tabs.length - 1 } as Record<string, number>)[e.key];
      if (n === undefined) return;
      e.preventDefault();
      choose((n + tabs.length) % tabs.length, true);
    });
    requestAnimationFrame(() => move(tabs[idx], true));
    on(window, 'resize', () => move(tabs[idx], true));
  });
}

/**
 * Desplegable: el botón crece hasta ser la lista (recorte que se abre con «morph»)
 * y las opciones entran después. Teclado como un `<select>`. Cada opción puede ser
 * un enlace (idioma) o un botón (filtros): al elegir se emite `ph:select`.
 */
function initSelects(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-ph-select]').forEach((sel) => {
    const btn = sel.querySelector<HTMLButtonElement>('.ph-select__btn');
    const panel = sel.querySelector<HTMLElement>('.ph-select__panel');
    const current = sel.querySelector<HTMLElement>('.ph-select__current');
    const opts = [...sel.querySelectorAll<HTMLElement>('.ph-select__opt')];
    const hl = sel.querySelector<HTMLElement>('.ph-select__hl');
    if (!btn || !panel || !opts.length) return;
    let active = 0;
    const highlight = (i: number) => {
      active = i;
      const o = opts[i];
      if (!hl) return;
      hl.style.setProperty('--t', `${o.offsetTop}px`);
      hl.style.setProperty('--hh', `${o.offsetHeight}px`);
      hl.classList.add('is-on');
    };
    const setClosedShape = () => {
      // La lista arranca con la forma exacta del botón, en su esquina.
      const w = btn.offsetWidth;
      const pw = panel.offsetWidth;
      const ph = panel.offsetHeight;
      const end = sel.dataset.align === 'end';
      const sides = end ? `0 0 ${ph - btn.offsetHeight}px ${pw - w}px` : `0 ${pw - w}px ${ph - btn.offsetHeight}px 0`;
      // Misma esquina que el botón, leída de él: si cambia el radio, no hay que tocar esto.
      panel.style.setProperty('--closed', `inset(${sides} round ${getComputedStyle(btn).borderTopLeftRadius})`);
    };
    const open = (state: boolean, focusSelected = true) => {
      if (state) setClosedShape();
      // Cerrada, la lista sigue en el DOM (recortada y transparente): `inert` la
      // saca del orden del tabulador y del árbol de accesibilidad.
      panel.inert = !state;
      sel.classList.toggle('is-open', state);
      btn.setAttribute('aria-expanded', String(state));
      if (state) {
        const s = Math.max(0, opts.findIndex((o) => o.getAttribute('aria-selected') === 'true'));
        highlight(s);
        if (focusSelected) window.setTimeout(() => opts[s].focus({ preventScroll: true }), 80);
      } else {
        hl?.classList.remove('is-on');
      }
    };
    setClosedShape();
    panel.inert = !sel.classList.contains('is-open');
    on(btn, 'click', () => open(!sel.classList.contains('is-open')));
    if (current) on(current, 'click', () => { open(false); btn.focus(); });
    opts.forEach((o, i) => {
      on(o, 'pointerenter', () => highlight(i));
      on(o, 'focus', () => highlight(i));
      on(o, 'click', () => {
        if (o.tagName !== 'A') {
          opts.forEach((x) => x.setAttribute('aria-selected', String(x === o)));
          sel.dispatchEvent(new CustomEvent('ph:select', { detail: { value: o.dataset.value, label: o.dataset.label ?? o.textContent?.trim() } }));
          open(false);
          btn.focus();
        }
      });
    });
    on(panel, 'keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const n = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
        highlight(n);
        opts[n].focus();
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const n = e.key === 'Home' ? 0 : opts.length - 1;
        highlight(n);
        opts[n].focus();
      } else if (e.key === 'Escape' || e.key === 'Tab') {
        if (e.key === 'Escape') e.preventDefault();
        open(false, false);
        if (e.key === 'Escape') btn.focus();
      }
    });
    on(btn, 'keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(true); }
    });
    on(document, 'pointerdown', (e: PointerEvent) => {
      if (sel.classList.contains('is-open') && !sel.contains(e.target as Node)) open(false, false);
    });
    on(window, 'resize', setClosedShape);
  });
}

/* ── Etiqueta flotante única: viaja de un elemento a otro ────────────────── */
function initTooltips(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-ph-tip-group]').forEach((group) => {
    const tip = group.querySelector<HTMLElement>('.ph-tip');
    if (!tip) return;
    let shown = false;
    let timer = 0;
    const show = (el: HTMLElement) => {
      window.clearTimeout(timer);
      const g = group.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      tip.classList.toggle('no-travel', !shown);
      tip.style.setProperty('--x', `${r.left - g.left + r.width / 2}px`);
      tip.textContent = el.dataset.tip ?? '';
      tip.classList.add('is-on');
      shown = true;
    };
    const hide = () => { timer = window.setTimeout(() => { tip.classList.remove('is-on'); shown = false; }, 120); };
    group.querySelectorAll<HTMLElement>('[data-tip]').forEach((el) => {
      on(el, 'pointerenter', () => show(el));
      on(el, 'focus', () => show(el));
      on(el, 'pointerleave', hide);
      on(el, 'blur', hide);
    });
    cleanups.push(() => window.clearTimeout(timer));
  });
}

/* ── Botón que copia y confirma transformándose en un check ─────────────── */
function initCopyButtons(root: ParentNode) {
  root.querySelectorAll<HTMLButtonElement>('[data-ph-copy]').forEach((btn) => {
    const live = btn.parentElement?.querySelector<HTMLElement>('[data-ph-copy-live]') ?? null;
    let timer = 0;
    on(btn, 'click', async () => {
      if (btn.dataset.status !== 'idle') return;
      try { await navigator.clipboard.writeText(btn.dataset.phCopy ?? ''); } catch { /* sin portapapeles: el texto sigue a la vista */ }
      btn.dataset.status = 'success';
      if (live) live.textContent = btn.dataset.phCopy ?? '';
      timer = window.setTimeout(() => { btn.dataset.status = 'idle'; if (live) live.textContent = ''; }, 1100 + springMs('draw'));
    });
    cleanups.push(() => window.clearTimeout(timer));
  });
}

function init() {
  document.documentElement.classList.add('ph-js');
  initAccordions(document);
  initTabs(document);
  initSelects(document);
  initTooltips(document);
  initCopyButtons(document);
}

function destroy() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', destroy);

// ── `ph-js` en el documento ENTRANTE, antes del swap ─────────────────────────
// El swap resetea los atributos de <html> a los de la página nueva, que no trae
// `ph-js` (la pone el script inline del <head> solo en la primera carga). Si se
// añade después (en `after-swap`), la página se pinta un instante sin ella, con
// los acordeones abiertos (`html:not(.ph-js)`), y luego se cierran animándose:
// medio segundo de página que encoge, y al pulsar atrás el scroll acaba ~30-130 px
// más arriba de donde estabas. Medido en la preview de Vercel el 2026-10-01.
document.addEventListener('astro:before-swap', (e) => {
  const newDoc = (e as Event & { newDocument?: Document }).newDocument;
  newDoc?.documentElement.classList.add('ph-js');
});

// ── Scroll suave apagado durante la navegación ────────────────────────────────
// global.css pone `scroll-behavior: smooth` en <html>. Al pulsar atrás, el
// ClientRouter restaura la posición con `scrollTo(x, y)`, que no admite
// `behavior`: heredaría el suave y la restauración se animaría. Se apaga en el
// documento ENTRANTE (el swap resetea los atributos de <html> y el `scrollTo` del
// router corre después) y se vuelve a encender pasado un segundo. Vivía en
// ph-text-animations.ts junto al refresh de ScrollTrigger; el porqué largo está en
// docs/trampas-conocidas.md. Quitarlo vuelve a animar la restauración.
document.addEventListener('astro:before-swap', (e) => {
  const newDoc = (e as Event & { newDocument?: Document }).newDocument;
  if (newDoc) newDoc.documentElement.style.scrollBehavior = 'auto';
});
document.addEventListener('astro:page-load', () => {
  window.setTimeout(() => document.documentElement.style.removeProperty('scroll-behavior'), 1000);
});
