# Footer Redesign V3 + Homepage Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `src/components/layout/Footer.astro` to the editorial 4-block design (rule → sello → 3-col → copyright) and finish the long-pending homepage cleanup so `npx astro check` reaches **0 errors / 0 warnings / 0 hints** inside `src/`.

**Architecture:** 7 small, independently-commitable tasks. Cleanup tasks come first (mechanical, low-risk, each clears specific `astro check` diagnostics). Then the footer rewrite, then a final verification sweep. Each task gates on `npx astro check` showing the expected reduction in errors/hints.

**Tech Stack:** Astro 5 (SSG, scoped styles, `astro:transitions` / `ClientRouter`, `astro:page-load` event), TypeScript strict, flat-key i18n (`TranslationKey` union in `src/i18n/es.ts` + `src/i18n/en.ts`), CSS custom properties from `src/styles/global.css`.

**Reference spec:** `docs/superpowers/specs/2026-04-20-footer-redesign-v3-design.md` (source of truth for every decision below).

**Baseline (before starting):** `npx astro check` → **3 errors, 0 warnings, 6 hints** (3 of the hints are in `src/`, 3 are in root-level `*.mjs` debug scripts and are out of scope).

**Note about "tests":** this repo has no unit test framework set up. The correctness gate is `npx astro check` (types + deprecations + i18n key validity) plus manual browser QA in the dev server. Each task below uses `astro check` as the objective verify step and calls out what to visually confirm for the footer task.

---

## File Structure

| File | Responsibility | Change type |
| --- | --- | --- |
| `src/components/sections/HomeInstagramSection.astro` | Orphaned Instagram carousel (no importers) | **Delete** |
| `src/lib/instagramHomeFeed.ts` | Data module for the above | **Delete** |
| `src/components/ui/Button.astro` | Polymorphic button/anchor | Modify — add `type` prop |
| `src/components/layout/BaseLayout.astro` | Root page shell | Modify — `ViewTransitions` → `ClientRouter` |
| `src/components/sections/HomeContactSection.astro` | Homepage contact form block | Modify — replace inline `onsubmit` |
| `src/i18n/es.ts`, `src/i18n/en.ts` | Flat-key translation tables | Modify — add `footer.social.heading` |
| `src/components/layout/Footer.astro` | Site-wide footer | **Full rewrite** (template + styles) |

No new files are created. Existing helpers (`NAV_ITEMS` in `src/lib/navigation.ts`, `SOCIAL_LINKS` + `isSocialPlaceholder` in `src/lib/social.ts`, `FooterSocialIcon` in `src/components/ui/FooterSocialIcon.astro`) are reused as-is.

---

## Task 1: Delete orphaned `HomeInstagramSection` + feed

Deleting the unused `HomeInstagramSection.astro` and its data module clears the two `home.instagram.*` `TranslationKey` errors reported by `astro check`. The `home.instagram.*` keys **do not exist** in `src/i18n/es.ts` or `src/i18n/en.ts` — that's exactly why the errors fire — so there is no i18n key removal work in this task (a grep for `home.instagram` in `src/i18n/` returns zero matches). Likewise, a grep for `HomeInstagramSection` or `instagramHomeFeed` over `src/` shows only the two files being deleted and no importers.

**Files:**
- Delete: `src/components/sections/HomeInstagramSection.astro`
- Delete: `src/lib/instagramHomeFeed.ts`

- [ ] **Step 1: Confirm orphan status**

Run:
```bash
grep -rn "HomeInstagramSection\|instagramHomeFeed\|home\.instagram" src/
```
Expected: only matches are self-references inside `src/components/sections/HomeInstagramSection.astro` (line 2 import, lines 11 and 16 `t()` calls). No matches under `src/pages/`, `src/components/layout/`, or anywhere else. If any other file references these names, stop and surface it — the assumption is wrong.

- [ ] **Step 2: Delete both files**

