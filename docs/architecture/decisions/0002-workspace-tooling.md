# ADR-0002: Nx workspace tooling

- **Status:** Accepted — retain Nx
- **Context:** The repository is a single Next.js website with five internal content/UI libraries (`content`, `navigation`, `projects`, `publications`, `utils`). Nx was introduced during project scaffolding. The question was whether to retain Nx or simplify to a conventional Next.js project with npm scripts.
- **Decision:** Retain Nx 22.6.5.
- **Evidence supporting retention:**
  - **Dependency-aware typecheck:** `main:build` has `"dependsOn": ["^typecheck"]`, meaning all library type-checking runs before the app builds. Without Nx, this would require manual scripting in `package.json`.
  - **Project-aware targets:** Each library has `typecheck`, `lint`, and `test` targets discovered automatically by `@nx/js`, `@nx/eslint`, and `@nx/vitest` plugins.
  - **Local task orchestration:** `npx nx run-many -t lint test typecheck build` runs all checks across all projects in dependency order, with parallel execution where possible.
  - **TypeScript project references:** Libraries reference each other via `tsconfig.lib.json` files (e.g., `projects` depends on `content`). Nx's `@nx/js/typescript` plugin generates and maintains `build-deps`/`watch-deps` targets.
- **Costs acknowledged:**
  - Nx Cloud is disconnected (not connected within 72 hours), so distributed caching is unavailable. Local cache still works.
  - `@nx/web` and `@nx/rollup` were installed but never used — removed in this modernization pass.
  - **Module boundary enforcement is now active:** `@nx/enforce-module-boundaries` uses meaningful `depConstraints` based on project tags defined in each library's `package.json`:
    - `app` (apps/main) -> can depend on `content-layer` and `foundation`
    - `content-layer` (projects, publications) -> can depend on `foundation`
    - `foundation` (content, navigation, utils) -> cannot depend on any internal library
      This enforces the dependency layers: app -> content-layer -> foundation -> external.
  - Nx adds ~150MB of dev dependencies to `node_modules`.
- **Alternatives considered:**
  - **Remove Nx:** Would require replacing the `typecheck` dependency chain, module-boundary enforcement, and project-aware test/lint targets with manual npm scripts. Estimated effort: 3–4 scripts with careful dependency ordering, plus ESLint boundary configuration written from scratch.
- **Consequences and trade-offs:**
  - Nx adds ~150MB of dev dependencies to `node_modules`.
  - The `nx.json` plugin list must be maintained as Nx evolves.
  - Future Nx major versions will require migration testing.
- **Conditions for revisiting:** If the project grows to a single app with zero libraries, or if Nx upgrade maintenance burden exceeds the value of module-boundary enforcement and dependency-aware builds.
