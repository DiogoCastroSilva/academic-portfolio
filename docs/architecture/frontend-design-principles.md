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
- **Page title (H1):** `text-3xl font-bold md:text-4xl lg:text-5xl`
- **Section headings (H2):** `text-2xl font-bold md:text-3xl`
- **Card titles (H3):** `text-xl font-semibold` with `line-clamp-2`
- **Maximum content width:** `max-w-3xl` on detail pages; `max-w-6xl` on layout.
- **Spacing scale:** 4/8/12/16/24 — section padding uses `p-6 sm:p-10 lg:p-12` for responsive breathing room.
- **Line length:** prose content limited to readable width via `max-w-none` inside the card container.

## 4. Card and Tag Rules

- **Card layout:** 16/9 image, metadata row (date + tags), title (line-clamp-2), excerpt (line-clamp-3).
- **Tag limit:** At most 2 tags on collection cards. When more exist, show an accessible `+N more` indicator with `aria-label`. Full tag list is always visible on the detail page.
- **Card links:** The entire card is one `next/link` with `aria-label="Read more: {title}"`. No interactive controls (buttons, popovers) inside the clickable card.
- **Card images:** All cards share `aspect-[16/9]` ratio via `ContentImage` with WebP `<source>` + JPEG/PNG fallback.

## 5. Responsive Behavior

- Grid: `sm:grid-cols-2 lg:grid-cols-3` — one column on mobile, three on desktop.
- Breakpoints: `sm` (640px), `lg` (1024px), `xl` (1280px).
- All cards and sections use responsive padding to avoid horizontal scroll at 320 CSS px.
- `flex min-w-0` on flex children prevents flex items from forcing minimum width and causing overflow of long URLs/titles.

## 6. Theme / Semantic Color System

### Semantic Token Layer

A lightweight set of CSS custom properties in `apps/main/src/app/global.css` provides a single source of truth for semantic colors. These are defined under `:root` and overridden in `@media (prefers-color-scheme: dark)`. Tailwind's spacing scale is used for layout primitives — no competing scale is introduced.

| Token                  | Light     | Dark      | Purpose                         |
| ---------------------- | --------- | --------- | ------------------------------- |
| `--color-surface-page` | `#ffffff` | `#1e293b` | Page background                 |
| `--color-surface-card` | `#ffffff` | `#f0f9ff` | Card/surface background         |
| `--color-text-primary` | `#171717` | `#f9fafb` | Primary body text               |
| `--color-text-muted`   | `#6b7280` | `#9ca3af` | Secondary/metadata text         |
| `--color-border`       | `#e5e7eb` | `#3f3f46` | Default borders                 |
| `--color-accent`       | `#0284c7` | `#60a5fa` | Links (sky-600 / sky-400)       |
| `--color-accent-hover` | `#0369a1` | `#93c5fd` | Link hover (sky-700 / sky-300)  |
| `--color-focus`        | `#0284c7` | `#60a5fa` | Focus rings (sky-600 / sky-400) |
| `--color-code-bg`      | `#f3f4f6` | `#1e293b` | Inline code background          |
| `--color-pre-bg`       | `#171717` | `#0f172a` | Preformatted block background   |
| `--color-pre-text`     | `#f9fafb` | `#f1f5f9` | Preformatted block text         |

Components set their own surface classes directly (e.g. `bg-white dark:bg-sky-50`) because those values are stable and intentional; the token layer is consumed primarily by prose/markdown rendered content via `global.css` rules (`.prose a { color: var(--color-accent); }`).

### Applied Theme Rules

- **Light mode:** white surfaces, `text-slate-900` body on cards, `text-gray-800` on prose, `text-zinc-600` metadata.
- **Dark mode:** light-blue surfaces (`dark:bg-sky-50`), `text-slate-900` headings (high contrast on light-blue), `text-zinc-500` metadata.
- **Accent color:** `sky-600` (`--color-accent`) for links and focus rings; `sky-400` in dark mode via token overrides.
- Prose link colors are controlled by the global CSS token, not by per-component Tailwind `prose-a:text-*` utilities — this avoids drift.
- All colors are chosen for WCAG 2.2 AA contrast on the appropriate surface.

## 7. Navigation and Breadcrumbs

- NavBar uses segment-aware prefix matching (`isPathActive`) — `/projects/example/` matches "Projects" but not unrelated paths.
- Active state: bottom border `border-sky-600` (light) / `border-sky-400` (dark) + `aria-current="page"` (color-only is not sufficient). A transparent `border-b-2` is always present on nav links to reserve space and prevent layout shift when the active border appears.
- Breadcrumb on detail pages: `Collection / Entry-title` — the last item is the current page (no "Home" link in the breadcrumb per the "do not add content entries to global navigation" rule).
- Breadcrumb sits inside the same card surface as `ContentDetail` (`mx-4 rounded-2xl dark:bg-sky-50 gap-4`), with `text-slate-900 dark:text-slate-900` for the current page — preventing dark-text-on-dark-surface contrast failures.
- Focus ring: `focus-visible:outline-2 focus-visible:outline-sky-600` on all interactive elements.

## 8. Keyboard / Focus Behavior

- All links and buttons have visible `focus-visible` styles.
- Pagination buttons are 44×44 px minimum for touch targets.
- Skip-link target is the `<main>` landmark.

## 9. Motion and Reduced Motion

- CSS animations only under `@media (prefers-reduced-motion: no-preference)` — global disable in `global.css`.
- `motion-reduce:animate-none` on individual animated elements.
- `motion/react` used on the About page (`AboutHero`) and on the homepage sections (`EducationTimeline`, `ResearchInterests`, `SkillsGrid`) where `useReducedMotion()` swaps `motion.div`/`motion.span` for plain `div`/`span`.
- Card entrance: staggered `fadeInUp` (0.5s) with `animationDelay` per index. Card title: no positional transform on hover (previously had `-translate-y-1`); only underline on hover for affordance. Card image uses a subtle `scale-105` via CSS (`group-hover:scale-105`) which is disabled by the global `prefers-reduced-motion` rule.
- No animation on hover/focus; no auto-playing carousels.

## 10. Static Delivery / Performance

- `output: "export"` — all pages prerendered. No client JS for navigation beyond `next/link` prefetch.
- Server components everywhere except where `motion/react` or user interaction genuinely requires `"use client"` (AboutHero, EducationTimeline, ResearchInterests, SkillsGrid, NavBar/MobileNavLinks).
- Images use `next/image` with `unoptimized: true` (static export constraint) via `ContentImage` component.
- Client bundle is minimal: only the NavBar's mobile menu toggle and motion components.

## 11. Constraints Against Unnecessary Abstraction

- No separate design-system package — shared UI lives in `apps/main/src/app/ui/`.
- No Redux — Zustand only for truly local UI state (none currently used).
- No GraphQL — REST + static export.
- Components are function components with destructured props — no class components, no inheritance.
