# Local Development

## Prerequisites

- **Node.js:** 22 (see `.nvmrc`)
- **npm:** 10 or newer

Using `nvm`:

```bash
nvm use
```

## Install Dependencies

```bash
npm install
```

This installs all workspace dependencies in one pass. The `package-lock.json` is committed and should be kept in sync with `package.json`.

## Development Server

```bash
npx nx run main:dev
```

This starts the Next.js development server with hot reload. It also runs `sync-content-assets` first to copy cover images.

- **URL:** `http://localhost:3000`
- **Base path:** Not applied locally (the site runs at the root path)

## Common Commands

| Task                           | Command                                        |
| ------------------------------ | ---------------------------------------------- |
| Start dev server               | `npx nx run main:dev`                          |
| Build static site              | `npx nx build main`                            |
| Lint all projects              | `npx nx run-many -t lint`                      |
| Run all tests                  | `npx nx run-many -t test`                      |
| Type-check all projects        | `npx nx run-many -t typecheck`                 |
| Run all checks (CI equivalent) | `npx nx run-many -t lint test typecheck build` |
| Format code                    | `npx nx format:write`                          |
| Check formatting               | `npx nx format:check`                          |
| Sync content images            | `npx nx run main:sync-content-assets`          |
| Show project targets           | `npx nx show project main`                     |
| Visualize workspace graph      | `npx nx graph`                                 |

## Running Individual Project Checks

Each Nx project (libraries and the app) has its own `lint`, `test`, and `typecheck` targets:

```bash
# Just the content library tests
npx nx run @katie-portfolio/content:test

# Just the main app lint
npx nx run @katie-portfolio/main:lint

# Just the navigation library typecheck
npx nx run @katie-portfolio/navigation:typecheck
```

## Environment Variables

No environment variables are required for local development. Optional variables:

- `NEXT_PUBLIC_BASE_PATH` — simulates GitHub Pages subpath (e.g., `/academic-portfolio`)
- `NEXT_PUBLIC_DEPLOYMENT_URL` — URL for `DEPLOYMENT_URL` placeholder replacement
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` — overrides the default analytics token
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED` — set to `true` to disable analytics

See `.env.example` for details (if present).
