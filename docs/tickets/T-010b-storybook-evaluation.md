# T-010b: Component documentation tooling evaluation (Storybook)

- **Status:** To do
- **Phase:** 4 — Design-system foundation (evaluation)
- **Priority:** P2
- **Dependencies:** T-001

## Context

`eslint-plugin-storybook` (^10.0.0) is already in `devDependencies` in `package.json`. ADR-0006 §CSS architecture references it as: "Peer dependencies installed: `eslint-plugin-storybook` (required by shared config, though Storybook is not currently used)."

The brief's Ticket H asks to evaluate Storybook compatibility, but the existing devDependency context is not mentioned.

## Problem

No component documentation tooling exists. Contributors must run the app or read source to understand how components render. The `eslint-plugin-storybook` dependency is already installed but unused.

## Desired outcome

Determine whether Storybook is appropriate for documenting design-system components, and either:

- (a) Adopt Storybook with a minimal configuration, or
- (b) Defer it with a documented alternative (e.g., README-based examples + tests as documentation).

## Scope

### In scope

- Check Storybook compatibility with Nx 22, Next.js 16, React 19, Tailwind CSS v4
- Estimate setup and maintenance cost
- If adopted: demonstrate that components render with real tokens and styles
- If deferred: document the decision and provide an alternative

### Out of scope

- Full Storybook story creation for all components (only a demonstration)
- Migrating existing tests to Storybook

## Implementation steps

1. Review `@storybook/nextjs` compatibility with Next.js 16 and Nx 22.
2. Check if `@storybook/react-vite` works with the existing Vite setup.
3. Try a minimal Storybook installation on a branch (not committed unless adopted).
4. Evaluate: does Storybook render components with design-system CSS tokens?
5. Document findings in `docs/design-system/component-documentation.md`.

## Acceptance criteria

- [ ] Storybook compatibility with the current toolchain is assessed.
- [ ] Setup cost is estimated (dev deps, config files, build time impact).
- [ ] Decision is documented: adopt or defer, with rationale.
- [ ] If deferred, an alternative (e.g., README examples) is provided and documented.
- [ ] ADR-0008 or a new ADR records the decision.

## Tests and validation commands

```bash
# If trying Storybook locally:
npx sb init --type nextjs  # or --type react-vite
# Then verify:
npx nx build main  # ensure no regressions from storybook config
```

## Risks

- Storybook can add significant dev dependencies and config complexity.
- Next.js 16 + React 19 + Tailwind v4 may have unresolved Storybook compatibility issues.
- Storybook may interfere with the static-export build.

## Recommendation

**Defer Storybook.** The current project has 4 small, well-tested components being promoted. README-based examples with colocated tests provide sufficient documentation. Re-evaluate when the design system grows to 8+ components or when fork owners report confusion about component APIs.
