# Build tools

These Node.js scripts support the static build and deployment. They are invoked by Nx targets and should be run from the repository root.

## Scripts

### `sync-content-assets.mjs`

Copies images from `libs/*/src/md/` into `apps/main/public/` while preserving entry-relative paths. It also resizes raster images to a maximum width of 1200px and generates WebP variants for JPEG/PNG where conversion is available. SVG files are copied as-is.

Nx targets:

- `npx nx run main:sync-content-assets` — normal asset sync for build/test.
- `npx nx run main:sync-content-assets-dev` — skips resize and WebP generation for faster local development.

Environment variables:

- `SKIP_WEBP_CONVERSION=true` — skip WebP generation.
- `SKIP_IMAGE_RESIZE=true` — skip raster resizing.

### `generate-og-images.mjs`

Generates static SVG Open Graph assets in the root `public/og/` directory from the current profile and published content. It runs as part of the app build. The TypeScript helper in `apps/main/src/app/lib/og-image.ts` provides the corresponding metadata reference logic; keep their output conventions aligned.

### `generate-sitemap.mjs`

Scans the built `public/` directory and writes `sitemap.xml` and `robots.txt`. Run it after a successful build:

```bash
npx nx build main
npx nx run main:generate-sitemap
```

It excludes error routes, draft content (which should not have generated pages), and pagination page-one redirect stubs. `NEXT_PUBLIC_DEPLOYMENT_URL` sets the absolute URL prefix; the CI workflow supplies the repository deployment URL.

## Maintenance rules

- Treat generated assets in root `public/` as build output; do not edit them by hand.
- Keep file paths and output directories aligned with the Nx targets in `apps/main/package.json` and `apps/main/project.json`.
- Preserve base-path support for GitHub Pages project sites.
- If a script's behavior or environment variables change, update this guide and the related operations documentation.
