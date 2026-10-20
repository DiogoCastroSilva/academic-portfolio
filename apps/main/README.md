# @academic-portfolio/main

The Next.js App Router application for the academic portfolio template.

This package owns routes, page composition, reusable page-level UI, metadata/structured data, and the static site configuration. Owner-specific profile and portfolio content belongs in the Markdown files under `libs/*/src/md/`, not in these components.

## Route structure

- `/` — profile summary and previews of published collections.
- `/about/` — profile, education, research interests, and skills.
- `/projects/`, `/publications/`, `/blog/` — collection pages with pagination where needed.
- `/{collection}/{slug}/` — statically generated detail pages for published entries.
- Static 404 fallback — rendered from `src/app/not-found.tsx` and emitted for the static host; it is not a normal content route.

Routes are generated at build time. Draft entries are excluded. The app uses Next.js App Router with `output: "export"`, so request-time server features are not available; see the [Next.js static export guide](https://nextjs.org/docs/app/guides/static-exports).

## Configuration

- `next.config.mjs` — static export, base path, and Next.js/Nx integration.
- `src/configs/site-config.ts` — values derived from the profile and optional deployment/analytics environment variables.
- `src/app/global.css` and `tw-input.css` — global styles, Tailwind CSS v4 imports/source scanning, and the current semantic style layer.
- `public/` — static files copied/generated during the build. Do not hand-edit generated collection assets.

The GitHub Actions workflow derives the repository project-site base path and deployment URL for deployment. For local root-path work, no deployment variables are normally required. See [local development](../../docs/operations/local-development.md) and [deployment](../../docs/operations/deployment.md).

## Development and checks

From the repository root:

```bash
npx nx run main:dev
npx nx build main
npx nx run main:test
npx nx run main:lint
npx nx run main:typecheck
```

The app depends on the content-layer and foundation packages. Keep route components thin: content access/validation belongs in the libraries, repeated collection UI belongs in shared components, and metadata/URL behavior should have regression tests.
