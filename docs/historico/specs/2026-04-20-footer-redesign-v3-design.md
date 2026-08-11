# Footer Redesign V3 + Homepage Cleanup — Design Spec

**Goal:** Close Phase 5 of the V3 redesign by restyling the site-wide footer (`src/components/layout/Footer.astro`) to an editorial-hybrid treatment that matches the V3 section tone (sello arriba + bloque funcional debajo), and bundle the long-running homepage cleanup (delete unused `HomeInstagramSection` + feed, migrate deprecated `ViewTransitions`, fix the `onsubmit="event…"` inline handler, tighten `Button.astro`'s `type` prop) so that `npx astro check` finishes at **0 errors / 0 warnings / 0 hints** inside `src/`.

**Source of truth (footer layout):** `.superpowers/brainstorm/2730-1776698036/content/footer-layout.html` — option **B** (3-col clásico pulido, logo / páginas / contacto+social) with the sello full-width above.

The footer resolves to **four vertical blocks** end-to-end: gold rule → editorial sello → 3-column functional grid (with social nested inside column 3) → copyright bar.

**Scope boundaries**

- **IN:**
  - Rewrite of `src/components/layout/Footer.astro` (4-block structure: gold rule → sello → 3-col functional grid with nested social → copyright bar).
  - i18n: reuse existing `hero.claim.lead` / `hero.claim.accent` for the sello (no new keys for the sello itself); delete dead `home.instagram.*` keys in `src/i18n/es.ts` + `src/i18n/en.ts`.
  - Delete `src/components/sections/HomeInstagramSection.astro` and `src/lib/instagramHomeFeed.ts` (orphaned — no importers).
  - Migrate `<ViewTransitions />` → `<ClientRouter />` in `src/components/layout/BaseLayout.astro` (import + usage).
  - Replace inline `onsubmit="event.preventDefault();"` in `src/components/sections/HomeContactSection.astro:24` with a module script `addEventListener('submit', (e) => e.preventDefault())`.
  - Tighten `src/components/ui/Button.astro` prop types so `type?: 'button' | 'submit' | 'reset'` is explicit (not inferred as generic `string`).
- **OUT:**
  - Header restyle — untouched (already V3-compliant).
  - New iconography, new social accounts, copy rewrites beyond the sello split.
  - Root-level debug scripts (`capture-animation.mjs`, `test-logo-animation.mjs`) — their unused-var hints live outside `src/` and are not user-facing; we accept them and gate the acceptance on `src/` being clean.
  - Host-level 301 redirects for `/equipo` and `/en/team` (Netlify `_redirects` / Vercel `vercel.json`) — deferred to a deployment task.

---

## 1 — Footer structure

The footer renders as a single `Footer.astro` component inside `BaseLayout`. Five vertical blocks, full-viewport width, dark background inherited from the page:

```
01  Gold rule                (1px gradient, centered fade)
02  Sello editorial          ("NOW. NEXT. FOREVER FOOTBALL." — uppercase, gold on accent)
03  Bloque funcional (3-col) (logo | páginas | contacto + social)
04  Copyright bar            ("© 2026 PHSPORT. Todos los derechos reservados.")
```

(The current file has social as a separate block below the 3-col grid — the redesign collapses social into the third column alongside contact, per mockup **B**, so the component becomes strictly 4 blocks: rule → sello → 3-col → copyright.)

### 1.1 — Gold rule (block 01)

Single `<div class="footer-gold-rule" aria-hidden="true">`. **Keep the existing rule implementation unchanged** — it's already on-brand and the design proves it:

```css
.footer-gold-rule {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-ph-gold-muted) 20%,
    var(--color-ph-gold) 50%,
    var(--color-ph-gold-muted) 80%,
    transparent
  );
  opacity: 0.4;
}
```

### 1.2 — Sello editorial (block 02)

Full-width under the rule. Single line (wrapping on narrow viewports). Renders the split claim using the existing two i18n keys:

```astro
<p class="footer-sello">
  {t('hero.claim.lead')} <span class="footer-sello__accent">{t('hero.claim.accent')}</span>
</p>
```

**Why the split keys:** the existing `site.tagline` is a single flat string (`"Now. Next. Forever Football."`), which can't receive the two-tone gold accent without HTML. `hero.claim.lead` (`"Now. Next."`) and `hero.claim.accent` (`"Forever Football."`) already exist in both `es.ts` and `en.ts` for exactly this pattern. Reusing them means no new keys and a guaranteed hero-↔-footer lockup.

Typography (CSS, scoped inside `Footer.astro`):

```css
.footer-sello {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);  /* 28px → 44px */
  line-height: 1.15;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ph-white);
  margin: 0;
  padding-block: clamp(2.5rem, 5vw, 3.5rem) clamp(2rem, 4vw, 2.5rem);
}

.footer-sello__accent {
  color: var(--color-ph-gold);
}
```

- `text-transform: uppercase` means the i18n canonical strings (`"Now. Next."`, `"Forever Football."`) stay sentence-case in source and get rendered uppercase by CSS. Do NOT mutate the keys.
- `font-weight: 500` matches the hero claim render (Söhne book-ish, not display-heavy). The sello is prominent but not shouting.
- `letter-spacing: 0.04em` + uppercase + Söhne = editorial marquee feel (matches the HTML mockup).
- The sello sits edge-to-edge within `.ph-section` container padding (use `.ph-section` wrapper so its horizontal padding stays consistent with the rest of the site).

### 1.3 — Bloque funcional (block 03, 3-col grid)

Three columns, equal share on desktop (`grid-template-columns: 1fr 1fr 1fr`), stacks vertically under 768px. All three columns top-aligned.

**Column 1 — Brand mark**

Just the PHSPORT SVG logo. No tagline (the sello is the tagline). Keep the current `.footer-logo` SVG inline markup; size `height: 2rem` (matches current).

**Column 2 — Páginas**

`<nav aria-label={t('footer.nav.label')}>` with an eyebrow label and the four nav entries:

```
PÁGINAS              ← eyebrow, mono-ish, gold, uppercase
Inicio
Jugadores
Servicios
Sobre nosotros
```

Eyebrow uses `.footer-col-label` (already defined in the current file — keep as-is). Entries reuse `NAV_ITEMS` from `src/lib/navigation.ts` (post-Equipo cleanup, the list is exactly 4 items matching the eyebrow-labelled column). The existing `.footer-link` class and hover treatment (white-60 → white) carries over unchanged.

**Column 3 — Contacto + social**

Stacked: contact eyebrow + email on top, then `SÍGUENOS` eyebrow + 3 icon buttons underneath, with `margin-top: 1.5rem` separating them.

```
CONTACTO
info@phsport.es          ← t('footer.email'), gold on hover (already implemented)

SÍGUENOS                 ← new eyebrow — add key footer.social.label? (already exists, rename UI copy)
[IG] [LI] [X]            ← reuse <FooterSocialIcon> + existing .footer-social-link styles
```

**Decision re: `footer.social.label`:** the key already exists with value `"Redes sociales"` / `"Social media"` (used as `aria-label`). For the visible eyebrow we want `"Síguenos"` / `"Follow us"` — short and editorial. Add two new keys:

```ts
'footer.social.heading': 'Síguenos',          // es.ts
'footer.social.heading': 'Follow us',         // en.ts
```

Keep `footer.social.label` as the screen-reader `aria-label` on the `<ul>` (it's more descriptive for assistive tech). Eyebrow uses the new `heading` key.

Grid CSS:

```css
.footer-grid {
  display: grid;
  gap: 2.5rem;
  padding-block: clamp(2rem, 4vw, 3rem);
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr 1fr;
    gap: clamp(2rem, 4vw, 3rem);
    align-items: start;
  }
}
```

Mobile stack (< 768px): single column, brand → páginas → contacto+social. Already works via the default `display: grid` + single `grid-template-columns` at that breakpoint.

### 1.4 — Copyright bar (block 04)

Full-width horizontal bar separated from the 3-col grid by a thin white-10 divider. Mono-family text, small, faint.

```astro
<div class="footer-bottom">
  <p>&copy; {year} {t('site.name')}. {t('footer.rights')}</p>
</div>
```

```css
.footer-bottom {
  margin-top: clamp(2rem, 4vw, 2.5rem);
  padding-top: 1.25rem;
  padding-bottom: 1rem;
  border-top: 1px solid var(--color-ph-white-10);
}

.footer-bottom p {
  font-family: var(--font-mono);          /* was inherited display; switch to mono for receipt feel */
  font-size: 0.6875rem;                   /* 11px */
  letter-spacing: 0.05em;
  color: var(--color-ph-white-60);
  margin: 0;
}
```

Copy stays unchanged: `site.name` + `footer.rights` i18n keys already in place.

---

## 2 — Tokens

All colors, fonts, durations, easings come from already-declared globals in `src/styles/global.css` — **no new tokens needed**:

- `var(--color-ph-gold)`, `var(--color-ph-gold-muted)` — gold accent + rule gradient.
- `var(--color-ph-white)`, `var(--color-ph-white-60)`, `var(--color-ph-white-10)` — text tiers + divider.
- `var(--color-ph-black)` — implicit page bg.
- `var(--font-display)` — Söhne, for sello + nav + eyebrows + contact.
- `var(--font-mono)` — for the copyright line (added globally in Phase 3).
- `var(--ph-duration)`, `var(--ease-ph)` — hover transitions (already used).
- `var(--radius-sm)` — social icon chips.

---

## 3 — i18n changes

### Adds (ES + EN, both files)

```ts
// es.ts (around the existing footer.* group, line ~304)
'footer.social.heading': 'Síguenos',

// en.ts (symmetric)
'footer.social.heading': 'Follow us',
```

### Removes (both files)

Search for and delete every `home.instagram.*` key. The current `src/i18n/es.ts` and `src/i18n/en.ts` carry at least:

- `home.instagram.title`
- `home.instagram.postAria`

(If a broader audit finds more `home.instagram.*` keys — e.g. `home.instagram.cta`, `home.instagram.description` — delete them all. The implementation task grep-scopes the full prefix.)

### Keep unchanged

- `site.name`, `site.tagline`, `hero.claim.lead`, `hero.claim.accent` — the sello pulls from the `hero.claim.*` pair.
- `footer.pages`, `footer.contact`, `footer.email`, `footer.rights`, `footer.nav.label`, `footer.social.label`, `footer.social.instagram|linkedin|x`.

---

## 4 — Cleanup bundle (drives `npx astro check` to 0 errors / 0 warnings / 0 hints in `src/`)

Current baseline from `npx astro check`:

- **3 errors**
  1. `src/components/sections/HomeInstagramSection.astro:11` — `home.instagram.postAria` is not a `TranslationKey`.
  2. `src/components/sections/HomeInstagramSection.astro:16` — `home.instagram.title` is not a `TranslationKey`.
  3. `src/components/ui/Button.astro:27` — `type` prop (generic `string`) not assignable to `ButtonHTMLAttributes.type` (`"button" | "reset" | "submit" | null | undefined`).
- **3 hints inside `src/`** (astro-check surfaces them as `warning ts(6385)` but counts them under "hints"):
  - `BaseLayout.astro:3` — `ViewTransitions` import is deprecated.
  - `BaseLayout.astro:49` — `<ViewTransitions />` element is deprecated.
  - `HomeContactSection.astro:24` — inline `onsubmit="event…"` references deprecated global `event`.
- **3 hints outside `src/`** — `capture-animation.mjs` and `test-logo-animation.mjs` at repo root (local debug scripts). Out of scope.

### 4.1 — Delete `HomeInstagramSection.astro` and its feed

Confirmed orphaned (no importers anywhere in `src/`):

- Delete `src/components/sections/HomeInstagramSection.astro`.
- Delete `src/lib/instagramHomeFeed.ts`.
- Delete `home.instagram.*` keys in both `es.ts` and `en.ts` (see §3).

This clears **2 of the 3 errors** and removes the orphan.

### 4.2 — `Button.astro` type prop

`src/components/ui/Button.astro` spreads `...rest` onto either `<a>` or `<button>`. Because the `Props` union is `AnchorHTMLAttributes | ButtonHTMLAttributes`, TypeScript narrows the intersection's `type` down to `string`, which doesn't satisfy `<button>`'s `"button" | "submit" | "reset"` literal union. Fix by declaring an explicit `type` prop on `BaseProps` and destructuring it:

```ts
type BaseProps = {
  href?: string;
  variant?: 'primary' | 'secondary';
  class?: string;
  type?: 'button' | 'submit' | 'reset';
};

// …
const {
  href,
  variant = 'primary',
  class: className = '',
  type = 'button',
  ...rest
} = Astro.props;
```

Then in the `<button>` branch, pass `type={type}` explicitly (and keep `...rest`). This clears error #3.

### 4.3 — `ViewTransitions` → `ClientRouter`

Astro 5 deprecated `<ViewTransitions />` in favor of `<ClientRouter />` (same feature, renamed; the `fade` helper is still available from `astro:transitions`).

In `src/components/layout/BaseLayout.astro`:

```astro
---
// line 3: change import
import { ClientRouter, fade } from 'astro:transitions';
---

<!-- line 49: change usage -->
<ClientRouter />
```

Cross-check that no other file imports `ViewTransitions` (a grep over `src/` confirmed only `BaseLayout.astro` uses it; `src/scripts/dropdown.ts:115` only mentions it in a comment — optional: update the comment to "GSAP, ClientRouter…" for hygiene). This clears 2 hints.

### 4.4 — `HomeContactSection.astro` inline submit handler

`src/components/sections/HomeContactSection.astro:24` currently:

```html
<form class="home-contact__form" action="#" onsubmit="event.preventDefault();">
```

The `event` global reference is deprecated in strict mode. Replace with a scoped module script:

```astro
<form class="home-contact__form" action="#" data-prevent-submit>
  …
</form>

<script>
  document.querySelectorAll<HTMLFormElement>('form[data-prevent-submit]').forEach((form) => {
    form.addEventListener('submit', (event) => event.preventDefault());
  });
</script>
```

Use `data-prevent-submit` (not a class) so it's unambiguous this is a behavior hook, not a style hook. The script runs on initial load; for ClientRouter compatibility, also bind on `astro:page-load`:

```astro
<script>
  const attach = () => {
    document.querySelectorAll<HTMLFormElement>('form[data-prevent-submit]').forEach((form) => {
      form.addEventListener('submit', (event) => event.preventDefault());
    });
  };
  attach();
  document.addEventListener('astro:page-load', attach);
</script>
```

This clears the 3rd hint.

### 4.5 — Sanity pass

After the four sub-tasks, `npx astro check` should report:

```
Result (59 files):
- 0 errors
- 0 warnings
- 3 hints    ← all three are in root-level *.mjs debug scripts, not under src/
```

That's the acceptance gate: **zero errors / zero warnings / zero hints in `src/`**.

---

## 5 — Responsive behavior

| Breakpoint | Sello | 3-col grid | Social | Copyright |
| --- | --- | --- | --- | --- |
| ≥ 768px | Full width, `clamp(28px → 44px)`, single line (or natural wrap) | 3 equal columns, `align-items: start` | Row inside column 3 under contact | Full-width bar |
| < 768px | Full width, smaller end of clamp, wraps if needed | 1 column: brand → páginas → contacto+social | Row under contact (same column, unchanged) | Full-width bar |
| < 480px | Same; letter-spacing stays `0.04em` (sello is already readable at 28px uppercase) | Same | Icons retain 2.5rem tap target (already accessible) | Padding-block tightens via clamp |

No separate breakpoints below 480px are needed — the `clamp()`-driven type and the padded sections handle small viewports without dedicated media queries.

---

## 6 — Accessibility

- Gold rule: `aria-hidden="true"` (purely decorative — keep).
- Sello: plain `<p>` — `text-transform: uppercase` does NOT affect screen-reader pronunciation (readers announce the canonical casing of the DOM text).
- Nav column: wrapped in `<nav aria-label={t('footer.nav.label')}>` (reuses existing `"Navegación de pie de página"` / `"Footer navigation"`).
- Social icons: `<a>` with `aria-label` from `footer.social.instagram|linkedin|x` (unchanged from current); placeholder (`#`) social links render as `<span aria-disabled="true">` (unchanged from current).
- Contact email: `<a href="mailto:…">` — no aria needed, link text is the email.
- Copyright: `<p>` — no aria.
- Focus order: brand (no focusable children) → 4 nav links → email → 3 social → (end of footer). Linear and matches visual reading order.

---

## 7 — Out-of-scope notes

- **Footer background.** The footer inherits the page's dark bg (`var(--color-ph-black)` via BaseLayout). No explicit `background:` is set on `.footer` itself. This spec keeps that behavior — no new bg token, no gradient, no surface. If a future phase wants a distinct footer surface, that's a scoped change to `.footer { background: … }` only.
- **Motion.** No new intro animation for the footer. Hover transitions on links / social icons stay as-is (`var(--ph-duration) var(--ease-ph)`). The footer is a resting state — no scroll-triggered reveal needed.
- **Host-level 301s for `/equipo`, `/en/team`.** The Astro-config `redirects` emit a meta-refresh stub on static build. Real HTTP 301 requires host config (Netlify `_redirects` or Vercel `vercel.json`). That's a deployment task, not part of this phase. Ship it when the hosting target is finalized.

---

## 8 — Acceptance criteria

1. `npx astro check` reports **0 errors / 0 warnings / 0 hints** within `src/`. Any remaining hints are in root-level `*.mjs` debug scripts only.
2. The footer renders correctly on `/`, `/en/`, `/jugadores/`, `/en/players/`, `/servicios`, `/en/services`, `/sobre-nosotros`, `/en/about`, and a player detail page, at both a desktop viewport (≥1280px) and mobile viewport (~375px).
3. The sello reads as `NOW. NEXT.` in white + `FOREVER FOOTBALL.` in gold, uppercase, same line (or naturally wrapping at narrow widths).
4. The 3-col functional grid resolves to brand / páginas / contacto+social on desktop, stacks vertically on mobile.
5. The copyright bar is monospace, 11px, faint white, with a `white-10` top border.
6. Nav links in the footer navigate correctly in both locales (uses `NAV_ITEMS` — already validated in Phase 4).
7. `HomeInstagramSection.astro`, `instagramHomeFeed.ts`, and all `home.instagram.*` i18n keys are absent from the repo after this phase.
8. `BaseLayout.astro` uses `<ClientRouter />`; `HomeContactSection.astro` has no inline `onsubmit="event…"`.
9. `Button.astro` exports an explicit `type: 'button' | 'submit' | 'reset'` prop (defaults to `'button'`).
10. ES ↔ EN i18n parity holds (same set of flat keys in both files — verify with a diff after the adds/removes).

---

## 9 — Files touched

- **Create:** *none*.
- **Modify:**
  - `src/components/layout/Footer.astro` (rewrite template + styles).
  - `src/components/layout/BaseLayout.astro` (`ViewTransitions` → `ClientRouter`).
  - `src/components/sections/HomeContactSection.astro` (remove inline `onsubmit`, add scoped script).
  - `src/components/ui/Button.astro` (explicit `type` prop on `BaseProps`).
  - `src/i18n/es.ts` (add `footer.social.heading`, remove `home.instagram.*`).
  - `src/i18n/en.ts` (symmetric).
- **Delete:**
  - `src/components/sections/HomeInstagramSection.astro`.
  - `src/lib/instagramHomeFeed.ts`.
- **Unchanged but verified:**
  - `src/lib/navigation.ts` (already 4 entries post-Equipo cleanup).
  - `src/lib/social.ts` (SOCIAL_LINKS + isSocialPlaceholder — reused as-is).
  - `src/components/ui/FooterSocialIcon.astro` (reused as-is).