```bash
rm src/components/sections/HomeInstagramSection.astro src/lib/instagramHomeFeed.ts
```

- [ ] **Step 3: Verify astro check drops 2 errors**

Run:
```bash
npx astro check
```
Expected:
```
Result (59 files):
- 1 errors    (only Button.astro remains)
- 0 warnings
- 6 hints
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(cleanup): delete orphaned HomeInstagramSection + feed

Removes src/components/sections/HomeInstagramSection.astro and
src/lib/instagramHomeFeed.ts. Both were unreferenced from any page or
layout; the component's t('home.instagram.title') / t('home.instagram.postAria')
calls produced 2 of the 3 astro-check errors because those i18n keys
were never defined.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Tighten `Button.astro` `type` prop

`src/components/ui/Button.astro` spreads `...rest` onto either `<a>` or `<button>`. TypeScript narrows the intersection of `AnchorHTMLAttributes | ButtonHTMLAttributes` such that `type` becomes generic `string`, which is not assignable to the `<button>` element's literal union `"button" | "submit" | "reset"`. Fix by declaring `type` explicitly on `BaseProps` (so consumers get the correct literal union) and destructuring it out of `...rest` with a default of `'button'`.

**Files:**
- Modify: `src/components/ui/Button.astro:1-20`

- [ ] **Step 1: Replace the frontmatter block**

Replace lines 1–20 of `src/components/ui/Button.astro` with:

```astro
---
type BaseProps = {
  href?: string;
  variant?: 'primary' | 'secondary';
  class?: string;
  type?: 'button' | 'submit' | 'reset';
};

type Props = BaseProps &
  (
    | astroHTML.JSX.AnchorHTMLAttributes
    | astroHTML.JSX.ButtonHTMLAttributes
  );

const {
  href,
  variant = 'primary',
  class: className = '',
  type = 'button',
  ...rest
} = Astro.props;
---
```

- [ ] **Step 2: Pass `type` explicitly on the `<button>` branch**

Replace the `<button>` element at `src/components/ui/Button.astro:27`:

Old:
```astro
<button class:list={['btn', `btn--${variant}`, className]} {...rest}>
```

New:
```astro
<button type={type} class:list={['btn', `btn--${variant}`, className]} {...rest}>
```

Leave the `<a>` branch (line 23) unchanged — the `type` prop is harmless on an anchor but doesn't need to be forwarded there.

- [ ] **Step 3: Verify astro check reaches 0 errors**

Run:
```bash
npx astro check
```
Expected:
```
Result (59 files):
- 0 errors
- 0 warnings
- 6 hints
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Button.astro
git commit -m "fix(ui): declare explicit type prop on Button

Fixes astro-check error where the union Props intersection narrowed
<button>'s type attribute to generic string, failing ButtonHTMLAttributes.
Declares type?: 'button' | 'submit' | 'reset' on BaseProps with a
'button' default and forwards it explicitly on the <button> branch.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Migrate `ViewTransitions` → `ClientRouter` in `BaseLayout.astro`

Astro 5 deprecated `<ViewTransitions />`; the replacement `<ClientRouter />` has identical semantics. Both are exported from `astro:transitions`. `fade` is still imported and used for a page transition — keep it.

**Files:**
- Modify: `src/components/layout/BaseLayout.astro:3`
- Modify: `src/components/layout/BaseLayout.astro:49`

- [ ] **Step 1: Update the import**

Replace `src/components/layout/BaseLayout.astro:3`:

Old:
```astro
import { ViewTransitions, fade } from 'astro:transitions';
```

New:
```astro
import { ClientRouter, fade } from 'astro:transitions';
```

- [ ] **Step 2: Update the element usage**

Replace `src/components/layout/BaseLayout.astro:49`:

Old:
```astro
    <ViewTransitions />
```

New:
```astro
    <ClientRouter />
```

- [ ] **Step 3: Verify no other `ViewTransitions` references remain**

