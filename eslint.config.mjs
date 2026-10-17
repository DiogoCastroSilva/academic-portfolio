import sharedConfig from "@diogozx-org/eslint-config/next";
import nx from "@nx/eslint-plugin";

/**
 * ESLint flat config.
 *
 * Composes the shared @diogozx-org/eslint-config/next preset
 * (TypeScript, React, Next.js Core Web Vitals, JSX a11y,
 * React Hooks, and Prettier integration) with Nx module-boundary
 * enforcement for this monorepo's internal packages.
 */
export default [
  ...sharedConfig,
  {
    ignores: [
      "**/dist/**",
      "**/vite.config.*.timestamp*",
      "**/vitest.config.*.timestamp*",
    ],
  },
  // Nx module-boundary rules with meaningful layer enforcement:
  //   app (apps/main)           -> depends on content-layer + foundation
  //   content-layer (projects,  -> depends on foundation
  //     publications)
  //   foundation (content,     -> no internal library dependencies
  //     navigation, utils)
  // The rest of Nx's base configs are intentionally omitted to avoid
  // conflicts with the shared config's TypeScript rules.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      "@nx": nx,
    },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: false,
          allow: [
            "^.*/eslint(\\.(base)?)?\\.config\\.[cm]?[jt]s$",
            "^.*/test-setup\\.[jt]s$",
          ],
          depConstraints: [
            {
              sourceTag: "app",
              onlyDependOnLibsWithTags: ["content-layer", "foundation"],
            },
            {
              sourceTag: "content-layer",
              onlyDependOnLibsWithTags: ["foundation"],
            },
            {
              sourceTag: "foundation",
              onlyDependOnLibsWithTags: [],
            },
          ],
        },
      ],
    },
  },
];
