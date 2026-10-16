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

2. **`deploy` job:** Runs only on push to `main` (or manual dispatch), after `ci` passes.
   - Derives `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_DEPLOYMENT_URL` from `GITHUB_REPOSITORY`
   - `npm ci`
   - `npx nx build main` (builds static site into `public/`)
   - Deploys `public/` to GitHub Pages via `peaceiris/actions-gh-pages`

## GitHub Pages Setup

### For the original repository

1. Go to **Settings → Pages** in the GitHub repository.
2. Under **Source**, select **Deploy from a workflow**.
3. Choose the workflow `CI & Deploy` and branch `main`.
4. Wait for the first deployment to complete.

### For a fork

When Kathleen forks this repository into her own GitHub account:

1. **Repository name:** If she names it `kathleen-miller.github.io`, the site will be served at `https://kathleen-miller.github.io/` with no base path.
2. **Base path:** The CI workflow automatically detects this case and sets `NEXT_PUBLIC_BASE_PATH=""`.
3. **Deployment URL:** The CI workflow sets `NEXT_PUBLIC_DEPLOYMENT_URL` to the correct URL.
4. **GitHub Pages settings:** Must be configured in the fork's Settings → Pages.
5. **Permissions:** The `peaceiris/actions-gh-pages` action uses `GITHUB_TOKEN` which has write permissions to the `gh-pages` branch by default.

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
    token: process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN ?? "fallback-token",
    enabled: process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED !== "true",
  },
}
```

- The token is a **public identifier**, not a secret. It is safe to commit a fallback value to source control.
- To disable analytics locally: `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED=true`
- To override the token: `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your-token`
- The `CloudflareAnalytics` component validates the token format (32-character hex) before rendering the beacon script.

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
