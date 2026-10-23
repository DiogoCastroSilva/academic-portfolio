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

| Component            | Role                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| `ContentCardSection` | Server-side list/grid of content cards with optional `limit` and `viewAllHref`          |
| `Pagination`         | Server-side path-based pager (`/blog/`, `/blog/page/2/`) — renders nothing when ≤1 page |
| `ContentDetail`      | Server-side detail page with `prose` Markdown rendering                                 |

## 3. Typography / Spacing / Content Widths

- **Base font:** `text-text-primary` (`--color-text-primary`) body at `prose prose-lg` on detail pages, `prose prose-sm` on homepage AboutSection (condensed preview).
- **Page title (H1):** `.profile-name` — `1.875rem` (30px) base, `2.25rem` (36px) at `md`, `2.5rem` (40px) at `lg`
- **Section headings (H2):** `text-2xl font-bold md:text-3xl`
- **Card titles (H3):** `text-xl font-semibold` with `line-clamp-2`
- **Maximum content width:** `max-w-3xl` on detail pages; `max-w-6xl` on layout.
- **Spacing scale:** 4/8/12/16/24 — section padding uses `p-6 sm:p-10 lg:p-12` for responsive breathing room.
- **Line length:** prose content limited to readable width via `max-w-none` inside the card container.

## 4. Card and Tag Rules

- **Card layout:** 16/9 image, metadata row (date + tags), title (line-clamp-2), excerpt (line-clamp-3).
- **Tag limit:** At most 2 tags on collection cards. When more exist, show an accessible `+N more` indicator with `aria-label`. Full tag list is always visible on the detail page.
- **Card links:** The entire card is one `next/link` with `aria-label="Read more: {title}"`. No interactive controls (buttons, popovers) inside the clickable card.
- **Card images:** All cards share an `aspect-[16/9]` ratio via `ContentImage`. JPEG/PNG assets use a WebP `<source>` when a generated variant exists, with the original raster asset as fallback; SVG and other formats render as a plain `<img>`.

## 5. Responsive Behavior

- Grid: `sm:grid-cols-2 lg:grid-cols-3` — one column on mobile, three on desktop.
- Breakpoints: `sm` (640px), `lg` (1024px), `xl` (1280px).
- All cards and sections use responsive padding to avoid horizontal scroll at 320 CSS px.
- `flex min-w-0` on flex children prevents flex items from forcing minimum width and causing overflow of long URLs/titles.

## 6. Theme / Semantic Color System

### Semantic Token Layer

Semantic colors are defined as CSS custom properties in `libs/design-system/src/styles/tokens.css` (light theme) and `libs/design-system/src/styles/themes.css` (dark theme overrides via `[data-theme="dark"]`). The dark variant is driven by the `[data-theme]` attribute set by an inline theme-init script in `<head>`, rather than `prefers-color-scheme` — this lets the theme toggle switch instantly without a flash of incorrect theme. All components reference these tokens through Tailwind utility names (e.g. `bg-surface-card`, `text-text-primary`). Keep Tailwind's built-in spacing/type scales; do not create competing scales.

