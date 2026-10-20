# @academic-portfolio/blog

Markdown-backed blog posts for the portfolio's optional blog section.

The package is deliberately thin: it configures the shared content pipeline from `@academic-portfolio/content` for `/blog` and exports blog-specific accessors. Markdown parsing, validation, image lookup, draft filtering, and URL handling belong to the shared content package.

## Add a post

Create a directory under `src/md/` and put the entry in a `README.md` file:

```text
libs/blog/src/md/my-post/
├── README.md
└── cover.svg
```

Example frontmatter:

```yaml
---
title: "A useful post title"
date: "2026-01-15"
tags: ["research", "methods"]
excerpt: "A short summary for the post card."
draft: true
image: cover.svg
---
Write the post in Markdown.
```

The directory name becomes the URL slug. Keep `draft: true` until the post is ready to publish. Remove the draft flag or set it to `false` to publish. Use images you own or have permission to use, write useful alt text, and see the [content authoring guide](../../docs/product/content-authoring.md) for the full field reference and licensing rules.

The blog is optional. With no published posts, the homepage omits its Blog preview; the collection route has an intentional empty state.

## Public exports

- `getAllBlogPosts()` — published post metadata for collection and homepage cards.
- `getBlogPostBySlug(slug)` — metadata for one published post.
- `getBlogPostContentBySlug(slug)` — full post metadata and rendered HTML body.

Import these functions from `@academic-portfolio/blog`; do not duplicate content parsing inside the app.

## Development

```bash
npx nx run @academic-portfolio/blog:typecheck
npx nx run-many -t lint test typecheck build
```

This package is tagged `content-layer` and may depend on `foundation` libraries only. It should not import from the app or other content collections.
