# T-012: Promote Tag component to the design system

- **Status:** Done
- **Phase:** 6 — Validation & handoff (component extraction)
- **Priority:** P2
- **Dependencies:** T-001, T-010b

## Context

The tag/pill UI pattern is currently duplicated inline across two feature components:

1. `ContentCardSection.tsx` — card listing tags (small, `px-2.5 py-1 text-xs`) with overflow `+N more` handling
2. `ContentDetail.tsx` — detail page tags (larger, `px-3 py-1 text-sm`)

Both render `<li>` elements with the same base classes: `border-border text-text-secondary rounded-full border`, differing only in padding and text-size. These appear across all 6 content pages (projects, publications, blog listings + details).

Additionally, `apps/main/tw-input.css` defines `--color-flood-50` (#fef3c7) and `--color-flood-800` (#92400e) for "amber badge background" and "amber badge text" — these duplicate the design system's existing `--color-status-warning-bg` and `--color-status-warning-text` tokens exactly. They are **dead code** — never referenced by any class or `var()` call in the codebase.

## Problem

- Tag styling is duplicated with slight variations in two different components, risking visual drift.
- App-level color variables (`--color-flood-*`) shadow design-system tokens (`--color-status-warning-*`), causing confusion about token ownership.
- New contributors must rediscover the tag styling pattern rather than reusing a documented component.

## Desired outcome

Extract a reusable `Tag` component into `libs/design-system/src/lib/components/Tag/` that:

1. Accepts a `size` prop (`sm` / `md`) matching the current card vs. detail page sizing.
2. Accepts a `variant` prop (`default` / `warning`) for neutral outline vs. amber status pills.
3. Uses only design-system semantic tokens (no raw color values).
4. Has colocated tests with a11y compliance.
5. Replaces the inline tag styling in `ContentCardSection.tsx` and `ContentDetail.tsx`.
6. Eliminates the dead `--color-flood-*` variables from `tw-input.css`.

## Scope

### In scope

- Create the `Tag` component + barrel export + colocated tests.
- Export `Tag` and `TagProps` from `libs/design-system/src/index.ts`.
- Migrate `ContentCardSection.tsx` to use `<Tag size="sm">` for card-listing tags.
- Migrate `ContentDetail.tsx` to use `<Tag size="md">` for detail-page tags.
- Update affected test assertions.
- Remove `--color-flood-*` dead variables from `apps/main/tw-input.css`.
- Update `docs/design-system/README.md` and ADR-0008 with the new component.

### Out of scope

- Converting the "Featured" badge in `ContentCardSection.tsx` to use `Tag` variant — the badge uses `bg-accent/90` (teal) with absolute positioning and backdrop blur, which is a different visual pattern. This may be addressed in a future ticket.
- Creating a generic "Badge" or "StatusIndicator" component beyond the Tag use case.
- Adding new design-system tokens — the existing `--color-status-warning-*` tokens are sufficient for the warning variant.

## Implementation steps

1. Create `Tag.tsx` with `size` and `variant` props, using design-system token classes.
2. Create `Tag/index.ts` barrel export.
3. Create `Tag/Tag.test.tsx` with semantic, a11y, variant, and className tests.
4. Add `Tag` export to `libs/design-system/src/index.ts`.
5. Migrate `ContentCardSection.tsx` to import and use `Tag`.
6. Migrate `ContentDetail.tsx` to import and use `Tag`.
7. Update `ContentDetail.test.tsx` tag-class assertion to test the `Tag` span instead of the `<li>`.
8. Remove `--color-flood-*` variables from `apps/main/tw-input.css`.
9. Update `docs/design-system/README.md` component table and test count.
10. Update ADR-0008 component count from 4 to 5.
11. Run `npx nx run-many -t lint test typecheck build` — all must pass.

## Acceptance criteria

- [x] `Tag` component exists in `libs/design-system/` with `size` and `variant` props.
- [x] `Tag` is exported from the design-system `index.ts`.
- [x] `Tag` has colocated tests covering semantics, a11y, variants, sizes, and `className`.
- [x] `ContentCardSection.tsx` uses `<Tag size="sm">` for tag rendering.
- [x] `ContentDetail.tsx` uses `<Tag size="md">` for tag rendering.
- [x] Existing test suite passes with no regressions (update assertions as needed).
- [x] `--color-flood-*` variables removed from `tw-input.css`.
- [x] Full check suite (`lint test typecheck build`) passes.
