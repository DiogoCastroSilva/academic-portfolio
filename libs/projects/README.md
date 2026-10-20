# @academic-portfolio/projects

Published project entries for the portfolio, stored as Markdown and local assets. This package configures the shared content pipeline for the `/projects` route; it does not own page components or Markdown parsing.

## Add a project

Create a directory named for the URL slug, then add a `README.md` file:

```text
libs/projects/src/md/my-project/
├── README.md
└── cover.svg
```

Example frontmatter:

```yaml
---
title: "Project title"
date: "2026-01-15"
tags: ["research"]
excerpt: "A short summary for the project card."
image: cover.svg
draft: true
---
Describe the project in Markdown.
```

The directory name becomes the slug. Keep `draft: true` until the entry is ready to publish. Cover-image paths are relative to the entry directory. Use images you own or have permission to use, write meaningful alt text, and see the [content authoring guide](../../docs/product/content-authoring.md) for all supported fields and licensing rules.

After adding or changing assets, sync them locally with:

```bash
npx nx run main:sync-content-assets
```

## Public exports

- `getAllProjects()` — published project metadata for cards and listings.
- `getProjectBySlug(slug)` — metadata for one published project.
- `getProjectContentBySlug(slug)` — full metadata and rendered HTML body.
- `ProjectMeta` and `ProjectItemMeta` — shared TypeScript types.

Import these from `@academic-portfolio/projects`. Validation, draft filtering, URL handling, and rendering are implemented in `@academic-portfolio/content`.

## Development

```bash
npx nx run @academic-portfolio/projects:typecheck
npx nx run-many -t lint test typecheck build
```

This package is tagged `content-layer` and may depend on `foundation` libraries only.
