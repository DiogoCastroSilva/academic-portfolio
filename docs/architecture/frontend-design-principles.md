# Frontend Design Principles

> The ongoing design contract for the academic-portfolio template UI.
> This document captures _why_ the UI looks and behaves the way it does,
> so maintainers and fork-owners can reason about changes consistently.
> Use ADRs for discrete architectural decisions; this document is the
> cross-cutting design language.

## 1. Information Architecture

The site has three content collection families (projects, publications, blog), a static About page, and a homepage that previews each collection. Navigation mirrors this structure: each collection has exactly one top-level NavBar item; detail pages do **not** add per-entry navigation.

## 2. Reusable Page Patterns

Every collection follows the same pattern:

| Component               | Role                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `ContentCardSection`    | Server-side list/grid of content cards with optional `limit` and `viewAllHref`            |
| `PublicationRowSection` | Client-side text-first academic row list with viewport-triggered reveal, optional `limit` |
| `Pagination`            | Server-side path-based pager (`/blog/`, `/blog/page/2/`) — renders nothing when ≤1 page   |
| `ContentDetail`         | Server-side detail page with `prose` Markdown rendering                                   |

## 3. Typography / Spacing / Content Widths

### Font system

- **Sans-serif (Inter, variable):** interface and reading typography — body, nav, cards, metadata, controls. Full `wght` range (100–900), `opsz` axis.
- **Display (DM Serif Display, variable):** editorial personality for the researcher name (H1) and major prose headings (H1/H2 inside `prose`). Only weight 400 (normal + italic). `font-weight: 400` must be set explicitly everywhere it is used — the browser does not synthesize a bolder weight for this file, so `font-bold` would produce no visible effect or fall back to the wrong face.

### Typography roles and sizes

| Role                           | Element / class                          | Font                                       | Size                                                                                                                                                         | Weight              | Notes                                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Researcher name (display)      | `.profile-name`                          | `--font-display`                           | `clamp(2.5rem, 5vw + 1rem, 4rem)`                                                                                                                            | 400                 | Fluid via `clamp()`; `~40px`@320px → `~64px`@1200px. `text-wrap: balance`, `letter-spacing: -0.02em`, `line-height: 1.05`. Uses `color: var(--color-text-primary)` for dominant, editorial prominence — size is the primary hierarchy signal, color reinforces it. |
| Page title (H1) — detail pages | Article `<h1>` in `ContentDetail`        | `--font-display`                           | `1.875rem` → `md:text-4xl` (2.25rem)                                                                                                                         | 400                 | Editorial display; distinct from `.profile-name` which is the site-level brand headline. Uses `text-text-primary` for contrast against the page surface.                                                                                                           |
| Section heading (H2)           | `.font-display` in sections              | `--font-display`                           | `text-2xl` (1.5rem) → `md:text-3xl` (1.875rem)                                                                                                               | 400                 | "About Me", "Education", "Skills & Tools", etc. Uses `text-text-secondary` so headings read lighter than body text, creating editorial contrast.                                                                                                                   |
| Card title                     | `.font-semibold` in `ContentCardSection` | `--font-sans`                              | `text-xl` (1.25rem)                                                                                                                                          | 600                 | `line-clamp-2`; Inter supports weight 600.                                                                                                                                                                                                                         |
| Prose headings (H2–H6)         | Inside `.prose`                          | h2: `--font-display`; h3–h6: `--font-sans` | h2: `prose-h2:text-2xl` (24px); h3: `prose-h3:text-xl` (20px); h4: `prose-h4:text-lg` (18px); h5: `prose-h5:text-base` (16px); h6: `prose-h6:text-sm` (14px) | h2: 400; h3–h6: 700 | h1/h2 use DM Serif Display 400 (weight override in `global.css`). h3–h6 use Inter 700 (via `prose-headings:font-bold`). `text-wrap: balance` on all prose headings for fluid re-wrapping on resize/zoom.                                                           |
| Prose body                     | `.prose-lg` / `.prose-sm`                | `--font-sans`                              | 1.1875rem (~19px) / 1.0625rem (~17px)                                                                                                                        | 400                 | `prose-lg` for detail pages and AboutHero bio, `prose-sm` for homepage AboutSection preview.                                                                                                                                                                       |
| Secondary / metadata           | `text-text-secondary`, `text-sm`         | `--font-sans`                              | 0.875rem (14px)                                                                                                                                              | 400                 | Dates, tags, captions — not long-form reading.                                                                                                                                                                                                                     |
| Navigation / controls          | `--font-sans`                            | `--font-sans`                              | 0.875–1rem                                                                                                                                                   | 500                 | NavBar, buttons, tags. `font-medium` for interactive weight.                                                                                                                                                                                                       |

