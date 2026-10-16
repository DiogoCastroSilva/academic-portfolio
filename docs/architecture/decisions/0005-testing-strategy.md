# ADR-0005: Testing strategy

- **Status:** Accepted
- **Context:** The project needs a unit-testing framework for content-processing logic (frontmatter parsing, image resolution, link rewriting, DEPLOYMENT_URL handling). An older version of the project used Jest alongside Vitest, creating redundancy.
- **Decision:** Use **Vitest 4.x** as the sole unit-test framework. Remove all Jest-related configuration and dependencies.
- **Alternatives considered:**
  - **Jest:** Already removed. Would add a separate test runner, additional configuration, and duplicate coverage tooling.
  - **React Testing Library + Vitest:** `@testing-library/react` was installed but never imported in any test. Removed. If component-level testing becomes necessary, it can be added as a targeted dev dependency.
- **Consequences and trade-offs:**
  - Vitest runs via `npx nx run-many --target=test` across all library projects that have a `vitest.config.*` file.
  - The `passWithNoTests` pattern is not used — projects without tests (e.g., `projects`, `publications`, `utils` libraries) do not register a `test` target, so they are simply skipped by `run-many`.
  - `@vitest/ui` and `@vitest/coverage-v8` are retained; `@vitest/ui` was removed (not used in CI) and coverage remains configured per-project.
- **Evidence or validation:**
  - `libs/content` has 44 tests covering all content-processing scenarios.
  - `libs/navigation` has 4 tests validating the navigation configuration.
  - All tests pass: `npx nx run-many --target=test --all`.
- **Conditions for revisiting:** If browser-level integration testing is needed (e.g., for the mobile navigation toggle or ContentDetail rendering), a Playwright or Vitest Browser mode setup can be added.