| Token                      | Light     | Dark      | Purpose                                          |
| -------------------------- | --------- | --------- | ------------------------------------------------ |
| `--color-surface-page`     | `#F5F8F6` | `#0F2A36` | Mist-green page background (welcoming)           |
| `--color-surface-card`     | `#ffffff` | `#164E63` | Card/surface background (white / deep water)     |
| `--color-surface-elevated` | `#ffffff` | `#1E5A73` | Elevated surfaces (white / deep current)         |
| `--color-surface-tinted`   | `#EAF4F3` | `#123C4B` | Water-teal tint (section panels, dividers)       |
| `--color-text-primary`     | `#171717` | `#e2e8f0` | Primary body text (slate-900 / slate-200)        |
| `--color-text-secondary`   | `#4b5563` | `#cbd5e1` | Secondary/metadata text (slate-700 / slate-300)  |
| `--color-text-muted`       | `#6b7280` | `#A6BCD1` | Caption / non-critical text (gray-600 / sky-100) |
| `--color-text-on-accent`   | `#ffffff` | `#0f172a` | Inverse text on accent background                |
| `--color-text-error`       | `#dc2626` | `#fca5a5` | Error/status text (red-600 / red-300)            |
| `--color-border`           | `#D5E2E2` | `#94a3b8` | Subtle separators (water-gray / slate-400)       |
| `--color-border-strong`    | `#B8C9C9` | `#334155` | Strong borders (water-gray / slate-700)          |
| `--color-accent`           | `#187E89` | `#22D3EE` | Teal accent for UI elements (buttons, borders)   |
| `--color-accent-hover`     | `#116776` | `#7ef5d6` | Button hover (darker teal / brighter cyan)       |
| `--color-focus`            | `#075985` | `#7DD3FC` | Focus rings (deep current / sky-300)             |
| `--color-link`             | `#075985` | `#7DD3FC` | Link color (deep current / sky-300) — NEW        |
| `--color-link-hover`       | `#0369a1` | `#bae6fd` | Link hover (dark river / sky-200) — NEW          |
| `--color-code-bg`          | `#f3f4f6` | `#0e3a5a` | Inline code background (gray-100 / glacial blue) |
| `--color-pre-bg`           | `#171717` | `#0a2740` | Preformatted block background (near-black blue)  |
| `--color-pre-text`         | `#f9fafb` | `#e2e8f0` | Preformatted block text (off-white / slate-200)  |

Components never use hardcoded Tailwind palette utilities — all reference semantic tokens (e.g. `bg-surface-card`, `text-text-primary`, `text-link`, `text-accent`, `focus:outline-focus`). Tailwind utility names are registered in `tw-input.css` via the `@theme` block, each backed by CSS variables defined in `tokens.css` (light) and `themes.css` (dark). Prose links consume `--color-link` through `typography.css`; all other text uses `text-text-*` tokens.

### Applied Theme Rules

- **Light mode:** mist-green (`#F5F8F6`) page canvas (welcoming, not pure white), white cards, `text-text-primary` body on cards, `text-text-secondary` for metadata, `text-text-muted` for secondary text.
- **Dark mode:** abyssal teal (`#0F2A36`) page background, deep water (`#164E63`) cards (slightly lighter for hierarchy), deep current (`#1E5A73`) for elevated surfaces. Text uses slate-200 (primary), slate-300 (secondary), sky-100 (`#A6BCD1` muted). Teal accent (`#22D3EE`) for UI elements.
- **Accent vs. link colors:** distinct by design — `--color-accent` (teal `#187E89`/`#22D3EE`) for buttons, borders, blockquote marks, and decorative elements; `--color-link` (deep blue `#075985`/`#7DD3FC`) for all link text and focus rings. This prevents teal links from competing with the deep river blue used for interactive affordances.
- Prose link colors consume `--color-link` via `typography.css` (`global.css` delegates to the design-system layer), not by per-component Tailwind `prose-a:text-*` utilities — this avoids drift.
- **Inverse text:** buttons on teal accent backgrounds use `--color-text-on-accent`, which switches from white (light) to dark `#0f172a` (dark mode where the accent is bright cyan).
- **Error text:** uses `--color-text-error` (red-600 light / red-300 dark) — adjusted from the proposed red-400 in dark mode because `#f87171` only achieves 3.29:1 on `#164E63`; `#fca5a5` achieves 4.8:1.

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

**Previously failing (now fixed):** `zinc-500` on white (4.2:1 ❌), `zinc-500` on dark surfaces (3.3:1 ❌), `zinc-600` on white for small text (4.84:1, borderline). Additionally, the proposed palette had three contrast gaps that were caught and corrected before finalizing: (1) dark muted text `#94a3b8` on `#164E63` only reached 3.55:1 — adjusted to `#A6BCD1` (sky-100); (2) dark error text `#f87171` (red-400) only reached 3.29:1 — adjusted to `#fca5a5` (red-300); (3) teal accent `#187E89` on a near-white page background only reached 4.48:1 — the 404 text was switched to `text-link` (deep blue, 7.07:1). All colors now route through semantic tokens that switch values per theme.