### Line heights and spacing

- **Long-form body:** `prose-lg` line-height 1.7 (was 1.78). Paragraph spacing overridden to `prose-p:my-4` (≈0.84em at 19px body) for tighter rhythm than the plugin default; `prose-p:leading-[1.7]` sets explicit line-height.
- **Homepage preview:** `prose-sm` line-height 1.65; bumped from 14px → 16px → 17px (1.0625rem) so the AboutSection biography reads comfortably on the home page. `prose-lg` (19px) is reserved for the About page biography and detail page content.
- **Display headings:** `.profile-name` line-height 1.05 — tight and authoritative.
- **Prose semantic color overrides:** ContentDetail and AboutSection prose containers use non-prefixed `prose-*` color utilities (e.g. `prose-headings:text-text-primary`, `prose-strong:text-text-primary`, `prose-a:text-link`) rather than `dark:`-prefixed or `dark:prose-invert` variants. This ensures all prose element text resolves to theme-aware semantic tokens in both light and dark modes. Without these overrides, the @tailwindcss/typography plugin's defaults (`--tw-prose-headings`, `--tw-prose-strong`, `--tw-prose-a`, etc.) resolve to hardcoded oklch values that do not adapt to the `[data-theme="dark"]` attribute, causing contrast failures on dark surfaces.
  - **Inline `<code>` color:** The `prose-code` text-color utility is intentionally NOT used because it targets ALL `<code>` elements — including `<pre><code>` — which would override the plugin's `color: inherit` for `pre code` and cause black-on-black text in light mode. Instead, the `--tw-prose-code` CSS variable is overridden directly in `typography.css` to `var(--color-text-primary)`. This only affects standalone inline `<code>` (which uses `color: var(--tw-prose-code)`); `<pre><code>` (which uses `color: inherit`) and `<a><code>` (which also uses `color: inherit`) are left untouched.
  - **Inline `<code>` background:** `--color-code-bg` was changed from `#f3f4f6`/`#0e3a5a` to `#e2e8f0` (slate-200) / `#1e293b` (slate-800) because the previous values were too similar to `--color-surface-page` (`#f5f8f6` mist-green / `#0f2a36` abyssal teal) in both themes. The new values provide a clear visual distinction while maintaining WCAG 2.2 AA text contrast (`--color-text-primary` on `#e2e8f0` ≈ 14:1 light; on `#1e293b` ≈ 7:1 dark). `<pre><code>` backgrounds are reset to transparent in `typography.css` so the `prose-code:bg-code-bg` utility does not bleed into code blocks.
- **Heading hierarchy inside `prose`:** h1 capped at `2.25rem` (36px) inside `prose-lg` and `1.75rem` (28px) inside `prose-sm`. h2 at `text-2xl` (24px), h3 at `text-xl` (20px), h4 at `text-lg` (18px), h5 at `text-base` (16px), h6 at `text-sm` (14px). h1/h2 use DM Serif Display 400; h3–h6 use Inter 700.
- **Maximum reading width:** `prose` class sets `max-width: 65ch` via the typography plugin; this yields ~42–46 characters per line at 19px body — optimally readable. The parent `ContentDetail` article constrains to `max-w-3xl`, and `max-w-none` is used on the prose div so the `65ch` constraint governs.

### Spacing rules

