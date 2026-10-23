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

- **Base font:** `text-slate-900` body at `prose prose-lg` on detail pages, `prose prose-sm` on homepage AboutSection (condensed preview).
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

The intended contract is a small set of semantic colors in `apps/main/src/app/global.css`, with values overridden in `@media (prefers-color-scheme: dark)`. **This is not yet a single source of truth in the implementation:** several tokens are unused and components still set many colors directly with Tailwind palette utilities. The roadmap tracks completing this alignment. Keep Tailwind's built-in spacing/type scales; do not create competing scales.

| Token                      | Light     | Dark      | Purpose                                        |
| -------------------------- | --------- | --------- | ---------------------------------------------- |
| `--color-surface-page`     | `#f8fafc` | `#1e293b` | Page background (slate-50 / slate-800)         |
| `--color-surface-card`     | `#ffffff` | `#273449` | Card/surface background (white / slate-850)    |
| `--color-surface-elevated` | `#ffffff` | `#334155` | Elevated surfaces (white / slate-700)          |
| `--color-text-primary`     | `#171717` | `#e2e8f0` | Primary body text (slate-800 / slate-200)      |
| `--color-text-muted`       | `#6b7280` | `#94a3b8` | Secondary/metadata text (gray-600 / slate-400) |
| `--color-border`           | `#e5e7eb` | `#334155` | Default borders (gray-200 / slate-700)         |
| `--color-accent`           | `#0284c7` | `#38bdf8` | Links (sky-600 / sky-400)                      |
| `--color-accent-hover`     | `#0369a1` | `#7dd3fc` | Link hover (sky-700 / sky-300)                 |
| `--color-focus`            | `#0284c7` | `#38bdf8` | Focus rings (sky-600 / sky-400)                |
| `--color-code-bg`          | `#f3f4f6` | `#1e293b` | Inline code background                         |
| `--color-pre-bg`           | `#171717` | `#0f172a` | Preformatted block background                  |
| `--color-pre-text`         | `#f9fafb` | `#e2e8f0` | Preformatted block text                        |

Components use `dark:bg-slate-850` (custom token for card surfaces) and `dark:bg-slate-800` (page background) directly via Tailwind utilities. The custom `slate-850` color (`#273449`) is defined via `@theme` in `tw-input.css`. Prose links consume the accent variables through `global.css`.

### Applied Theme Rules

- **Light mode:** soft `slate-50` page canvas, white cards, `text-slate-900` body on cards, `text-gray-800` on prose, `text-zinc-600` metadata.
- **Dark mode:** slate-800 page background, `slate-850` cards (slightly lighter for hierarchy), off-white text (`slate-200` primary, `slate-300` prose, `zinc-400` metadata), sky-400 accents.
- **Accent color:** `sky-600` (`--color-accent`) for links and focus rings; `sky-400` in dark mode via token overrides.
- Prose link colors are controlled by the global CSS token, not by per-component Tailwind `prose-a:text-*` utilities — this avoids drift.
- **Accessibility target:** verify every foreground/background pair used by the UI against WCAG 2.2 AA before claiming full contrast compliance. The token table is a target contract, not proof that every current component combination has been measured.

## 7. Navigation and Breadcrumbs

- NavBar uses segment-aware prefix matching (`isPathActive`) — `/projects/example/` matches "Projects" but not unrelated paths.
- Active state: bottom border `border-sky-600` (light) / `border-sky-400` (dark) + `aria-current="page"` (color-only is not sufficient). A transparent `border-b-2` is always present on nav links to reserve space and prevent layout shift when the active border appears.
- Breadcrumb on detail pages: `Collection / Entry-title` — the last item is the current page (no "Home" link in the breadcrumb per the "do not add content entries to global navigation" rule).
- Breadcrumb sits inside the same card surface as `ContentDetail` (`mx-4 rounded-2xl dark:bg-slate-850 gap-4`), with `text-slate-900 dark:text-slate-200` for the current page — preventing dark-text-on-dark-surface contrast failures.
- Focus ring: `focus-visible:outline-2 focus-visible:outline-sky-600` on all interactive elements.

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
