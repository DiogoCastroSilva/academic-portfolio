# Academic Portfolio

A personal academic portfolio website I'm building for my wife. It brings her research projects, publications, and professional background together in one place, with the content kept in Markdown so updates don't require changing the app itself.

**Live site:** [Kathleen Miller's portfolio](https://diogocastrosilva.github.io/academic-portfolio/)

This repository currently powers that site. It's not a general-purpose portfolio template at the moment; I may explore making the structure reusable later.

## Built with

- **Next.js and React** for the website
- **Nx** to organize the app and shared libraries in a monorepo
- **TypeScript** for application code
- **Markdown** for project and publication content
- **Tailwind CSS** for styling
- **GitHub Actions and GitHub Pages** for checks and deployment

## Get started

### Requirements

- Node.js 22 (see `.nvmrc`)
- npm 10 or newer

If you use nvm, switch to the project's Node version first:

```bash
nvm use
```

### Install and run locally

```bash
npm install
npx nx run main:dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build the site

```bash
npx nx build main
```

The static site output is written to the repository's `public/` directory.

## Project structure

```text
apps/main/                 Next.js application and page UI
libs/content/              Shared Markdown loading and URL helpers
libs/projects/              Project content and cover images
libs/publications/          Publication content and cover images
libs/navigation/            Navigation configuration
libs/utils/                 Shared utilities
tools/sync-content-assets.mjs
                            Copies content images into the public output
.github/workflows/ci.yml   CI checks and GitHub Pages deployment
```

## Updating portfolio content

Most portfolio updates should be possible without changing the application code.

| What you want to change                           | Where to look                               |
| ------------------------------------------------- | ------------------------------------------- |
| Name, email, social links, and analytics settings | `apps/main/src/configs/site-config.ts`      |
| Profile photo                                     | `apps/main/src/assets/profile.jpeg`         |
| About section text                                | `apps/main/src/app/ui/AboutSection.tsx`     |
| Navigation labels and routes                      | `libs/navigation/src/lib/feature/config.ts` |
| Projects                                          | `libs/projects/src/md/`                     |
| Publications                                      | `libs/publications/src/md/`                 |

### Add a project or publication

Create a Markdown file in the relevant `libs/*/src/md/` directory. Use frontmatter to provide the information shown in cards:

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

Put the image named in `image` in the same directory as the Markdown file. If you add or change images, you can sync them manually:

```bash
npx nx run main:sync-content-assets
```

The development and build targets run the asset sync as part of their workflow.

More specific notes are available in [the projects library README](libs/projects/README.md) and [the publications library README](libs/publications/README.md).

## Checks

The GitHub Actions workflow runs these targets for pushes and pull requests:

```bash
npx nx run-many -t lint test typecheck build
```

Deployment runs after a successful workflow on pushes to `main` (and can also be started manually). The workflow derives the GitHub Pages base path and deployment URL from the repository name, so a fork should not need those values hardcoded.

## Environment and deployment

The default local setup and deployment workflow do not require secrets or repository variables. Optional settings are documented in [`.env.example`](.env.example):

- `NEXT_PUBLIC_BASE_PATH` — path prefix for a GitHub Pages project site
- `NEXT_PUBLIC_DEPLOYMENT_URL` — canonical deployed site URL
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` — optional Cloudflare Web Analytics configuration
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED` — set to `true` to disable analytics

To deploy with GitHub Pages, make sure the repository's Pages settings use the `gh-pages` branch and the workflow has permission to publish repository contents. Push or merge to `main` to trigger a deployment.

## Common commands

```bash
npx nx run main:dev                  # Start the development server
npx nx build main                    # Build and export the site
npx nx run main:sync-content-assets  # Copy content images
npx nx run-many -t lint              # Lint workspace projects
npx nx test                          # Run tests
npx nx format:write                  # Format files
```

## Notes

- The source code is licensed under the [MIT License](LICENSE).
- Portfolio content may have different reuse terms. Check the content licensing settings in `apps/main/src/configs/site-config.ts` before reusing text or images.
- The repository name has changed to `academic-portfolio`. GitHub redirects the repository URL, but project GitHub Pages URLs are not automatically redirected when a repository is renamed; use the live-site link above for the current path. See [GitHub's repository renaming documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).