Run:
```bash
grep -rn "ViewTransitions" src/
```
Expected output: only `src/scripts/dropdown.ts:115` (a comment reading "cuyos contenedores fueron animados (GSAP, ViewTransitions…)"). The comment is informational — leave it. No other `.astro` / `.ts` / `.tsx` hits.

- [ ] **Step 4: Verify astro check drops 2 hints**

Run:
```bash
npx astro check
```
Expected: 4 remaining hints — 1 inside `src/` (`HomeContactSection.astro:24` `event` deprecated), 3 in root-level `*.mjs` debug scripts.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/BaseLayout.astro
git commit -m "refactor(layout): ViewTransitions -> ClientRouter (Astro 5)

Astro 5 deprecated <ViewTransitions />. Renames the import and the
element; semantics are identical. fade() helper import is unchanged.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Replace inline `onsubmit="event…"` in `HomeContactSection.astro`

The inline `onsubmit="event.preventDefault();"` handler at `src/components/sections/HomeContactSection.astro:24` references the deprecated `event` global (TS ts(6385) hint). Replace with a scoped Astro `<script>` that binds `submit` via `addEventListener`. Re-bind on `astro:page-load` so the handler reattaches after a `ClientRouter` navigation.

**Files:**
- Modify: `src/components/sections/HomeContactSection.astro:24`
- Modify: `src/components/sections/HomeContactSection.astro` (append a `<script>` block at the end of the file, outside the `<style>` block if one exists — if the file already has a `<script>` at the bottom, extend it instead of adding a new one)

- [ ] **Step 1: Remove the inline handler and add a data attribute**

Replace `src/components/sections/HomeContactSection.astro:24`:

Old:
```astro
    <form class="home-contact__form" action="#" onsubmit="event.preventDefault();">
```

New:
```astro
    <form class="home-contact__form" action="#" data-prevent-submit>
```

- [ ] **Step 2: Append the scoped script**

Append this block to the end of `src/components/sections/HomeContactSection.astro` (after any existing `<style>` block):

```astro
<script>
  const attachPreventSubmit = () => {
    document
      .querySelectorAll<HTMLFormElement>('form[data-prevent-submit]')
      .forEach((form) => {
        form.addEventListener('submit', (event) => event.preventDefault());
      });
  };

  attachPreventSubmit();
  document.addEventListener('astro:page-load', attachPreventSubmit);
</script>
```

Note: `addEventListener` with the same listener function reference is idempotent — re-binding on every `astro:page-load` is safe because `.forEach` queries the DOM anew each time, and the listener we add is a fresh closure each call (which is fine for a preventDefault no-op). If multiple submit handlers bother you in the future, guard with a `data-bound` flag; not needed now.

- [ ] **Step 3: Verify astro check drops 1 more hint**

Run:
```bash
npx astro check
```
Expected: 3 remaining hints, all in root-level `*.mjs` debug scripts. Inside `src/`: **0 errors / 0 warnings / 0 hints**.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/HomeContactSection.astro
git commit -m "refactor(home-contact): replace inline onsubmit with scoped script

The inline onsubmit='event.preventDefault();' referenced the deprecated
'event' global (ts(6385) hint). Moves the handler into a scoped <script>
that binds via addEventListener on load and re-binds on astro:page-load
for ClientRouter navigations. Uses a data-prevent-submit attribute as
an explicit behavior hook.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Add `footer.social.heading` i18n keys

The Phase 5 footer adds a visible eyebrow "Síguenos" / "Follow us" above the social icons. The existing `footer.social.label` key (`"Redes sociales"` / `"Social media"`) is kept for the `<ul>` `aria-label` (more descriptive for assistive tech); the new `footer.social.heading` is for the visible text.

**Files:**
- Modify: `src/i18n/es.ts` (insert near the other `footer.social.*` keys, around line 304)
- Modify: `src/i18n/en.ts` (insert near the other `footer.social.*` keys, around line 306)