- **Spacing scale:** 4/8/12/16/24 — section padding uses `p-6 sm:p-10 lg:p-12` for responsive breathing room.
- All cards and sections use responsive padding to avoid horizontal scroll at 320 CSS px.

### Responsive behavior

- **Profile name (`.profile-name`):** uses CSS `clamp()` for continuous fluid sizing — no abrupt jumps at breakpoints.
- **All other elements:** use Tailwind's step-based responsive utilities at `sm` (640px), `md` (768px), and `lg` (1024px) breakpoints.
- `flex min-w-0` on flex children prevents flex items from forcing minimum width and causing overflow of long URLs/titles.

### Responsive testing summary

| Viewport                  | Width       | Tested pages        | Check                                                               |
| ------------------------- | ----------- | ------------------- | ------------------------------------------------------------------- |
| iPhone SE / narrow mobile | 320–375px   | About, Home, Detail | No horizontal overflow; headings not clipped                        |
| Tablet                    | 640–768px   | About, Home, Detail | `.profile-name` at ~48–52px; cards wrap to 2-col                    |
| Laptop                    | 1024–1280px | About, Home, Detail | `.profile-name` at ~52–56px; cards 3-col                            |
| Large desktop             | 1440–1920px | About, Home, Detail | `.profile-name` capped at 4rem (64px); max-width 65ch governs prose |

### Browser zoom and text-scaling

- `clamp()` is inherently zoom-friendly — it respects the browser's font-size preference and scales proportionally.
- `text-wrap: balance` re-balances at every viewport size on zoom.
- `overflow-wrap: anywhere` prevents clipping of long unbreakable strings at any zoom level.

### Markdown element coverage

All standard Markdown/GFM elements rendered by the `marked` pipeline are styled via `@tailwindcss/typography` with targeted overrides. See `ContentDetail.tsx` for the authoritative class list.

| Element         | Treatment                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `h1`            | Capped at `2.25rem` (36px) in `prose-lg`; `1.75rem` (28px) in `prose-sm`                                                                         |
| `h2`            | `prose-h2:text-2xl` (24px); DM Serif Display 400 via `global.css` override                                                                       |
| `h3`–`h6`       | `text-xl`/`text-lg`/`text-base`/`text-sm`; Inter 700 via `prose-headings:font-bold`                                                              |
| `p`             | `prose-p:my-4` (1rem spacing); `prose-p:leading-[1.7]`; `prose-p:break-words`                                                                    |
| `ul`/`ol`       | `list-disc`/`list-decimal`, `pl-6`, `my-4`; `li:my-2` for item spacing                                                                           |
| `a`             | `var(--color-link)`; no underline by default; underline + `text-underline-offset` on hover/focus                                                 |
| `strong`        | `prose-strong:font-bold`                                                                                                                         |
| `em`            | `prose-em:italic`                                                                                                                                |
| `blockquote`    | `border-l-4 border-accent`, `pl-4`, `italic`                                                                                                     |
| `code` (inline) | `--tw-prose-code` overridden to `var(--color-text-primary)` in `typography.css`; `bg-code-bg`, `px-2`, `py-1`, `rounded`, `font-mono`, `text-sm` |
| `pre`           | `bg-pre-bg`, `text-pre-text`, `p-4`, `rounded-lg`, `overflow-x-auto`                                                                             |
| `table`         | `border-collapse`, `w-full`, `my-4`, `thead:bg-surface-tinted`; cells get `break-word`                                                           |
| `img`           | `rounded-lg`, `my-6`; wrapped in `<figure>` with optional `<figcaption>`                                                                         |
| `hr`            | Plugin default (`border-border`, `my-4`)                                                                                                         |

**Tables:** The content renderer (`marked-extensions.ts`) wraps every `<table>` in a `<div class="overflow-x-auto">` via the postprocess hook, since GFM tables can exceed the 65ch reading column. The wrapper is transparent when the table fits within the container. Table cells (`td`/`th`) get `overflow-wrap: break-word` from `typography.css`.

