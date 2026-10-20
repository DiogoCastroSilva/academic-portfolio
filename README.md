# Academic Portfolio

A reusable template for an academic portfolio website. It presents research projects, publications, and professional background with content kept in Markdown so owners can update without editing application code.

**Live site:** https://diogocastrosilva.github.io/academic-portfolio/

## Stack

- **Next.js 16** with App Router and static export for GitHub Pages
- **React 19** with CSS animations (home page) and `motion/react` (about page only)
- **Nx 22** for workspace tooling and module-boundary enforcement
- **TypeScript** with strict mode and project references
- **Tailwind CSS 4** with PostCSS
- **Markdown** via `gray-matter` + `marked` for content
- **Vitest 4** for unit testing
- **ESLint 9** (shared `@diogozx-org/eslint-config`) + Nx module boundaries
- **Prettier 3** (shared `@diogozx-org/prettier-config`)
- **Lighthouse CI** with performance budgets (Performance 90+, a11y 95+, Best Practices 95+, SEO 95+)
- **GitHub Actions and GitHub Pages** for CI and deployment

## Why this architecture

This is a single Next.js site with six internal libraries organized into dependency layers enforced by Nx module boundaries:

- **app** (`apps/main`) → can depend on `content-layer` and `foundation`
- **content-layer** (`projects`, `publications`, `blog`) → can depend on `foundation`
- **foundation** (`content`, `navigation`, `utils`) → cannot depend on any internal library

Nx is retained for concrete benefits: (1) `@nx/enforce-module-boundaries` prevents foundation libraries from importing content-layer libraries, catching architectural regressions at lint time; (2) `^typecheck` dependency chains ensure all libraries are type-checked before the app builds; (3) project-aware test/lint targets with automatic parallel execution. See [ADR-0002](docs/architecture/decisions/0002-workspace-tooling.md) for details.

## Get started

**Requirements:** Node.js 22 (see `.nvmrc`), npm 10+

```bash
nvm use
npm install
npx nx run main:dev  # http://localhost:3000
```

## Commands

| Task          | Command                                        |
| ------------- | ---------------------------------------------- |
| Dev server    | `npx nx run main:dev`                          |
| Build         | `npx nx build main`                            |
| Lint          | `npx nx run-many -t lint`                      |
| Test          | `npx nx run-many -t test`                      |
| Typecheck     | `npx nx run-many -t typecheck`                 |
| Format        | `npx nx format:write`                          |
| Sync images   | `npx nx run main:sync-content-assets`          |
| OG images     | `npx nx run main:generate-og-images`           |
| Sitemap       | `npx nx run main:generate-sitemap`             |
| All CI checks | `npx nx run-many -t lint test typecheck build` |

## Project structure

```text
apps/main/                  Next.js application and page UI
libs/blog/                  Blog content (Markdown files in src/md/)
libs/content/               Markdown loading, frontmatter parsing, URL helpers
libs/navigation/            NavBar component and route configuration
libs/projects/              Project content (Markdown files in src/md/)
libs/publications/          Publication content (Markdown files in src/md/)
libs/utils/                 Shared utilities (date formatting)
tools/                      Build utilities (sync-content-assets.mjs, generate-og-images.mjs, generate-sitemap.mjs)
.github/workflows/ci.yml    CI checks and GitHub Pages deployment
docs/                       Full documentation
```

## Content authoring

To add a project or publication, create a directory with a `README.md` file in the relevant directory:

```bash
libs/projects/src/md/my-project/README.md
libs/publications/src/md/my-paper/README.md
```

See the [Content Authoring Guide](docs/product/content-authoring.md) for templates, field reference, and validation rules. Starter templates live at `libs/projects/src/md/_template.md` and `libs/publications/src/md/_template.md` — copy them to a new `{slug}/README.md` directory and remove the `draft: true` line. Quick reference:

```yaml
---
title: "Project title"
date: "2026-02-12"
tags: ["research"]
excerpt: "A short summary for the project card."
image: cover.jpg
---
Write the project or publication details here.
```

## Documentation

- [Documentation index](docs/README.md)
- [Product requirements](docs/product/goals-and-requirements.md)
- [Content authoring guide](docs/product/content-authoring.md)
- [Architecture overview](docs/architecture/overview.md)
- [Architecture decisions](docs/architecture/decisions/)
- [Operations guides](docs/operations/)
- [Lighthouse CI budgets](docs/operations/lighthouse.md)

## Deployment

The CI workflow (`.github/workflows/ci.yml`) runs all checks on every push and deploys to GitHub Pages on merge to `main`. No secrets are required. See [docs/operations/deployment.md](docs/operations/deployment.md) for fork instructions.

## License

- **Code and configuration:** [MIT](./LICENSE) — reuse the template structure freely
- **Portfolio content** (text, images, publications, blog posts in `libs/*/src/md/`): Licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Do not copy sample content into your own portfolio.
- **Your own content:** No license is imposed by the template. Replace the sample content with your own and license it however you choose.

See [TEMPLATE_USAGE.md](./TEMPLATE_USAGE.md) for fork/customization guidance and [ADR-0007](./docs/architecture/decisions/0007-licensing-policy.md) for the full licensing policy.

[![CI](https://github.com/DiogoCastroSilva/academic-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/DiogoCastroSilva/academic-portfolio/actions/workflows/ci.yml)
