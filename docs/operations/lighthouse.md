# Lighthouse CI

This project uses [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) to enforce performance budgets.

## Budgets

| Metric         | Minimum Score |
| -------------- | ------------- |
| Performance    | 90            |
| Accessibility  | 95            |
| Best Practices | 95            |
| SEO            | 95            |

## Configuration

Budgets are defined in `.lighthouserc.json` at the repository root:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

## Running audits locally

```bash
# Build the static site
npx nx build main

# Serve and run Lighthouse CI
npx serve public -l 3500
npx lighthouse http://localhost:3500 --chrome-flags="--headless"
```

## Budget enforcement

The budgets in `.lighthouserc.json` assert `error` level (not `warning`), which
means Lighthouse CI **will report failures** when any category falls below its
threshold. In the current CI workflow (`ci.yml`), the Lighthouse job is a
**report-only** step — it runs after `ci` but does **not** block the `deploy`
job (deploy depends only on `ci`). This means the budgets are enforced as
advisory checks that produce visible failures in GitHub Actions, but do not
gate releases. Audited routes (`/, /about/, /projects/`) are intended to be prerendered as static pages and exist in the `public/` build artifact. Audit only published routes: draft content is intentionally excluded from static output, so a draft detail route such as `/projects/first-project/` returns 404 and causes Lighthouse collection to fail before budget assertions run.

## Key optimizations

- **`motion/react` removed from home page** — CSS animations replace JS animations for the home page (AboutSection, ContentCardSection). The library remains only on the About page (AboutHero).
- **Image resizing** — the sync script (`tools/sync-content-assets.mjs`) resizes images to a max width of 1200px using `sharp`.
- **WebP with JPEG fallback** — all JPEG/PNG images have WebP variants served via `<picture>` elements.
- **`fetchPriority="high"`** — applied to LCP images (profile picture).
- **`<link rel="preload">`** — for the profile WebP image to start loading before DOM parsing.
- **Cloudflare Analytics** — disabled when no token is configured to avoid CORS errors on localhost.
