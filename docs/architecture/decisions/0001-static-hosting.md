# ADR-0001: Static hosting on GitHub Pages

- **Status:** Accepted
- **Context:** Kathleen needs a low-maintenance, free hosting solution for an academic portfolio. The site is content-driven and does not require server-side rendering or dynamic routes at request time.
- **Decision:** Use Next.js static export (`output: "export"`) deployed to GitHub Pages via the `peaceiris/actions-gh-pages` GitHub Action.
- **Alternatives considered:**
  - **Vercel:** Offers excellent Next.js integration but introduces a dependency on a third-party service and potential cost at scale.
  - **Netlify:** Similar trade-offs to Vercel.
  - **Self-hosted static:** Requires ongoing server maintenance and domain management.
- **Consequences and trade-offs:**
  - No Incremental Static Regeneration or server-side rendering — every page is pre-rendered at build time.
  - Base path must be derived from the repository name, requiring environment-variable configuration.
  - Trailing slashes must be enabled for GitHub Pages routing compatibility.
- **Evidence or validation:**
  - Build output verified: `public/index.html`, `public/projects/first-project/`, `public/publications/` all generated correctly.
  - `distDir: "../../public"` writes to the root `public/` directory, which is git-ignored.
  - The CI workflow derives `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_DEPLOYMENT_URL` from `GITHUB_REPOSITORY`.
- **Conditions for revisiting:** If dynamic content features (comments, CMS preview, forms backend) are added and cannot be handled via client-side JavaScript with a third-party service.