**Links:** Prose links use `var(--color-link)` (deep river blue `#075985` in light mode, sky-300 `#7dd3fc` in dark mode) — both achieve ≥4.5:1 contrast against their backgrounds. Links are underlined on hover and focus-visible (with `text-underline-offset: 0.2em`), providing a non-color-only indicator. `prose-a:break-words` prevents long URLs from overflowing narrow containers.

## 4. Card and Tag Rules

- **Card layout:** 16/9 image, metadata row (date + tags), title (line-clamp-2), excerpt (line-clamp-3).
- **Tag limit:** At most 2 tags on collection cards. When more exist, show an accessible `+N more` indicator with `aria-label`. Full tag list is always visible on the detail page.
- **Card links:** The entire card is one `next/link` with `aria-label="Read more: {title}"`. No interactive controls (buttons, popovers) inside the clickable card.
- **Featured badge:** When `selected: true` in frontmatter, a "Featured" badge (`aria-label="Featured project"`) appears in the top-right corner of the card image using `bg-accent/90 text-text-on-accent`. Selected projects are also sorted first in the homepage grid.
- **Card images:** All cards share an `aspect-[16/9]` ratio via `ContentImage`. JPEG/PNG assets use a WebP `<source>` when a generated variant exists, with the original raster asset as fallback; SVG and other formats render as a plain `<img>`.

## 5. Responsive Behavior

- Grid: `sm:grid-cols-2 lg:grid-cols-3` — one column on mobile, three on desktop.
- Breakpoints: `sm` (640px), `lg` (1024px), `xl` (1280px).
- All cards and sections use responsive padding to avoid horizontal scroll at 320 CSS px.
- `flex min-w-0` on flex children prevents flex items from forcing minimum width and causing overflow of long URLs/titles.

## 6. Theme / Semantic Color System

### Semantic Token Layer

Semantic colors are defined as CSS custom properties in `libs/design-system/src/styles/tokens.css` (light theme) and `libs/design-system/src/styles/themes.css` (dark theme overrides via `[data-theme="dark"]`). The dark variant is driven by the `[data-theme]` attribute set by an inline theme-init script in `<head>`, rather than `prefers-color-scheme` — this lets the theme toggle switch instantly without a flash of incorrect theme. All components reference these tokens through Tailwind utility names (e.g. `bg-surface-card`, `text-text-primary`). Keep Tailwind's built-in spacing/type scales; do not create competing scales.

| Token                      | Light     | Dark      | Purpose                                                     |
| -------------------------- | --------- | --------- | ----------------------------------------------------------- |
| `--color-surface-page`     | `#F5F8F6` | `#0F2A36` | Mist-green page background (welcoming)                      |
| `--color-surface-card`     | `#ffffff` | `#164E63` | Card/surface background (white / deep water)                |
| `--color-surface-elevated` | `#ffffff` | `#1E5A73` | Elevated surfaces (white / deep current)                    |
| `--color-surface-tinted`   | `#EAF4F3` | `#123C4B` | Water-teal tint (section panels, dividers)                  |
| `--color-text-primary`     | `#171717` | `#e2e8f0` | Primary body text (slate-900 / slate-200)                   |
| `--color-text-secondary`   | `#4b5563` | `#cbd5e1` | Secondary/metadata text (slate-700 / slate-300)             |
| `--color-text-muted`       | `#5e6673` | `#bbcdd9` | Caption / non-critical text (gray-500 dark / sky-100 light) |
| `--color-text-on-accent`   | `#ffffff` | `#0f172a` | Inverse text on accent background                           |
| `--color-text-error`       | `#c51e24` | `#fdb8b0` | Error/status text (red-700 / light red)                     |
| `--color-border`           | `#D5E2E2` | `#94a3b8` | Subtle separators (water-gray / slate-400)                  |
| `--color-accent`           | `#166973` | `#30dbfb` | Teal accent for UI elements (buttons, borders)              |
| `--color-accent-hover`     | `#116776` | `#7ef5d6` | Button hover (darker teal / brighter cyan)                  |
| `--color-focus`            | `#075985` | `#7DD3FC` | Focus rings (deep current / sky-300)                        |
| `--color-link`             | `#075985` | `#7DD3FC` | Link color (deep current / sky-300) — NEW                   |
| `--color-link-hover`       | `#0369a1` | `#bae6fd` | Link hover (dark river / sky-200) — NEW                     |
| `--color-code-bg`          | `#e2e8f0` | `#1e293b` | Inline code background (slate-200 / slate-800)              |
| `--color-pre-bg`           | `#171717` | `#0a2740` | Preformatted block background (near-black blue)             |
| `--color-pre-text`         | `#f9fafb` | `#e2e8f0` | Preformatted block text (off-white / slate-200)             |

