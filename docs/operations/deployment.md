# Deployment

## Hosting

GitHub Pages (static hosting). The build output is a static HTML/CSS/JS bundle written to the repository root `public/` directory.

## Repository URL vs. Deployment URL

| Concept              | Description                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Repository URL**   | `https://github.com/{owner}/{repo}` — where the source code lives                                                         |
| **GitHub Pages URL** | `https://{owner}.github.io/{repo}/` (project site) or `https://{owner}.github.io/` (user site) — where the site is served |
| **Base path**        | `/repo` (project site) or `` (user site) — prefix for all internal asset URLs                                             |
| **Deployment URL**   | The full GitHub Pages URL — used to rewrite `DEPLOYMENT_URL` placeholders in Markdown content                             |

**Important:** These are distinct concepts. The CI workflow derives the base path and deployment URL automatically from the repository name.

## CI/CD Workflow

The workflow is in `.github/workflows/ci.yml`:

1. **`ci` job:** Runs on every push and pull request.
   - `npm ci` (clean install from lockfile)
   - `npx nx run-many -t lint test typecheck build`
   - `npx nx fix-ci` (Nx Cloud suggestions, if available)

2. **`perf-audit` job:** Runs after CI on pushes and pull requests. It reuses the pinned Lighthouse workflow, audits published routes, and reports budget failures without blocking deployment.
3. **`deploy` job:** Runs only on push to `main` (or manual dispatch), after `ci` passes.
   - Derives `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_DEPLOYMENT_URL` from `GITHUB_REPOSITORY`
   - `npm ci`
   - `npx nx build main` (builds the static site into `public/` and syncs content assets)
   - `npx nx run main:generate-sitemap` (writes `sitemap.xml` and `robots.txt` after the build)
   - Deploys `public/` to GitHub Pages via `peaceiris/actions-gh-pages`

## GitHub Pages Setup

### For the original repository

1. Go to **Settings → Pages** in the GitHub repository.
2. Under **Source**, select **Deploy from a branch**.
3. Choose the `gh-pages` branch and the `/ (root)` folder.
4. Wait for the first deployment to complete.

### For a fork

The repository is not currently marked as a GitHub template, so **fork it for now**. The owner can enable GitHub's “Template repository” setting later to expose the “Use this template” button as an additional path. When you fork this repository into your own GitHub account:

1. **Repository name:** If you name it `{username}.github.io`, the site will be served at `https://{username}.github.io/` with no base path.
2. **Base path:** The CI workflow automatically detects this case and sets `NEXT_PUBLIC_BASE_PATH=""`.
3. **Deployment URL:** The CI workflow sets `NEXT_PUBLIC_DEPLOYMENT_URL` to the correct URL.
4. **GitHub Pages settings:** After the first deployment, configure **Settings → Pages → Source: Deploy from a branch → gh-pages → / (root)**.
5. **Permissions:** The `peaceiris/actions-gh-pages` action uses `GITHUB_TOKEN`, which needs `contents: write` permission (already set in the workflow) to push to the `gh-pages` branch. No manually-set secrets or paid features are required.

### Base path behavior

- **User site** (`owner.github.io`): Base path = `""`, all assets at root
- **Project site** (`owner.github.io/repo`): Base path = `/repo`, all assets prefixed with `/repo`

The CI workflow handles this automatically:

```bash
if [ "$NAME" = "${OWNER}.github.io" ]; then
  URL="https://${OWNER}.github.io"
  BASE_PATH=""
else
  URL="https://${OWNER}.github.io/${NAME}"
  BASE_PATH="/${NAME}"
fi
```

## Analytics

Cloudflare Web Analytics is configured in `apps/main/src/configs/site-config.ts`:

```typescript
analytics: {
  cloudflare: {
    token: process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN ?? "",
    enabled:
      process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED !== "true" &&
      Boolean(process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN),
  },
}
```

Analytics is **disabled by default**. To enable:

1. Set `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` to your Cloudflare Web Analytics token.
2. Analytics is automatically enabled when a token is present and `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED` is not `"true"`.

- The token is a **public identifier**, not a secret. It is safe to commit a fallback value to source control.
- To disable analytics locally: `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED=true`
- To override the token: `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your-token`
- The `CloudflareAnalytics` component validates the token format (32-character hex) before rendering the beacon script.

## Clean-Fork Acceptance Test Checklist

This checklist verifies that a scientist with no frontend experience can
fork, personalize, and deploy this portfolio template without editing
application code.

### Prerequisites

- [ ] A GitHub account
- [ ] No paid GitHub features required (only public repositories + GitHub Pages)
- [ ] Node.js 22.x (`.nvmrc` specifies version 22)

### Fork and deploy

- [ ] Fork the repository into your account (or use "Use this template" after that repository setting has been enabled)
- [ ] Enable GitHub Pages: **Settings → Pages → Source: Deploy from a branch → `gh-pages` → `/ (root)`**
- [ ] Push to `main` triggers CI → site deploys to GitHub Pages automatically
- [ ] No manually-set secrets are required

### Personalization checklist

| #   | Action                                                                       | Expected result                                         |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Edit `libs/content/src/md/profile.md` (name, bio, photo)                     | Site reflects new profile on `/about/`                  |
| 2   | Add a new project under `libs/projects/src/md/new-project/` with `README.md` | Appears in `/projects/` list and its own detail page    |
| 3   | Add a project with `draft: true`                                             | Does NOT appear in `/projects/` list or sitemap         |
| 4   | Delete `draft: true` from a project                                          | Now appears in `/projects/` list and sitemap            |
| 5   | Replace `cover.jpg` in a project folder                                      | New image appears in OG image and detail page           |
| 6   | Add a publication under `libs/publications/src/md/`                          | Appears in `/publications/` with authors/venue metadata |
| 7   | Delete all sample entries from a collection                                  | Collection page renders intentional empty state         |
| 8   | Edit `libs/content/src/md/profile.md` (`name`, `description`, contact links) | Metadata (title, description, OG) reflects changes      |

### No-code confirmation

- [ ] No edits to any `.tsx`/`.ts` files under `apps/main/src/app/`
- [ ] No edits to any `.ts` files under `libs/` (except `src/md/` markdown)
- [ ] No dependency installation or Nx configuration changes

### Post-deployment verification

- [ ] Sitemap (`https://username.github.io/sitemap.xml`) contains all published routes
- [ ] Sitemap excludes drafts, error pages (`404`, `non-existent-slug`)
- [ ] `robots.txt` has `Allow: /` and correct `Sitemap:` directive
- [ ] All URLs include the GitHub Pages base path (`/repo` or root for user sites)
- [ ] Internal links resolve correctly (no 404s from base-path mismatches)

### Definition of done

- [ ] All checklist items pass
- [ ] Fork owner confirms they never needed to touch application code
- [ ] CI workflow runs and deploys with zero manual configuration

## Manual Deployment

If the CI workflow is unavailable, you can deploy manually:

```bash
npm ci
NEXT_PUBLIC_BASE_PATH="/academic-portfolio" \
NEXT_PUBLIC_DEPLOYMENT_URL="https://diogocastrosilva.github.io/academic-portfolio" \
npx nx build main
npx nx run main:sync-content-assets  # ensure images are copied
# Then push the public/ directory to the gh-pages branch
```

## Environment Variables in CI

The CI workflow sets these variables automatically:

- `NEXT_PUBLIC_BASE_PATH` — derived from repository name
- `NEXT_PUBLIC_DEPLOYMENT_URL` — derived from repository name

No GitHub secrets are required for deployment. The `GITHUB_TOKEN` (automatically provided by GitHub Actions) is used for authentication.