- [ ] **Step 1: Add the ES key**

In `src/i18n/es.ts`, find the line:
```ts
  'footer.social.label': 'Redes sociales',
```

Insert directly after it:
```ts
  'footer.social.heading': 'Síguenos',
```

- [ ] **Step 2: Add the EN key**

In `src/i18n/en.ts`, find the line:
```ts
  'footer.social.label': 'Social media',
```

Insert directly after it:
```ts
  'footer.social.heading': 'Follow us',
```

- [ ] **Step 3: Verify ES ↔ EN parity**

Run this comparison:
```bash
grep -oE "^  '[^']+'" src/i18n/es.ts | sort -u > /tmp/es-keys.txt
grep -oE "^  '[^']+'" src/i18n/en.ts | sort -u > /tmp/en-keys.txt
diff /tmp/es-keys.txt /tmp/en-keys.txt
```

The `^  '[^']+'` pattern anchors on leading whitespace and captures only the key (the quoted string at the start of each entry line), not values. Expected: empty diff. If the diff surfaces a key present in one file but not the other, fix it before moving on.

- [ ] **Step 4: Verify astro check still clean in src/**

Run:
```bash
npx astro check
```
Expected: unchanged from Task 4 (inside `src/`: 0 errors / 0 warnings / 0 hints).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/es.ts src/i18n/en.ts
git commit -m "feat(i18n): add footer.social.heading keys (es/en)

Adds 'footer.social.heading' -> 'Síguenos' / 'Follow us' for the
visible eyebrow above the footer social icons. The existing
'footer.social.label' key stays as the <ul> aria-label (descriptive
phrasing for assistive tech).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: Rewrite `Footer.astro` to the 4-block editorial design

Full rewrite of `src/components/layout/Footer.astro`. Template + styles. Uses existing helpers (`NAV_ITEMS`, `SOCIAL_LINKS`, `FooterSocialIcon`, `useTranslations`, `getLangFromUrl`) and existing global tokens (`--color-ph-*`, `--font-display`, `--font-mono`, `--ph-duration`, `--ease-ph`, `--radius-sm`). Adds no new tokens.

Structure:
1. Gold rule (kept identical to current).
2. Full-width sello: `{t('hero.claim.lead')} <span class="footer-sello__accent">{t('hero.claim.accent')}</span>` — uppercase via CSS, gold on the accent.
3. 3-column grid (`1fr 1fr 1fr` ≥ 768px): brand SVG / PÁGINAS nav / CONTACTO + email + SÍGUENOS + 3 social icons.
4. Copyright bar: mono 11px, faint, `white-10` top border.

**Files:**
- Modify (full rewrite): `src/components/layout/Footer.astro`

- [ ] **Step 1: Replace the entire file content**

Overwrite `src/components/layout/Footer.astro` with this exact content:

```astro
---
import { useTranslations, getLangFromUrl } from '@/i18n/utils';
import { NAV_ITEMS } from '@/lib/navigation';
import { SOCIAL_LINKS, isSocialPlaceholder, type SocialId } from '@/lib/social';
import FooterSocialIcon from '@/components/ui/FooterSocialIcon.astro';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const year = new Date().getFullYear();

const nav = NAV_ITEMS.map((item) => ({
  href: item.href[lang],
  label: t(item.labelKey),
}));

const socialLabel = (id: SocialId) => {
  const key =
    id === 'instagram'
      ? 'footer.social.instagram'
      : id === 'linkedin'
        ? 'footer.social.linkedin'
        : 'footer.social.x';
  return t(key);
};
---

<footer class="footer">
  <div class="footer-gold-rule" aria-hidden="true"></div>

  <div class="ph-section">
    <!-- 02 · Sello editorial -->
    <p class="footer-sello">
      {t('hero.claim.lead')} <span class="footer-sello__accent">{t('hero.claim.accent')}</span>
    </p>

    <!-- 03 · 3-col funcional -->
    <div class="footer-grid">
      <!-- Col 1: brand -->
      <div class="footer-brand">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 259.8 206.1"
          fill="currentColor"
          aria-hidden="true"
          class="footer-logo"
        >
          <polygon points="0 206.1 58.2 206.1 57.9 145.5 158.1 45.4 112.7 0 0 0 0 52.6 76.9 52.6 0 128.7" />
          <polygon points="122.6 206.1 200.1 206.1 152.2 157.8 173 137.1 182.4 146.4 259.8 146.4 169.6 55.6 130.5 94.2 131.8 95.6 141.1 105.4 120.3 125.8 109.8 115.4 70.8 153.9" />
        </svg>
      </div>

      <!-- Col 2: páginas -->
      <nav class="footer-col" aria-label={t('footer.nav.label')}>
        <span class="footer-col-label">{t('footer.pages')}</span>
        <ul class="footer-nav">
          {nav.map((item) => (
            <li>
              <a href={item.href} class="footer-link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <!-- Col 3: contacto + social -->
      <div class="footer-col">
        <span class="footer-col-label">{t('footer.contact')}</span>
        <div class="footer-contact">
          <a href={`mailto:${t('footer.email')}`} class="footer-email">
            {t('footer.email')}
          </a>
        </div>

        <span class="footer-col-label footer-col-label--social">{t('footer.social.heading')}</span>
        <ul class="footer-social-list" role="list" aria-label={t('footer.social.label')}>
          {
            SOCIAL_LINKS.map((s) => (
              <li>
                {isSocialPlaceholder(s.href) ? (
                  <span
                    class="footer-social-link footer-social-link--disabled"
                    aria-disabled="true"
                    title={socialLabel(s.id)}
                  >
                    <FooterSocialIcon id={s.id} />
                  </span>
                ) : (
                  <a
                    href={s.href}
                    class="footer-social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLabel(s.id)}
                  >
                    <FooterSocialIcon id={s.id} />
                  </a>
                )}
              </li>
            ))
          }
        </ul>
      </div>
    </div>

    <!-- 04 · Copyright -->
    <div class="footer-bottom">
      <p>&copy; {year} {t('site.name')}. {t('footer.rights')}</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    z-index: 1;
  }

  /* 01 · Gold rule (unchanged from previous version) */
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

  /* 02 · Sello editorial */
  .footer-sello {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
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

  /* 03 · 3-col funcional */
  .footer-grid {
    display: grid;
    gap: 2.5rem;
    padding-block: clamp(2rem, 4vw, 3rem);
    border-top: 1px solid var(--color-ph-white-10);
  }

  @media (min-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr 1fr 1fr;
      gap: clamp(2rem, 4vw, 3rem);
      align-items: start;
    }
  }

  .footer-brand {
    display: flex;
    align-items: flex-start;
  }

  .footer-logo {
    height: 2rem;
    width: auto;
    color: var(--color-ph-white);
  }

  .footer-col {
    display: flex;
    flex-direction: column;
  }

  .footer-col-label {
    font-family: var(--font-display);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-ph-gold);
  }

  .footer-col-label--social {
    margin-top: 1.5rem;
  }

  .footer-nav {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin: 0.875rem 0 0;
    padding: 0;
    list-style: none;
  }

  .footer-link {
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-ph-white-60);
    transition: color var(--ph-duration) var(--ease-ph);
  }

  .footer-link:hover {
    color: var(--color-ph-white);
  }

  .footer-contact {
    margin-top: 0.875rem;
  }

  .footer-email {
    font-family: var(--font-display);
    font-size: 0.875rem;
    color: var(--color-ph-white-60);
    transition: color var(--ph-duration) var(--ease-ph);
  }

  .footer-email:hover {
    color: var(--color-ph-gold);
  }

  .footer-social-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 0.875rem 0 0;
    padding: 0;
    list-style: none;
  }

  .footer-social-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-sm);
    color: var(--color-ph-white-60);
    border: 1px solid var(--color-ph-white-10);
    transition:
      color var(--ph-duration) var(--ease-ph),
      border-color var(--ph-duration) var(--ease-ph),
      background var(--ph-duration) var(--ease-ph);
  }

  .footer-social-link:hover {
    color: var(--color-ph-gold);
    border-color: var(--color-ph-gold-muted);
    background: rgba(214, 178, 94, 0.06);
  }

  .footer-social-link--disabled {
    opacity: 0.45;
    pointer-events: none;
  }

  /* 04 · Copyright */
  .footer-bottom {
    margin-top: clamp(2rem, 4vw, 2.5rem);
    padding-top: 1.25rem;
    padding-bottom: 1rem;
    border-top: 1px solid var(--color-ph-white-10);
  }

  .footer-bottom p {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.05em;
    color: var(--color-ph-white-60);
    margin: 0;
  }
