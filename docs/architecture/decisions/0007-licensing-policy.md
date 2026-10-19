# ADR-0007: Licensing policy for code, sample content, and owner-supplied content

- **Status:** Accepted
- **Context:** The repository mixes a Next.js/Nx codebase with sample academic
  portfolio content. Fork owners need to know which license applies to which
  parts: the reusable template code, the pre-loaded example content, and any
  content they add after forking. Without explicit separation, contributors and
  fork owners may inadvertently violate the CC BY-NC-ND sample-content license
  by copying examples, or be unsure what rights they have over their own
  additions. See Phase 5 acceptance criteria and
  `docs/product/goals-and-requirements.md`.
- **Decision:** Three tiers of licensing are declared:

  | Category | Path | License | Notes |
  |---|---|---|---|
  | **Repository code and configuration** | Everything outside `libs/*/src/md/` — Next.js app, Nx workspace config, scripts, ESLint/Prettier configs, CI workflows, `site-config.ts` | [MIT](./LICENSE) | Reuse the template skeleton freely. |
  | **Sample portfolio content** | `libs/content/src/md/`, `libs/projects/src/md/`, `libs/publications/src/md/`, `libs/blog/src/md/` | [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) | Example content only. Do not copy sample content into your own portfolio. Replace with your own. |
  | **Owner-supplied content** | Content added or replaced after forking | No license imposed by the template | Fork owners may license their own content however they choose. The template does not claim any rights over content you write. |

  The site-config values `repoLicenseName` ("MIT") and `contentLicenseName`
  ("CC BY-NC-ND 4.0") drive the footer/structured-data license display and
  align with this ADR. The `contentLicenseName` applies only to the pre-loaded
  sample content; it does not restrict owner-supplied content.

  To change the displayed license for owner-supplied content, update
  `apps/main/src/configs/site-config.ts` (`contentLicenseName` and
  `contentLicenseUrl`). If you replace all sample content with your own, you
  may also change or remove the CC BY-NC-ND attribution.
- **Alternatives considered:**
  - **Single license for everything (MIT only):** Simpler, but does not protect
    the original author's sample content (biography text, publication details,
    images) from being copied into other portfolios. This was the original
    intent of the dual-license approach.
  - **Apache 2.0 for code:** Provides patent grant, but MIT is simpler and
    sufficient for a portfolio template; Apache 2.0 would add license-text
    boilerplate to every source file.
- **Consequences and trade-offs:**
  - The MIT LICENSE file in the repository root applies to code only. A
    separate `LICENSE-CONTENT` file is intentionally **not** created; the
    sample-content license is referenced via `site-config.ts` and this ADR to
    avoid ambiguity about its scope.
  - If a fork owner wishes to publish their own content under CC BY-NC-ND, they
    need only keep the `contentLicenseName` setting unchanged. No code changes
    are required.
  - Markdown-rendered content pages display the `contentLicenseName` in the
    footer. This is correct only while sample content is present; if all sample
    content is replaced, the owner should update the setting.
- **Evidence or validation:**
  - README.md § License already states MIT for code and CC BY-NC-ND 4.0 for
    portfolio content.
  - TEMPLATE_USAGE.md § Policy restates the same dual-license policy.
  - `apps/main/src/configs/site-config.ts` exports `repoLicenseName` ("MIT")
    and `contentLicenseName` ("CC BY-NC-ND 4.0").
  - `LICENSE` file at repository root is the MIT license.