## 7. Navigation and Breadcrumbs

- NavBar uses segment-aware prefix matching (`isPathActive`) — `/projects/example/` matches "Projects" but not unrelated paths.
- Active state: bottom border `border-accent`" (semantic token) for both light and dark modes + `aria-current="page"` (color-only is not sufficient). A transparent `border-b-2` is always present on nav links to reserve space and prevent layout shift when the active border appears.
- Breadcrumb on detail pages: `Collection / Entry-title` — the last item is the current page (no "Home" link in the breadcrumb per the "do not add content entries to global navigation" rule).
- Breadcrumb sits inside the same card surface as `ContentDetail` (`mx-4 rounded-2xl bg-surface-card gap-4`), with `text-text-primary` for the current page (semantic token, both themes), while visited breadcrumb links use `text-link` — preventing dark-text-on-dark-surface contrast failures.
- Focus ring: `focus-visible:outline-2 focus-visible:outline-focus` on all interactive elements.

## 8. Keyboard / Focus Behavior

- All links and buttons have visible `focus-visible` styles.
- Pagination buttons are 44×44 px minimum for touch targets.
- Skip-link target is the `<main>` landmark.

## 9. Motion and Reduced Motion

- CSS animations only under `@media (prefers-reduced-motion: no-preference)` — global disable in `global.css`.
- `motion-reduce:animate-none` on individual animated elements.
- `motion/react` is used on the About page (`AboutHero`, `EducationTimeline`, `ResearchInterests`, `SkillsGrid`) with `useReducedMotion()` to avoid motion when the user requests reduced motion. The homepage's `AboutSection` and `ContentCardSection` use CSS animations instead.
- Card entrance: staggered `fadeInUp` with `animationDelay` per index. Card titles underline on hover without a positional transform; card images use a subtle `scale-105` hover effect that is disabled for reduced-motion users. The About-page skill chips also use a small hover animation.
- Keep motion decorative and restrained, ensure reduced-motion preferences are honored, and do not animate controls merely to signal keyboard focus. There are no auto-playing carousels.

## 10. Static Delivery / Performance

- `output: "export"` — all pages prerendered. No client JS for navigation beyond `next/link` prefetch.
- Server components everywhere except where `motion/react` or user interaction genuinely requires `"use client"` (AboutHero, EducationTimeline, ResearchInterests, SkillsGrid, NavBar/MobileNavLinks).
- `ContentImage` currently uses native `<img>` and `<picture>` markup; it serves generated WebP sources for JPEG/PNG where available and keeps the original as a fallback. SVGs use a plain `<img>`. Although `next.config.mjs` sets `images.unoptimized: true`, the component does not currently use `next/image`.
- Client bundle is minimal: only the NavBar's mobile menu toggle and motion components.

## 11. Constraints Against Unnecessary Abstraction

> **Updated per [ADR-0008](./decisions/0008-design-system.md):** A single `libs/design-system/` library now exists as the owner of semantic tokens, typography foundation, and genuinely feature-agnostic UI primitives (initially `ContentImage`, `Pagination`, `Breadcrumb`, `ChevronIcon`). The constraint against unnecessary abstraction remains: do **not** create speculative Button/Badge/Card/Heading/Text/Prose components unless evidence of duplication justifies them. Feature-specific presentation (AboutHero, ContentCardSection, ContentDetail) lives in `apps/main/src/features/`. Only components used across multiple feature routes and free of domain-specific types belong in the design system.

- No Redux — Zustand only for truly local UI state (none currently used).
- No GraphQL — REST + static export.
- Components are function components with destructured props — no class components, no inheritance.
