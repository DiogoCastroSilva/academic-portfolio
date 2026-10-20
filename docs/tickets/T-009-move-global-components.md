# T-009: Move global components to `apps/main/src/components/` and utilities to `lib/`

- **Status:** Done
- **Phase:** 5 — Feature-driven UI organization
- **Priority:** P2
- **Dependencies:** T-001–T-008

## Context

After promoting shared primitives to the design system (T-003–T-005) and moving feature-specific components to `features/` (T-007, T-008), the `apps/main/src/app/ui/` folder will contain only app-global components:

- `Footer.tsx` — site footer (config-driven)
- `CloudflareAnalytics.tsx` — analytics script
- `JsonLd.tsx` — JSON-LD script injection utility

Of these, `JsonLd` is not a UI component — it is a utility that injects `<script>` tags for structured data. It should live in `apps/main/src/lib/`.

## Problem

`JsonLd` is classified as a UI component in `ui/` but is really a utility. `Footer` and `CloudflareAnalytics` are app-global and don't belong in `features/`.

## Desired outcome

- `JsonLd` moves to `apps/main/src/lib/JsonLd.tsx` (it's already imported as `./lib/structured-data` sibling — see `ContentDetail.tsx` line 4).
- `Footer` and `CloudflareAnalytics` move to `apps/main/src/components/Footer/` and `apps/main/src/components/CloudflareAnalytics/` respectively (or remain in `ui/` if the folder is otherwise empty — but the brief's target structure calls for a `components/` dir).
- All imports updated.
- `ui/` directory is empty and can be deleted (or retained for `icons/` if any icons remain).

## Scope

### In scope

- Create `apps/main/src/components/` directory
- Move `Footer.tsx` + `Footer.test.tsx` → `components/Footer/`
- Move `CloudflareAnalytics.tsx` → `components/CloudflareAnalytics/` (no test)
- Move `JsonLd.tsx` + `JsonLd.test.tsx` → `lib/JsonLd.tsx` + `lib/JsonLd.test.tsx`
- Update imports in layout.tsx, page.tsx, about/page.tsx, [slug]/pages
- Delete old `ui/` directory contents

### Out of scope

- Moving `ContentImage`, `Pagination`, `Breadcrumb` (already in design system)
- Moving about/feature components (T-007, T-008)

## Implementation steps

1. Create `apps/main/src/components/` directory.
2. Move `Footer.tsx` + test → `components/Footer/Footer.tsx` + test + `index.ts`.
3. Move `CloudflareAnalytics.tsx` → `components/CloudflareAnalytics.tsx` (or `.tsx` without test).
4. Move `JsonLd.tsx` + test → `lib/JsonLd.tsx` + test (already in `lib/`-adjacent position).
5. Update all imports across the app.
6. Delete `ui/` directory.
7. Run full check suite.

## Acceptance criteria

- [ ] `JsonLd` is in `apps/main/src/lib/`.
- [ ] `Footer` is in `apps/main/src/components/Footer/`.
- [ ] `CloudflareAnalytics` is in `apps/main/src/components/`.
- [ ] `ui/` directory is empty or deleted.
- [ ] `npx nx run-many -t lint test typecheck build` passes.
- [ ] Layout, pages, and detail pages render correctly.

## Tests and validation commands

```bash
npx nx run-many -t lint test typecheck build
```

## Documentation updates

- `docs/architecture/overview.md`: update app structure.
- `AGENTS.md`: update component structure.

## Risks and rollback

- **Risk:** `JsonLd` is imported from `./ui/JsonLd` in multiple files. Use careful search-and-replace.
- **Risk:** `CloudflareAnalytics` is imported in `layout.tsx`. Verify import path.
- **Rollback:** Move files back, revert imports.