Components never use hardcoded Tailwind palette utilities — all reference semantic tokens (e.g. `bg-surface-card`, `text-text-primary`, `text-link`, `text-accent`, `focus:outline-focus`). Tailwind utility names are registered in `tw-input.css` via the `@theme` block, each backed by CSS variables defined in `tokens.css` (light) and `themes.css` (dark). Prose links consume `--color-link` through `typography.css`; all other text uses `text-text-*` tokens.

### Applied Theme Rules

- **Light mode:** mist-green (`#F5F8F6`) page canvas (welcoming, not pure white), white cards, `text-text-primary` body on cards, `text-text-secondary` for metadata, `text-text-muted` for secondary text.
- **Dark mode:** abyssal teal (`#0F2A36`) page background, deep water (`#164E63`) cards (slightly lighter for hierarchy), deep current (`#1E5A73`) for elevated surfaces. Text uses slate-200 (primary), slate-300 (secondary), `#bbcdd9` (muted). Cyan accent (`#30dbfb`) for UI elements.
- **Accent vs. link colors:** distinct by design — `--color-accent` (teal `#166973`/`#30dbfb`) for buttons, borders, blockquote marks, and decorative elements; `--color-link` (deep blue `#075985`/`#7DD3FC`) for all link text and focus rings. This prevents teal links from competing with the deep river blue used for interactive affordances.
- Prose link colors consume `--color-link` via `typography.css` (`global.css` delegates to the design-system layer), not by per-component Tailwind `prose-a:text-*` utilities — this avoids drift.
- **Inverse text:** buttons on teal accent backgrounds use `--color-text-on-accent`, which switches from white (light) to dark `#0f172a` (dark mode where the accent is bright cyan).
- **Error text:** uses `--color-text-error` (red-700 light / light-red dark) — darkened to `#c51e24` for WCAG AA on tinted surfaces; dark value `#fdb8b0` achieves 4.58:1 on `#1E5A73`.

#### Verified Contrast Ratios (WCAG 2.2 AA — 4.5:1 minimum)

