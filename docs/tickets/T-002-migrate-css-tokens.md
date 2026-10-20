# T-002: Migrate semantic CSS tokens and typography from `global.css`

- **Status:** Done
- **Phase:** 4 — Design-system foundation (follows T-001)
- **Priority:** P0
- **Dependencies:** T-001

## Context

`apps/main/src/app/global.css` currently contains:

1. `@import "../../tw-input.css"` — Tailwind entry (stays app-level)
2. ~50 lines of `:root` semantic CSS custom properties (tokens)
3. Dark-mode overrides in `@media (prefers-color-scheme: dark)`
4. Reduced-motion global reset
5. `@layer base` box-sizing and border defaults
6. `.profile-name` typography styles
7. `.prose a` / `.prose a:hover` styles
8. `.prose figure/figcaption` styles
9. `.prose .gallery` styles
10. `.prose a.external-link` styles
11. `.animate-fadeInUp` keyframes + reduced-motion fallback

These mix semantic tokens, typography foundation, prose styles, and content-specific extensions.

## Problem

Tokens and typography have no dedicated library owner. Contributors cannot tell which CSS lives in the design system vs. which is app-specific content styling. The `global.css` file is doing too much.

## Desired outcome

- Tokens and typography foundation live in `libs/design-system/src/styles/`.
- `global.css` imports the design-system CSS **once** and retains only truly app-specific overrides.
- Visual output is identical — no style changes.

## Scope

### In scope

- Move semantic token declarations to `libs/design-system/src/styles/tokens.css`
- Move dark-mode overrides to `libs/design-system/src/styles/themes.css`
- Move typography rules (`.profile-name`, prose paragraph) to `libs/design-system/src/styles/typography.css`
- Move animation keyframes to `libs/design-system/src/styles/animations.css`
- Move the `@layer base` box-sizing/border reset to `tokens.css` (it is a token concern)
- Create `libs/design-system/src/styles/index.css` that imports all sub-sheets
- Update `apps/main/src/app/global.css` to `@import` the design-system CSS instead of inlining tokens
- Keep `tw-input.css` import chain intact

### Out of scope

- Migrating components (T-003–T-005)
- Changing any visual styling
- Updating `@source` paths (T-006)

## Files affected

- `libs/design-system/src/styles/tokens.css` (new)
- `libs/design-system/src/styles/themes.css` (new)
- `libs/design-system/src/styles/typography.css` (new)
- `libs/design-system/src/styles/animations.css` (new)
- `libs/design-system/src/styles/index.css` (new)
- `apps/main/src/app/global.css` (modified — replace inlined CSS with imports)

## Implementation steps

1. Create `libs/design-system/src/styles/tokens.css` with the `:root` token declarations from `global.css`.
2. Create `libs/design-system/src/styles/themes.css` with the `@media (prefers-color-scheme: dark)` overrides.
3. Create `libs/design-system/src/styles/typography.css` with the `.profile-name` rule and prose paragraph styles.
4. Create `libs/design-system/src/styles/animations.css` with the `@keyframes fadeInUp` and `.animate-fadeInUp` rules.
5. Create `libs/design-system/src/styles/index.css` that `@import`s all four sub-sheets in order.
6. In `global.css`, replace the inlined tokens/typography/animations with `@import url("../../libs/design-system/src/styles/index.css")` at the top (after the `tw-input.css` import).
7. Verify that `global.css` now only contains prose-specific content styles (gallery, external-link) — these are content-rendering concerns that may stay app-level or be evaluated for promotion.
8. Run `npx nx build main` and inspect the compiled CSS output for token declarations.

## Acceptance criteria

- [ ] `global.css` is significantly shorter (only app-specific overrides remain).
- [ ] `libs/design-system/src/styles/index.css` is the single source for tokens, themes, typography, and animations.
- [ ] No CSS is imported twice (no duplicate token declarations in dev tools).
- [ ] `npx nx build main` produces CSS output containing all token declarations (`--color-surface-page`, `--color-text-primary`, etc.).
- [ ] Visual diff: no layout or color changes (compare before/after screenshots).
- [ ] `@media (prefers-reduced-motion: reduce)` global reset still works.
- [ ] Dark-mode toggle still works.

## Tests and validation commands

```bash
npx nx build main
# Inspect public/global.css or .next/static/css for token declarations
npx nx run-many -t lint test typecheck build
```

## Documentation updates

- `docs/architecture/decisions/0008-design-system.md` — update CSS integration section.
- `docs/architecture/frontend-design-principles.md` — update §11 (remove "no design-system" statement, link to ADR-0008).

## Risks and rollback

- **Risk:** CSS `@import` path resolution in static export. Mitigation: use a relative path that survives Nx project references. The design-system CSS is source-only (not compiled separately), so the `@import` resolves at source level.
- **Risk:** `@layer base` rules may need to be in a specific order relative to Tailwind. Mitigation: the `@import` in `global.css` should come before any app-specific rules.
- **Rollback:** Restore the original `global.css` content. Delete the `styles/` directory.
