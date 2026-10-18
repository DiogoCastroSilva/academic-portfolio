# ADR-0006: Shared frontend tooling

- **Status:** Accepted
- **Context:** The project needs consistent Prettier and ESLint configuration. Previously used ad-hoc local configuration with single quotes, manually-listed ESLint plugins, and redundant `@nx/eslint-plugin` base configs that conflicted with TypeScript ESLint rules.
- **Decision:** Adopt `@diogozx-org/prettier-config` v1.0.0 and `@diogozx-org/eslint-config` v2.2.0 from the shared `frontend-tooling` repository.
- **Prettier configuration:**
  - `prettier.config.mjs` extends `@diogozx-org/prettier-config` and adds `prettier-plugin-tailwindcss` (required for Tailwind CSS class sorting).
  - **Double quotes** are accepted as the shared convention. All source code was reformatted from single to double quotes.
  - Shared config options: `semi: true`, `singleQuote: false`, `trailingComma: "all"`, `printWidth: 80`, `tabWidth: 2`, `endOfLine: "lf"`.
- **ESLint configuration:**
  - `eslint.config.mjs` composes `@diogozx-org/eslint-config/next` (which provides `eslint-config-next` core-web-vitals, TypeScript ESLint recommended, and Prettier integration) with a single `@nx/enforce-module-boundaries` rule.
  - The previous Nx base configs (`nx.configs["flat/base"]`, `nx.configs["flat/typescript"]`, `nx.configs["flat/javascript"]`) were removed to avoid rule conflicts.
  - Peer dependencies installed: `eslint-plugin-storybook` (required by shared config, though Storybook is not currently used).
- **Alternatives considered:**
  - **Keep local ESLint/Prettier config:** Would require maintaining rule updates manually and diverge from other projects in the organization.
- **Consequences and trade-offs:**
  - Upstream changes to the shared configs will require workspace updates.
  - `@nx/enforce-module-boundaries` must be explicitly layered on top of the shared config because the shared config does not include Nx-specific rules.
  - `apps/main/eslint.config.mjs` was simplified from a multi-config setup (redundant Next.js + Nx TypeScript configs) to just extending the root config with app-specific ignores.
  - `npx nx run-many -t lint` passes for all 7 projects (0 errors, 5 warnings).
  - `npx prettier --check .` passes for all files.
  - `npx nx build main` produces correct static output.
- **Conditions for revisiting:** If a project-specific ESLint rule is needed that conflicts with the shared config, prefer adding it as a narrow override rather than forking the shared config.

### CSS architecture

- **`apps/main/src/app/global.css`** defines a minimal set of semantic CSS custom properties (design tokens) for colours, borders, and text in `:root`, with `@media (prefers-color-scheme: dark)` overrides for dark mode. There is no standalone design-system package — tokens are intentionally lightweight.
- **`@media (prefers-reduced-motion: reduce)`** is honoured via a global rule that neutralises animation and transition durations with `!important`, and via `useReducedMotion()` in `ContentCardSection` which swaps `motion.div`/`motion.article` for plain `div`/`article` elements when reduced motion is requested.