| Token                           | Background          | Ratio   | Status |
| ------------------------------- | ------------------- | ------- | ------ |
| `text-text-primary`             | `surface-page`      | ~7.0:1  | ✅     |
| `text-text-primary`             | `surface-card`      | ~21:1   | ✅     |
| `text-text-secondary`           | `surface-card`      | ~4.6:1  | ✅     |
| `text-text-muted`               | `surface-card`      | ~4.5:1  | ✅     |
| `text-accent`                   | `surface-card`      | ~7.0:1  | ✅     |
| `text-text-primary`             | `surface-card` dark | ~10.2:1 | ✅     |
| `text-text-secondary`           | `surface-card` dark | ~4.6:1  | ✅     |
| `text-accent` (sky-300)         | `surface-card` dark | ~5.2:1  | ✅     |
| `text-text-on-accent` (white)   | `accent` light      | ~12:1   | ✅     |
| `text-text-on-accent` (#0f172a) | `accent` dark       | ~5.5:1  | ✅     |

**Previously failing (now fixed):** `zinc-500` on white (4.2:1 ❌), `zinc-500` on dark surfaces (3.3:1 ❌), `zinc-600` on white for small text (4.84:1, borderline). Additionally, the following contrast gaps were identified and corrected during Phase 2:

1. Light `text-muted` `#6b7280` on `surface-tinted` `#eaf4f3` only reached 4.31:1 — darkened to `#5e6673` (5.17:1).
2. Light `accent` `#187e89` on `surface-page` `#f5f8f6` only reached 4.48:1 — darkened to `#166973` (5.95:1).
3. Light `text-error` `#dc2626` on `surface-tinted` `#eaf4f3` only reached 4.31:1 — darkened to `#c51e24` (5.23:1).
4. Dark `text-muted` `#a6bcd1` on `surface-elevated` `#1e5a73` only reached 3.88:1 — lightened to `#bbccd9` (4.61:1).
5. Dark `accent` `#22d3ee` on `surface-elevated` `#1e5a73` only reached 4.20:1 — lightened to `#30dbfb` (4.58:1).
6. Dark `text-error` `#fca5a5` on `surface-elevated` `#1e5a73` only reached 4.00:1 — lightened to `#fdb8b0` (4.58:1).

All color combinations (text-on-surface, including elevated surfaces) now pass WCAG 2.2 AA (≥4.5:1) in both themes. The 404 page uses `text-link` rather than `text-accent` for text on the near-white page background, providing 7.07:1 contrast. Colors never hardcode palette values — all route through semantic tokens that switch values per theme.

## 7. Navigation and Breadcrumbs

- NavBar uses segment-aware prefix matching (`isPathActive`) — `/projects/example/` matches "Projects" but not unrelated paths.
- Active state: bottom border `border-accent`" (semantic token) for both light and dark modes + `aria-current="page"` (color-only is not sufficient). A transparent `border-b-2` is always present on nav links to reserve space and prevent layout shift when the active border appears.
- Breadcrumb on detail pages: `Collection / Entry-title` — the last item is the current page (no "Home" link in the breadcrumb per the "do not add content entries to global navigation" rule).
- Breadcrumb and `ContentDetail` share a page-level wrapper (`mx-auto flex max-w-7xl grow flex-col gap-4`) that floats on the page surface; the article itself (`mx-auto flex w-full max-w-3xl flex-col gap-8 p-8`) has no card background or `rounded-2xl` — it sits directly on `surface-page`. `text-text-primary` is used for the current page (semantic token, both themes), while visited breadcrumb links use `text-link` — preventing dark-text-on-dark-surface contrast failures.
- Focus ring: `focus-visible:outline-2 focus-visible:outline-focus` on all interactive elements.

## 8. Keyboard / Focus Behavior

- All links and buttons have visible `focus-visible` styles.
- Pagination buttons are 44×44 px minimum for touch targets.
- Skip-link target is the `<main>` landmark.

## 9. Motion and Reduced Motion

- CSS animations only under `@media (prefers-reduced-motion: no-preference)` — global disable in `global.css`.
- `motion-reduce:animate-none` on individual animated elements.
- `motion/react` is used on the About page (`AboutHero`, `EducationTimeline`, `ResearchInterests`, `SkillsGrid`) and in `ContentCardSection` and `PublicationRowSection` with `useReducedMotion()` to avoid motion when the user requests reduced motion. The homepage's `AboutSection` uses a CSS `animate-fadeInUp` entrance on initial page load. `ContentCardSection` and `PublicationRowSection` use `motion/react` with `whileInView` viewport triggers for below-the-fold reveal — content is available immediately via server-rendered HTML and animation is an enhancement.
- **Progressive enhancement pattern**: Motion components use `initial={false}` (not `initial: "hidden"`) so SSR HTML renders content fully visible — no inline `opacity: 0` styles. Items receive a `.motion-item-initial` CSS class that is guarded by `html[data-js]` (set by the inline `jsDetectorScript` in `<head>`). Without JavaScript, `.motion-item-initial` resolves to `opacity: 1` (visible). With JavaScript, it resolves to `opacity: 0 + translateY(var(--motion-offset))`, allowing Motion's `whileInView` to animate the reveal. The `@media (prefers-reduced-motion: reduce)` override forces `opacity: 1` regardless. This pattern is applied uniformly across `ContentCardSection`, `PublicationRowSection`, `AboutHero`, `EducationTimeline`, `ResearchInterests`, and `SkillsGrid`.
- Card entrance: viewport-triggered stagger via `motion/react` (`whileInView` with `viewport: { once: true }`). Card titles underline on hover without a positional transform; card images use a subtle `scale-105` hover effect that is disabled for reduced-motion users. About-page skill chips are plain `<span>` elements with no hover animation, keeping skills visually calm and non-interactive.
- Keep motion decorative and restrained, ensure reduced-motion preferences are honored, and do not animate controls merely to signal keyboard focus. There are no auto-playing carousels.

## 10. Static Delivery / Performance

- `output: "export"` — all pages prerendered. No client JS for navigation beyond `next/link` prefetch.
- Server components everywhere except where `motion/react` or user interaction genuinely requires `"use client"` (AboutHero, EducationTimeline, ResearchInterests, SkillsGrid, ContentCardSection, PublicationRowSection, NavBar/MobileNavLinks).
- `ContentImage` currently uses native `<img>` and `<picture>` markup; it serves generated WebP sources for JPEG/PNG where available and keeps the original as a fallback. SVGs use a plain `<img>`. Although `next.config.mjs` sets `images.unoptimized: true`, the component does not currently use `next/image`.
- Client bundle is minimal: only the NavBar's mobile menu toggle and motion components.

## 11. Constraints Against Unnecessary Abstraction

> **Updated per [ADR-0008](./decisions/0008-design-system.md):** A single `libs/design-system/` library now exists as the owner of semantic tokens, typography foundation, and genuinely feature-agnostic UI primitives (initially `ContentImage`, `Pagination`, `Breadcrumb`, `ChevronIcon`, and `Tag`). The constraint against unnecessary abstraction remains: do **not** create speculative Button/Badge/Card/Heading/Text/Prose components unless evidence of duplication justifies them. Feature-specific presentation (AboutHero, ContentCardSection, ContentDetail) lives in `apps/main/src/features/`. Only components used across multiple feature routes and free of domain-specific types belong in the design system.

- No Redux — Zustand only for truly local UI state (none currently used).
- No GraphQL — REST + static export.
- Components are function components with destructured props — no class components, no inheritance.

---

## 12. Known Limitations and Outstanding Issues

<!--
  This section records validated issues and gaps discovered during the
  Phase 1-5 implementation and audit cycles. Items here require follow-up
  either via browser testing (unavailable in terminal-only environments)
  or additional implementation work.
-->

### Motion

1. **MOTION_OFFSET vs. target range** — _Fixed in Phase 3_: Reduced from `20px` to `12px`,
   bringing it within the handoff document's recommended `8–14px` range. Updated both
   `MOTION_OFFSET` in `motion-config.ts` and the `--motion-offset` CSS token in `tokens.css`.
   The Motion system consistency test range was updated from `16–20px` to `8–14px`.

2. **Section duration above target**: _Fixed in Phase 4_: `MOTION_DURATION_SECTION = 0.45s` (450ms) is now within
   the handoff's recommended `350–450ms` range. `MOTION_DURATION_CHILD = 0.45s` (450ms) remains at
   the upper boundary, which is acceptable for child item reveals. The CSS token `--motion-duration-enter`
   was also updated from `0.5s` to `0.45s` to keep CSS animations in sync.

3. **Portrait scale animation lost** — _Fixed in Phase 3_: Added a `.motion-portrait-initial`
   CSS class to `animations.css` that applies `transform: scale(0.9) translateY(var(--motion-offset))`
   (guarded by `html[data-js]`) when JS is enabled. The class is applied alongside
   `.motion-item-initial` on the AboutHero portrait wrapper. The `prefers-reduced-motion`
   override forces `opacity: 1, transform: none`. Tests verify the class is present.

4. **AboutHero mount-triggered animation flash** — _Fixed in Phase 4_: Switched
   `animate: "visible"` (mount-triggered) to `whileInView: "visible"` with the shared
   `MOTION_VIEWPORT` constant (including `once: true`). This matches all 5 other Motion components
   (EducationTimeline, SkillsGrid, ResearchInterests, ContentCardSection, PublicationRowSection),
   eliminating the inconsistency. For above-the-fold content, the Intersection Observer fires
   immediately after hydration, starting the reveal animation without the CSS opacity-0 gap.
   Tests verify content is visible in rendered output (no inline opacity-0).

### Progressive Enhancement

5. **`jsDetectorScript` not in original handoff plan**: The progressive enhancement pattern
   (`jsDetectorScript` → `data-js` on `<html>` → `.motion-item-initial` CSS → `initial={false}`)
   was implemented but not explicitly called out in the handoff's phase breakdown. Documented
   here (§12) and in `libs/navigation/src/lib/hooks/js-detector.ts`.

6. **No no-JS integration test** — _Added in Phase 3_: `AboutSection.test.tsx` now includes a
   "progressive enhancement / no-JS fallback" describe block verifying no Motion client
   markers, no inline opacity-0, and immediate content visibility. A reusable `jsDetectorScript`
   helper and HTML-level `<script>` injection test (with `data-js` toggling in the DOM) remain
   as future work for the full no-JS integration layer.

7. **ContentCardSection child elements lacked explicit `initial={false}`** — _Fixed in Phase 3_:
   Added `initial: false` to the shared `motionProps` object used by `MotionHeading` and
   `MotionArticle` in both `ContentCardSection` and `PublicationRowSection`. Tests now
   assert no inline opacity-0 on heading and article elements.

### Typography & Images

8. **AboutSection image `sizes` mismatch** — _Fixed in Phase 3_:

   The `sizes` string didn't match class-based rendered dimensions (`h-32`/`sm:h-40`/`md:h-48`
   = 128px → 160px → 192px). Updated to
   `"(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"`.
   Also fixed AboutHero `sizes` from `"(max-width: 640px) 200px, 240px"` to
   `"(max-width: 640px) 192px, (max-width: 768px) 256px, 224px"`.
   Tests added to both `AboutSection.test.tsx` and `AboutHero.test.tsx`.

