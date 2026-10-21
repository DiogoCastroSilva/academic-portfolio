# Architecture Overview

## Application and Route Structure

The application is a Next.js 16 App Router project with static export for GitHub Pages.

```
apps/main/src/app/
├── about/              Biography and research interests
├── projects/           Project listing and detail pages
│   ├── page.tsx        Projects index (list all)
│   └── [slug]/page.tsx Dynamic detail page (SSG per project)
├── publications/       Publications listing and detail pages
│   ├── page.tsx        Publications index (list all)
│   └── [slug]/page.tsx Dynamic detail page (SSG per publication)
├── blog/               Optional blog listing and post-detail pages
│   ├── page.tsx        Blog index (list all)
│   └── [slug]/page.tsx Dynamic detail page (SSG per post)
├── not-found.tsx       404 page
├── error.tsx           Error boundary with dev-mode stack trace
├── layout.tsx          Root layout with NavBar, Footer, analytics
├── page.tsx            Homepage
```

### Routes at build time

| Route                   | Type   | Notes                                     |
| ----------------------- | ------ | ----------------------------------------- |
| `/`                     | Static | Homepage                                  |
| `/about/`               | Static | Biography, education, skills, CV link     |
| `/projects/`            | Static | Lists all projects via `getAllProjects()` |
| `/projects/[slug]/`     | SSG    | One static page per project               |
| `/publications/`        | Static | Lists all publications (currently empty)  |
| `/publications/[slug]/` | SSG    | One static page per publication           |
| `/blog/`                | Static | Lists all blog posts (or placeholder)     |
| `/blog/[slug]/`         | SSG    | One static page per blog post             |
| `/_not-found/`          | Static | Fallback 404 page                         |

## Content Directories and Package Boundaries

The workspace is an Nx monorepo with one application and **seven** libraries:

```text
apps/main/
  src/               Next.js application code (App Router routes, features/, components/, lib/, configs/)
  public/            Static assets (favicon, etc.)
  eslint.config.mjs  App-level ESLint overrides (extends root)
  next.config.mjs    Next.js configuration

libs/
  design-system/     Semantic CSS tokens, typography, and generic UI primitives (ADR-0008)
  content/           Markdown loading, frontmatter parsing, image resolution
  navigation/        NavBar component and route configuration
  projects/          Project content (markdown files) + library accessor
  publications/      Publication content (markdown files) + library accessor
  blog/              Optional blog content (markdown files) + library accessor
  utils/             Shared utilities (date formatting, test helpers)
```

**Module boundary rules:** `@nx/enforce-module-boundaries` is configured in the root `eslint.config.mjs` with `depConstraints` based on project tags defined in each library's `package.json`:

- `app` (apps/main) → can depend on `design-system`, `content-layer`, and `foundation`
- `content-layer` (projects, publications, blog) → can depend on `design-system` and `foundation`
- `design-system` → can depend on `foundation` only
- `foundation` (content, navigation, utils) → cannot depend on any internal library

This enforces the dependency layers: app → content-layer/design-system → foundation → external.

## Markdown Parsing, Validation, and Rendering Flow

```
Markdown entry `README.md` in libs/{projects|publications|blog}/src/md/{slug}/
    |
    v
gray-matter parses YAML frontmatter -> { data, content }
    |
    v
validateFrontmatter() - checks required fields (title, date),
  field types, date format (YYYY-MM-DD)
    |
    v
toContentMeta() - resolves slug (directory name),
  resolves image (explicit, glob by slug, or placeholder)
    |
    v
createMarkedInstance(config) - creates a Marked instance with:
  - walkTokens: resolves href/src on markdown image & link tokens
    (DEPLOYMENT_URL, empty href, relative path prefixing)
  - custom renderers: image -> <figure>/<figcaption>,
    link -> external attributes, paragraph -> gallery detection
  - hooks.postprocess: processes raw HTML (DEPLOYMENT_URL,
    relative paths, external attributes) with negative lookahead
    to avoid double-processing walkTokens-resolved URLs
    |
    v
instance.parse(body) -> HTML string
    |
    v
ContentItemMeta { ...meta, body: htmlString }
    |
    v
Rendered by ContentDetail (server component) via dangerouslySetInnerHTML
```

**Trust model:** Content is authored by the repository maintainer (trusted). `marked` does not sanitize HTML; raw HTML in Markdown is preserved. See [ADR-0004](decisions/0004-content-validation-and-rendering.md) for details.

## Static Generation and Asset Handling

Cover images are stored alongside each entry's `README.md` in `libs/{projects|publications|blog}/src/md/{slug}/`. A Node.js script (`tools/sync-content-assets.mjs`) copies them to `apps/main/public/{projects,publications,blog}/` before build or dev:

```
npx nx run main:sync-content-assets
```

This target is a dependency of both `main:build` and `main:dev`.

### Base-path and deployment URL

| Variable                     | Purpose                                                         | Default         |
| ---------------------------- | --------------------------------------------------------------- | --------------- |
| `NEXT_PUBLIC_BASE_PATH`      | GitHub Pages subpath (e.g., `/academic-portfolio`)              | `""` (root)     |
| `NEXT_PUBLIC_DEPLOYMENT_URL` | Canonical site URL for `DEPLOYMENT_URL` placeholder replacement | `""` (disabled) |

Both are set by the CI workflow from the repository name.

## SEO Metadata Generation

Each page sets `<title>` and `<meta name="description">`:

- Homepage: Title from `siteConfig.name`; description from `profile.md` (`description` field) with a generic `Portfolio of {name}` fallback
- Project/detail pages: Dynamic title and description

## Testing and CI

- Unit tests: Vitest via `npx nx run-many --target=test --all`
- Lint: ESLint flat config (shared preset + Nx module boundaries)
- Type checking: `tsc --build --emitDeclarationOnly` per library
- Build: `next build`, depends on `^typecheck` and `sync-content-assets`
- CI: `nx run-many -t lint test typecheck build`, then deploys to GitHub Pages on push to `main`

## Deployment Process

1. GitHub Actions triggers on push to `main` or manual dispatch.
2. CI: `npm ci` then `nx run-many -t lint test typecheck build`
3. Deploy: derives base path and deployment URL from `GITHUB_REPOSITORY`, builds, uploads `public/` to GitHub Pages.

## Static-hosting Constraints

- No server-side rendering at request time.
- `output: "export"` — all pages prerendered at build time.
- `images.unoptimized: true` is configured in `next.config.mjs` for static-export compatibility, but the current `ContentImage` component renders native `<img>`/`<picture>` elements rather than `next/image`. Revisit the unused image configuration during dependency/configuration cleanup.
- `trailingSlash: true` — all routes end with `/`.
- `distDir: "../../public"` — build output at workspace root `public/`.

## Frontend Design Principles

See [`frontend-design-principles.md`](frontend-design-principles.md) for the cross-cutting design language: information architecture, typography/spacing, card/tag rules, responsive behavior, theme/semantic colors, navigation/breadcrumbs, keyboard/focus, motion/reduced-motion, and constraints against unnecessary abstraction.
