# @academic-portfolio/publications

Publication entries for the portfolio, stored as Markdown and local assets. This package configures the shared content pipeline for `/publications`; it does not own page components or Markdown parsing.

## Add a publication

Create a directory named for the URL slug, then add a `README.md` file:

```text
libs/publications/src/md/my-paper/
├── README.md
└── paper-cover.svg
```

Example frontmatter:

```yaml
---
title: "Paper title"
date: "2026-01-15"
authors: ["Alex Morgan", "Taylor Kim"]
venue: "Journal or conference"
doi: "10.xxxx/example"
paperUrl: "https://example.org/paper"
tags: ["research"]
excerpt: "A brief summary for the publication card."
image: paper-cover.svg
draft: true
---
Write the abstract, context, and links in Markdown.
```

The directory name becomes the slug. Keep `draft: true` until the entry is ready to publish. Cover-image paths are relative to the entry directory. Use your own publication details and images you have permission to use; the sample entries and assets have a separate license. See the [content authoring guide](../../docs/product/content-authoring.md) for all supported fields and licensing rules.

## Public exports

- `getAllPublications()` — published metadata for collection and homepage cards.
- `getPublicationBySlug(slug)` — metadata for one published publication.
- `getPublicationContentBySlug(slug)` — full metadata and rendered HTML body.
- `PublicationMeta` and `PublicationItemMeta` — shared TypeScript types.

Import these from `@academic-portfolio/publications`. Validation, draft filtering, URL handling, and rendering are implemented in `@academic-portfolio/content`.

## Development

```bash
npx nx run @academic-portfolio/publications:typecheck
npx nx run-many -t lint test typecheck build
```

This package is tagged `content-layer` and may depend on `foundation` libraries only.