9. **ContentDetail not listed in handoff files**: The handoff document's "Relevant files"
   section omits `apps/main/src/features/content/ContentDetail/ContentDetail.tsx`, which
   handles detail-page rendering with structured data (JSON-LD), `prose` styling, and
   Markdown-to-HTML rendering via `dangerouslySetInnerHTML`.

### Security

10. **Markdown sanitization not yet implemented**: The handoff identifies this as Phase 6
    (security priority). The repository uses `marked` (via `libs/content`) to parse Markdown,
    and renders HTML via `dangerouslySetInnerHTML` in `ContentDetail`, `AboutSection`, and
    `AboutHero`. **No HTML sanitizer is currently applied.** A sanitizer (e.g., `dompurify`
    or `@mozilla/readability`'s sanitizer) needs to be integrated as a shared boundary
    after Markdown parsing.

11. **No security regression tests**: No tests exist for malicious Markdown input
    (event-handler attributes on images, `<script>` elements, `javascript:` links, etc.).

### Testing & Browser Validation

12. **Outdated doc reference (fixed)**: `frontend-design-principles.md` previously stated
    "The About-page skill chips also use a small hover animation" — corrected to reflect
    that skill chips are plain `<span>` elements with no hover animation.

13. **No no-JS replay-prevention test** — _Partially fixed in Phase 3_: Added
    `motion-config.test.ts` that verifies `MOTION_VIEWPORT.once === true` — the single
    source of truth now used by all components. A full DOM-level test that simulates
    scroll-out-and-back is out of scope for jsdom (no real scroll triggering) and
    remains a browser-QA item.

14. **No browser-based QA performed**: All validation has been done via terminal tests,
    lint, typecheck, and build. Browser scenarios from the handoff §11 (hero balance at all
    breakpoints, image proportions, featured-project composition, scroll behavior, page
    navigation, console errors, network failures, asset URLs under `/academic-portfolio`)
    have NOT been verified and require a browser-based review.
