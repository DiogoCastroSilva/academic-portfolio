# AGENTS.md

## Project at a glance

This is an Nx workspace containing a Next.js 16 static-export portfolio site.

- **App:** `apps/main/` — Next.js App Router, static export to GitHub Pages
- **Libraries:** `libs/content/`, `libs/navigation/`, `libs/projects/`, `libs/publications/`, `libs/utils/`
- **Tests:** Vitest, run via `npx nx run-many --target=test --all`
- **Lint:** ESLint 9 with shared `@diogozx-org/eslint-config` + Nx module boundaries
- **Formatting:** Prettier 3 with shared `@diogozx-org/prettier-config`

Full documentation lives in `docs/`. Start with [docs/README.md](docs/README.md).

## Common commands

```bash
# Development
npx nx run main:dev                         # Start dev server (auto-syncs content assets)
npx nx build main                           # Build static site
npx nx run main:sync-content-assets         # Copy content images

# Verification
npx nx run-many -t lint test typecheck build  # Run all checks (CI equivalent)
npx nx format:write                          # Auto-format with Prettier
npx nx format:check                           # Check formatting
npx nx graph                                 # Visualize workspace

# Individual project
npx nx show project main                     # Show all targets for a project
npx nx run @academic-portfolio/content:test     # Run a specific project's tests
```

## Before making changes

1. Run `npx nx run-many -t lint test typecheck` to establish a baseline.
2. Check `npx nx show project <project>` for available targets.
3. Use TypeScript project references: libraries reference each other via `tsconfig.lib.json`.
4. Do not modify academic content in `libs/projects/src/md/` or `libs/publications/src/md/` without owner review.

## Code style

- Double quotes (shared Prettier config)
- Trailing commas (all)
- 2-space indentation
- Semi-colons required

## Content authoring (for non-engineers)

To add a project or publication:

1. Copy the starter template: `libs/projects/src/md/_template.md` or `libs/publications/src/md/_template.md`
2. Create a directory: `libs/projects/src/md/{slug}/` (or `libs/publications/src/md/{slug}/`)
3. Paste the template as `libs/projects/src/md/{slug}/README.md`
4. Remove the `draft: true` line from the frontmatter
5. Replace the placeholder content with your own
6. Run `npx nx run main:sync-content-assets` (or `npx nx run main:dev` which does it automatically)

Templates use `draft: true` so they won't appear on the live site until published.

Full guide: [docs/product/content-authoring.md](docs/product/content-authoring.md)

## Architectural decisions

See [docs/architecture/decisions/](docs/architecture/decisions/) for ADRs on:

- Static hosting (ADR-0001)
- Nx workspace tooling (ADR-0002)
- Markdown content processing (ADR-0003)
- Content validation and rendering security (ADR-0004)
- Testing strategy (ADR-0005)
- Shared frontend tooling (ADR-0006)

## Key implementation details

- **next.config.mjs** — static export, base path, transpile packages. Converted from CommonJS to ESM.
- **eslint.config.mjs** — composes `@diogozx-org/eslint-config/next` with `@nx/enforce-module-boundaries`
- **prettier.config.mjs** — extends `@diogozx-org/prettier-config`, adds Tailwind CSS plugin
- **global.css** — semantic CSS tokens (`:root`), dark-mode overrides, `prefers-reduced-motion` global reset
- **ContentDetail** — server component (no `'use client'`), uses `dangerouslySetInnerHTML`
- **ContentCardSection** — client component with `motion/react` animations, respects `prefers-reduced-motion` via `useReducedMotion()`
- **.swcrc removed** — no decorators used, SWC CLI removed; Next.js uses its own SWC config
- **NX.md removed** — stale generated documentation, replaced by docs/ directory

## Troubleshooting

See [docs/operations/troubleshooting.md](docs/operations/troubleshooting.md) for common issues and fixes.