</style>
```

Notes on what changed vs. the previous file:
- Removed the `.footer-tagline` paragraph under the logo (tagline moved to the sello).
- Removed the separate `.footer-social-block` section (social now lives inside column 3 below contact).
- Added the `.footer-sello` block and its `__accent` span.
- `.footer-grid` now has `grid-template-columns: 1fr 1fr 1fr` (was `2fr 1fr 1fr`) and a `border-top` to visually separate it from the sello.
- Copyright switched to `var(--font-mono)` at 11px with `letter-spacing: 0.05em`.
- `.footer-social-list` gets `aria-label={t('footer.social.label')}` on the `<ul>` (descriptive phrasing for assistive tech); the visible eyebrow is `t('footer.social.heading')`.

- [ ] **Step 2: Run astro check**

Run:
```bash
npx astro check
```
Expected: inside `src/`: **0 errors / 0 warnings / 0 hints**. Total: 3 hints (all in root `*.mjs`).

- [ ] **Step 3: Manual QA in the dev server**

Start the dev server (if not already running):
```bash
npx astro dev
```

Load each of these URLs in a browser and scroll to the footer:
- http://localhost:4321/
- http://localhost:4321/en/
- http://localhost:4321/jugadores/
- http://localhost:4321/en/players/
- http://localhost:4321/servicios
- http://localhost:4321/en/services
- http://localhost:4321/sobre-nosotros
- http://localhost:4321/en/about

Visual acceptance checklist for each:
1. Gold rule line is visible at the very top of the footer.
2. Sello reads `NOW. NEXT.` in white and `FOREVER FOOTBALL.` in gold, both uppercase, on one line (or wrapping naturally at narrow widths).
3. Below the sello there's a thin divider, then three columns: PHSPORT logo (left), `PÁGINAS` nav with 4 entries (center), `CONTACTO` with `info@phsport.es` + `SÍGUENOS` with 3 social chips (right).
4. On EN pages, copy is `PAGES`, `CONTACT`, `FOLLOW US`, and nav labels are English (`Home`, `Players`, `Services`, `About us`).
5. Resize the window below 768px: columns stack vertically, sello scales down, social chips stay 2.5rem tall (touch target intact).
6. Hover a nav link → color shifts white-60 → white.
7. Hover the email → color shifts white-60 → gold.
8. Hover a social chip → color gold, border gold-muted, faint gold bg.
9. Copyright at the bottom reads `© 2026 PHSPORT. Todos los derechos reservados.` (ES) / `© 2026 PHSPORT. All rights reserved.` (EN) in monospace 11px.
10. No layout shift vs. the rest of the page (sello + grid sit inside `.ph-section` horizontal padding, not edge-to-edge).

Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Footer.astro
git commit -m "feat(footer): rewrite Footer to V3 editorial design (phase 5)

Four-block structure: gold rule -> full-width uppercase sello with gold
accent on 'Forever Football.' -> 3-col functional grid (brand / pages /
contact + social) -> mono copyright. Reuses existing hero.claim.lead +
hero.claim.accent i18n keys for the sello (same source as the hero
claim). Social eyebrow uses the new footer.social.heading key; the
existing footer.social.label stays as the <ul> aria-label.

Closes Phase 5 of the homepage V3 redesign.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Final verification + acceptance sweep

Confirm the whole Phase 5 bundle lands clean: astro check green inside `src/`, ES ↔ EN i18n parity preserved, no stray references to deleted names, and a final Playwright / manual pass across the full page set to catch any regression the footer rewrite might have introduced on shared layout (header, section spacing, page bottom).

- [ ] **Step 1: Run astro check once more**

Run:
```bash
npx astro check
```
Expected:
```
Result (59 files):
- 0 errors
- 0 warnings
- 3 hints
```
All 3 hints must be inside root-level `*.mjs` files (`capture-animation.mjs`, `test-logo-animation.mjs`). If ANY hint is inside `src/`, stop and fix it before declaring done.

- [ ] **Step 2: Confirm no stray references to deleted names**

Run:
```bash
grep -rn "HomeInstagramSection\|instagramHomeFeed\|home\.instagram\|ViewTransitions" src/
```
Expected: only one match — the informational comment at `src/scripts/dropdown.ts:115`. No `HomeInstagramSection` / `instagramHomeFeed` / `home.instagram` anywhere in `src/`. No `ViewTransitions` outside the comment.

- [ ] **Step 3: ES ↔ EN i18n key parity check**

Run:
```bash
grep -oE "^  '[^']+'" src/i18n/es.ts | sort -u > /tmp/es-keys.txt
grep -oE "^  '[^']+'" src/i18n/en.ts | sort -u > /tmp/en-keys.txt
diff /tmp/es-keys.txt /tmp/en-keys.txt
```
Expected: empty diff (every key in ES exists in EN and vice versa). If the diff is non-empty, surface the asymmetric keys and fix them before declaring done.

- [ ] **Step 4: Production build sanity check**

Run:
```bash
npx astro build
```
Expected: build finishes without errors. Warnings about deprecated APIs should be zero (we cleared them in Tasks 3 and 4). If the build logs any new warnings introduced by our changes, investigate.

- [ ] **Step 5: Commit (only if steps 1–4 required any fixes)**

If any of the previous steps surfaced issues that required code changes, commit them now:

```bash
git add -A
git commit -m "chore(phase-5): address final verification findings

