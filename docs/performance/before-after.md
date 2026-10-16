# Performance Audit - Before/After (WebP Optimizations)

## Overview

This document records the before/after of the Lighthouse CI (LHCI) performance
audit for the WebP image-optimization work, comparing the baseline commit
(`07e9e2d`) against the optimized commit (`55f6d0c`) + HEAD.

> Scope: the figures below come from a measurement taken against the baseline
> (`07e9e2d`) and optimized (`55f6d0c`) commits at the time of the optimization
> work. They are presented from that measurement and are **not** reproduced here.
> The continuous `perf-audit` job in `.github/workflows/ci.yml` re-runs the audit
> on every push/PR to `main`; its live output is uploaded as the
> `lighthouse-reports` artifact and is the authoritative evidence for HEAD.

## Methodology

- Continuous audit tool (as wired in the reusable workflow
  `frontend-tooling/.github/workflows/performance-audit.yml`): `@lhci/cli@0.15.1`.
- Runner: `ubuntu-latest`. Chrome is preinstalled on the runner, so no separate
  browser action is required.
- Runs per route: 3 (LHCI keeps the median to reduce noise).
- Routes audited: `/`, `/about/`, `/projects/first-project/`.
- Commit points:
  - baseline = `07e9e2d` ("feat: add SEO metadata, sitemap, robots.txt, and favicon")
  - optimized = `55f6d0c` ("perf: WebP image conversion, lazy loading, and ContentImage component") + HEAD.

## Measured results (per-route medians, baseline vs. optimized)

3 reports were collected per commit point (3 runs x 3 routes); the values below
are the per-route medians from that measurement (baseline `07e9e2d` vs optimized
`55f6d0c`).

| Route | Metric | Before (`07e9e2d`) | After (`55f6d0c`) | Change |
| --- | --- | ---: | ---: | ---: |
| Homepage `/` | Performance score | 97 | 98 | +1 |
| Homepage `/` | Total bytes (KB) | 1056 | 770 | -27% |
| Homepage `/` | Image bytes (KB) | 815 | 536 | -34% |
| Homepage `/` | WebP savings (KB) | 418 | 61 | -85% |
| Homepage `/` | Largest Contentful Paint (ms) | 1304 | 1082 | -17% |
| Project detail `/projects/first-project/` | Performance score | 100 | 99 | -1 |
| Project detail | Total bytes (KB) | 1193 | 906 | -24% |
| Project detail | Image bytes (KB) | 956 | 677 | -29% |
| About `/about/` | Performance score | (no material change) | (no material change) | ~ |

## WebP audit findings

- Audit ID: `modern-image-formats` (NOT `uses-webp-images`).
- True savings = the sum of per-item `wastedBytes`. The aggregate `numericValue`
  for `modern-image-formats` is `0` and does NOT represent saved bytes; saved
  bytes are only visible by summing `wastedBytes` across each non-WebP
  `<img>` / `<source>` item in the report's audit results.
- Byte attribution: `total-byte-weight` audit items expose only `{ url, totalBytes }`.
  Image / JavaScript / CSS byte totals are therefore derived by URL extension
  (`.webp` / `.png` / `.jpg` / `.svg` -> image; `.js` -> JS; `.css` -> CSS).

## Residual savings and the deliberate-failing-budget test case

The project-detail page (`/projects/first-project/`) still carries about 61-149 KB
of untapped WebP savings in its baseline form: the **profile image was not
converted** to WebP. This is the intended **deliberate-failing-budget** test case.
The `modern-image-formats` assertion is set to `warn` level (report-only), so it
surfaces in the report without failing CI, and can be flipped to `error` to gate
merges.

The default budgets are `warn` (report-only), so `lhci assert` exits 0 and never
blocks CI. A deliberate `error`-level `largest-contentful-paint` budget was
verified to fail the run (`lhci assert` exits 1) during the reusable workflow's
development; see `perf-budgets.json` in `frontend-tooling`.

## CI integration

- The reusable workflow lives in `frontend-tooling`
  (`.github/workflows/performance-audit.yml`, commit `c291634`) and is consumed
  by this repo's `ci.yml` via the `perf-audit` job, which calls it at the **job
  level** (`jobs.perf-audit.uses:`) and is pinned to commit
  `c291634cc6ebe0a309b58d525bcdc4a5c73195b2` (not a moving tag) to prevent drift.
- `perf-audit` runs in **artifact mode**: it downloads the `static-site-output`
  artifact produced by the `ci` job and audits it - no second build.
- Permissions (least privilege): the `perf-audit` job and the reusable workflow
  both declare `permissions: contents: read`. `actions/upload-artifact`
  authenticates via the GitHub Actions runtime token (not `GITHUB_TOKEN`) and
  needs only `contents: read`; no `actions: write` is granted.
- `perf-audit` runs on `push` and `pull_request` to `main` only - it does NOT run
  on `workflow_dispatch` and is not part of the `deploy` job.
- Budgets are **report-only** (`warn`) by default (see `perf-budgets.json` in
  `frontend-tooling`), so the audit never blocks CI until a consumer opts into
  `error` thresholds.
- Reports are uploaded as the `lighthouse-reports` artifact (30-day retention).

## Re-running locally

The same audit can be reproduced locally:

```bash
npm install -g @lhci/cli@0.15.1
# Serve the built site (e.g. `npx serve public`)
lhci collect --config=.lighthouserc.json --output=./.lighthouseci
lhci assert --config=.lighthouserc.json
```

The `.lighthouserc.json` used in CI is generated by the reusable workflow
(`performance-audit.yml`, "Generate LHCI configuration" step) from
`perf-budgets.json` plus the defaults in that workflow. To reproduce locally,
generate an equivalent config with the same `staticDistDir`, `url` (routes),
`numberOfRuns: 3`, and the `warn`-level assertions in `perf-budgets.json`.
