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
  // Nx module-boundary rules — only the enforce-module-boundaries rule
  // is layered on top; the rest of Nx's base configs are intentionally
  // omitted to avoid conflicts with the shared config's TypeScript rules.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      "@nx": nx,
    },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\\\.base)?\\\\.config\\\\.[cm]?[jt]s$"],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
    },
  },
];
