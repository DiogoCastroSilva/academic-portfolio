# @academic-portfolio/content

Shared, server-only content loading and profile parsing for the portfolio.

This package owns the common Markdown pipeline so projects, publications, and blog posts follow the same rules. Collection-specific packages configure the directory, URL prefix, and placeholder image; the Next.js app consumes their exported accessors.

## Responsibilities

- Parse frontmatter with `gray-matter` and validate content metadata.
- Resolve entry slugs from directory names and cover images from each entry directory.
- Render Markdown through the shared `marked` extensions, including relative URL and GitHub Pages base-path handling.
- Exclude drafts from public collection and slug lookups.
- Parse `src/md/README.md` into typed profile data used by the site.

The content is read from local repository files at build time. This is not a CMS or a browser-side data API.

## Public exports

The package entry point is `src/index.ts`. It exports the shared content-library factory and types, URL/base-path helpers, profile parsing, and Markdown extensions.

A collection package typically creates one configured library:

```ts
import { createContentLibrary } from "@academic-portfolio/content";

const posts = createContentLibrary({
  mdDir: "libs/blog/src/md",
  publicPrefix: "/blog",
  placeholderFilename: "blog-placeholder.svg",
});

export const getAllPosts = posts.getAll;
export const getPostBySlug = posts.getBySlug;
export const getPostContentBySlug = posts.getContentBySlug;
```

- `getAll()` returns published metadata for listing pages.
- `getBySlug(slug)` returns published metadata for a known slug.
- `getContentBySlug(slug)` asynchronously returns the entry metadata plus rendered HTML body.
- `getProfile()` reads and validates the owner profile.

## Content conventions

Each entry is a directory under a collection's `src/md/` folder with a `README.md` file and any local images:

```text
libs/blog/src/md/my-post/
├── README.md
└── cover.svg
```

The directory name is the public slug. Set `draft: true` while content is unfinished; drafts must not appear in published lists, detail routes, sitemap output, or generated metadata. See the [content authoring guide](../../docs/product/content-authoring.md) for frontmatter fields and image rules.

Profile information is maintained in [README.md](src/md/README.md). Do not add owner-specific data to application components.

## Trust and security

`marked` does not sanitize raw HTML. Markdown is treated as trusted repository-authored content
and is rendered in a server component. All HTML output is sanitized with `sanitize-html` at the
Markdown→HTML boundary (in `create-content-library.ts` for collection content and in `profile.ts`
for the biography) before injection via `dangerouslySetInnerHTML`. See
[ADR-0009](../../docs/architecture/decisions/0009-html-sanitization.md) for the allowlist
and rationale. Only merge content from trusted sources; if a public content-submission workflow
is added, review the sanitization allowlist to ensure it remains appropriate for external input.

## Development

Run from the repository root:

```bash
npx nx run @academic-portfolio/content:test
npx nx run @academic-portfolio/content:typecheck
npx nx run-many -t lint test typecheck build
```

The package is tagged `foundation` in Nx and must not import from other internal libraries. Collection packages and the app may depend on it according to the module-boundary rules in the root ESLint configuration.
