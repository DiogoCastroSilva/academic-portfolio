# AGENTS.md

## Project at a glance

This is an Nx workspace containing a Next.js 16 static-export portfolio site.

- **App:** `apps/main/` — Next.js App Router, static export to GitHub Pages
- **Libraries:** `libs/content/`, `libs/navigation/`, `libs/projects/`, `libs/publications/`, `libs/utils/`
- **Tests:** Vitest, run via `npx nx run-many --target=test --all`
- **Lint:** ESLint 9 with shared `@diogox-org/eslint-config` + Nx module boundaries
- **Formatting:** Prettier 3 with shared `@diogox-org/prettier-config`

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
npx nx run @katie-portfolio/content:test     # Run a specific project's tests
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

1. Create `libs/projects/src/md/{slug}.md` (or `libs/publications/src/md/` for publications)
2. Add YAML frontmatter with at least `title` and `date`
3. Write Markdown content below the frontmatter
4. Place cover images in the same `src/md/` directory
5. Run `npx nx run main:sync-content-assets` (or `npx nx run main:dev` which does it automatically)

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
- **eslint.config.mjs** — composes `@diogox-org/eslint-config/next` with `@nx/enforce-module-boundaries`
- **prettier.config.mjs** — extends `@diogox-org/prettier-config`, adds Tailwind CSS plugin
- **ContentDetail** — server component (no `'use client'`), uses `dangerouslySetInnerHTML`
- **ContentCardSection** — client component (uses `motion/react` for animations)
- **.swcrc removed** — no decorators used, SWC CLI removed; Next.js uses its own SWC config
- **NX.md removed** — stale generated documentation, replaced by docs/ directory

## Troubleshooting

See [docs/operations/troubleshooting.md](docs/operations/troubleshooting.md) for common issues and fixes.