<brief description of what was fixed>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

If nothing needed fixing, skip this step.

- [ ] **Step 6: Use the finishing-a-development-branch skill**

Phase 5 is complete. Hand off to `superpowers:finishing-a-development-branch` to determine whether to merge locally, push and create a PR, keep as-is, or discard. The user has expressed a preference throughout the V3 redesign to merge locally without pushing (their call at Phase 3), so the default is likely Option 1 — but present the full menu and let the user choose.

---

## Acceptance gate (end-of-plan)

The plan is complete when all of the following hold:

- `npx astro check` → 0 errors / 0 warnings / 0 hints inside `src/`.
- `npx astro build` succeeds with no deprecation warnings.
- `src/components/sections/HomeInstagramSection.astro` and `src/lib/instagramHomeFeed.ts` do not exist.
- `src/components/ui/Button.astro` declares an explicit `type?: 'button' | 'submit' | 'reset'` prop.
- `src/components/layout/BaseLayout.astro` uses `<ClientRouter />`.
- `src/components/sections/HomeContactSection.astro` has no inline `onsubmit="event…"`.
- `src/i18n/es.ts` and `src/i18n/en.ts` each contain `'footer.social.heading'` with the correct value, and ES ↔ EN key parity holds.
- The rewritten `src/components/layout/Footer.astro` renders the 4-block layout correctly on all 8 URLs listed in Task 6 Step 3, at both desktop and mobile viewports.
