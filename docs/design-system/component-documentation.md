# Component documentation tooling — Storybook evaluation (T-010b)

> **Decision:** **Defer** Storybook. Use README-based examples + colocated tests as documentation.
> **Re-evaluate when:** The design-system library reaches 8+ components.

## 1. Compatibility assessment

| Toolchain    | Version | Storybook 10 compatibility                                                                                        |
| ------------ | ------- | ----------------------------------------------------------------------------------------------------------------- |
| Nx           | 22.6.5  | ✅ Nx 22.1 added official Storybook 10 support (`@nx/storybook`); generates ESM-valid configurations              |
| Next.js      | 16.4.2  | ✅ `@storybook/nextjs-vite` requires Next ≥ 14.1; App Router supported (experimental)                             |
| React        | 19.2.5  | ✅ Fully supported in Storybook 10                                                                                |
| Tailwind CSS | v4      | ⚠️ Requires `@storybook/addon-styling` or Storybook 10 built-in CSS addon; theme sync must be manually maintained |

### Known risk: static export (`output: "export"`)

The project's `next.config.mjs` uses static export mode. Storybook's `@storybook/nextjs-vite` reads `nextConfigPath` but does **not** explicitly document support for `output: "export"`. The Next.js Image optimization and routing features that Storybook hooks into may behave differently or fail in a static-export context. No definitive compatibility statement exists in the Storybook or Nx documentation.

**Verdict:** Unclear at present — would require a prototype to confirm. This is a blocker-level risk, not a showstopper.

## 2. Setup cost estimate

### Dev dependencies (~15 packages)

| Package                         | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `@storybook/react-vite`         | Core renderer (Vite builder)            |
| `@storybook/addon-essentials`   | Controls, actions, docs, viewport, etc. |
| `@storybook/addon-styling`      | Tailwind CSS v4 integration             |
| `@storybook/addon-interactions` | Play-function testing                   |
| `@storybook/test-runner`        | E2E story tests (Playwright)            |
| `playwright` (or `polly`)       | Headless browser for interaction tests  |
| `storybook` (root CLI)          | Dev server and build                    |
| `@storybook/testio`             | Optional cloud testing                  |

**Estimated install size:** ~50–80 MB additional devDependencies.

### Config files

- `.storybook/main.ts` — framework, addons, static dirs (tokens/themes)
- `.storybook/preview.ts` — global decorators (design-system CSS import, fonts)
- `tsconfig.storybook.json` — isolated TS project for stories (per library)
- Per-component `.stories.tsx` files (colocated with components)

### Build time impact

- **Cold start:** Storybook dev server adds ~500–800 ms on first load.
- **CI:** `build-storybook` adds ~2–5 s for a library of this size, but the real cost is the **additional CI pipeline** (test-runner with headless browser) which can add 10–20 s.
- **Caching:** Nx caches build outputs by default, mitigating repeated runs in CI.

### Maintenance cost

- **Version upgrade cadence:** Storybook releases breaking changes every 3–4 months; migrations require careful review.
- **ESM-only (Storybook 10):** Configuration and stories must be valid ESM — Nx's generator handles this, but custom configs still need manual migration attention.
- **Tailwind theme sync:** Design-system CSS tokens must be mirrored in Storybook's `preview.ts` — a manual sync step that can drift.

## 3. Decision and rationale

### Chosen: Defer

**Rationale:**

1. **Component count below threshold.** The design-system library has 4 generic components (`ContentImage`, `Pagination`, `Breadcrumb`, `ChevronIcon`). The project's own guideline (ADR-0008 §Conditions for revisiting) states: re-evaluate when the library reaches 8+ components.

2. **Colocated tests already serve as executable documentation.** Every design-system component has a `*.test.tsx` file covering semantic HTML, a11y compliance, variants, and reduced-motion behavior. These tests are run in CI and serve as living documentation of expected behavior.

3. **Static-export uncertainty.** The project's `output: "export"` configuration is a blocker-level risk — no documented compatibility with Storybook's Next.js framework integration. Resolving this would require a prototype with unclear outcome.

4. **Marginal benefit at current scale.** With 4 simple, well-documented components, the cognitive overhead of a Storybook dev server, story files, and addon configuration outweighs the benefit of isolated component rendering. The components are already visible in-app during development via `npx nx run main:dev`.

5. **Fork-owner benefit is limited.** The project targets a single portfolio site; fork owners customize via the documented [content-authoring guide](../product/content-authoring.md), not via component isolation. Storybook would be more valuable after the Phase 6 "expand design system" milestone if external contributions increase.

### Alternatives provided

See [§4 – README-based component documentation](#4-readme-based-component-documentation) below and the per-component sections in [`README.md`](./README.md#ui-components).

## 4. README-based component documentation

Each design-system component is documented inline via:

1. **JSDoc comments** in the component source file — describes purpose, props, and behavior.
2. **Colocated tests** (`*.test.tsx`) — executable specifications covering all variants, a11y, and edge cases.
3. **README summary table** in [`README.md`](./README.md#ui-components) — overview of each component, its consumers, and notes.

This provides:

- ✅ API discovery (via JSDoc + `index.ts` exports)
- ✅ Behavior verification (via Vitest tests in CI)
- ✅ Usage examples (via test cases)
- ✅ A11y guarantees (via `expectNoA11yViolations` in tests)
- ✅ Zero additional tooling overhead

### Component quick reference

| Component      | Props                                                         | Key behaviors                                                                                      | Test file               |
| -------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------- |
| `ContentImage` | `src`, `alt`, `sizes?`, `className?`, `priority?`, `loading?` | WebP `<picture>` fallback chain, `StaticImageData` support, SVG passthrough                        | `ContentImage.test.tsx` |
| `Pagination`   | `currentPage`, `totalPages`, `baseUrl`                        | Renders nothing when ≤ 1 page, next/link anchors for static export, `aria-current` on current page | `Pagination.test.tsx`   |
| `Breadcrumb`   | `items: { label, href? }[]`                                   | Last item = current page (non-link, `aria-current="page"`), uses `ChevronIcon` separator           | `Breadcrumb.test.tsx`   |
| `ChevronIcon`  | `className?`, `aria-hidden?`                                  | Stateless SVG icon, `aria-hidden` support                                                          | `ChevronIcon.test.tsx`  |
| `Tag`          | `children`, `size?`, `variant?`, `className?`                 | Semantic `<span>` pill, `size` (sm/md), `variant` (default/warning), reduced-motion compliant      | `Tag.test.tsx`          |

### How to run component tests

```
# Run design-system tests only
npx nx run @academic-portfolio/design-system:test

# Run a specific component's tests
npx nx run @academic-portfolio/design-system:test --testPathPattern="ContentImage"

# Run the full workspace check suite
npx nx run-many -t lint test typecheck build
```

## 5. Re-evaluation criteria

| Condition                     | Threshold                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Design-system component count | 8+ generic components                                                                   |
| Fork-owner feedback           | Reports confusion about component APIs or usage                                         |
| Static export compatibility   | Storybook officially supports `output: "export"` or a reliable workaround is documented |
| Project phase                 | Phase 6 "expand design system" milestone reached                                        |
