# Design System

> **Status:** In progress
> **Library:** `libs/design-system/` (`@academic-portfolio/design-system`)
> **ADR:** [ADR-0008](../architecture/decisions/0008-design-system.md)

## Purpose

The design-system library is the single source of truth for shared visual foundations and genuinely feature-agnostic UI primitives. It is **not** a dumping ground for every component — only components that are used across multiple feature routes and free of domain-specific types belong here.

## What lives here

### Design tokens

| Token                                                                                                                      | Purpose                                                          |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `--color-surface-page` / `--color-surface-card` / `--color-surface-elevated` / `--color-surface-tinted`                    | Page, card, elevated, and tinted surface backgrounds             |
| `--color-text-primary` / `--color-text-secondary` / `--color-text-muted` / `--color-text-on-accent` / `--color-text-error` | Text color hierarchy (primary, secondary, muted, inverse, error) |
| `--color-border` / `--color-border-strong`                                                                                 | Border and separator colors                                      |
| `--color-accent` / `--color-accent-hover`                                                                                  | Teal accent for buttons, borders, decorative elements            |
| `--color-link` / `--color-link-hover`                                                                                      | Text link color and hover state                                  |
| `--color-focus`                                                                                                            | Focus ring color                                                 |
| `--color-code-bg` / `--color-pre-bg` / `--color-pre-text`                                                                  | Code block colors                                                |
| `--color-status-info-bg` / `--color-status-info-text` / `--color-status-warning-bg` / `--color-status-warning-text`        | Status/info/warning callout colors                               |
| `--radius-card` / `--radius-input`                                                                                         | Border radius values                                             |
| `--shadow-card`                                                                                                            | Card shadow                                                      |
| `--motion-duration-enter` / `--motion-duration-stagger` / `--motion-ease-enter`                                            | Animation timing                                                 |

All tokens are defined in `libs/design-system/src/styles/tokens.css` as `:root` CSS custom properties, with dark-mode overrides in `themes.css`.

### Typography

Typography rules are in `libs/design-system/src/styles/typography.css`:

- `.profile-name` — responsive heading scale for the profile name.
- Prose paragraph line-height and base styles.
- Heading scales for h1–h6 (via `@layer base`).

### UI components

| Component      | Used by                                                                      | Notes                                                         |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `ContentImage` | `AboutSection`, `AboutHero`, `ContentCardSection`, `ContentDetail`           | WebP-aware `<picture>` with SVG and `StaticImageData` support |
| `Pagination`   | `/projects/page/[page]/`, `/publications/page/[page]/`, `/blog/page/[page]/` | Client component, path-based, reduced-motion compliant        |
| `Breadcrumb`   | All detail pages (`[slug]/page.tsx`)                                         | Uses `ChevronIcon` separator                                  |
| `ChevronIcon`  | `Breadcrumb`                                                                 | Generic icon                                                  |

### Animation utilities

| Class               | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `.animate-fadeInUp` | Fade + slide-up entrance animation, guarded by `prefers-reduced-motion` |

## What does NOT live here

- **Feature-specific components** — `AboutHero`, `EducationTimeline`, `ResearchInterests`, `SkillsGrid` (in `features/about/`).
- **Content-presentation components** — `AboutSection`, `ContentCardSection`, `ContentDetail` (in `features/content/`).
- **App-global components** — `Footer`, `CloudflareAnalytics` (in `components/`).
- **Utility components** — `JsonLd` (in `lib/`).
- **Domain types** — content types stay in `@academic-portfolio/content`.

## Component guidelines

### Adding a new component

1. The component must be used by **at least two different feature routes** (or one feature used across the app).
2. It must **not** import domain-specific types from content libraries.
3. It must have **colocated tests** (`*.test.tsx` in the component's directory).
4. It must have **a11y tests** using `expectNoA11yViolations`.
5. It must respect `prefers-reduced-motion`.
6. It must use **semantic HTML** and proper `aria-*` attributes.
7. It must **not** expose an arbitrary `className` escape hatch that allows bypassing design tokens. Use a constrained `className?: string` prop only for layout wrappers; never allow overriding colors or typography scales.

### CSS usage

- Use Tailwind CSS v4 utility classes for layout.
- Use semantic CSS custom properties for colors, borders, and radii.
- Import CSS by path (`../styles/tokens.css`), not via the JS entry point.
- Do not create new CSS files outside `styles/` without ADR review.

### Testing

```bash
npx nx run @academic-portfolio/design-system:test
```

Test expectations:

- Correct semantic element and accessible name.
- Supported variants and sizes.
- Disabled and interactive behavior.
- Keyboard and focus behavior for interactive components.
- Typography semantics.
- Reduced-motion compliance.
- Colocated `*.test.tsx` alongside each component.

## Storybook

Deferred. See [T-010b](../tickets/T-010b-storybook-evaluation.md) for the full evaluation. Components are documented via README + colocated tests — see [`component-documentation.md`](./component-documentation.md). Re-evaluate when the library reaches 8+ components.
