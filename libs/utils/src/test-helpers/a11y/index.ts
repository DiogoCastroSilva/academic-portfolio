/// <reference lib="dom" />

import { axe } from "vitest-axe";

/**
 * Shared accessibility testing helper for Vitest + vitest-axe.
 *
 * Runs axe on a container and asserts that no accessibility violations
 * are found. If violations are found, throws a descriptive error.
 *
 * @example
 * ```ts
 * import { expectNoA11yViolations } from "@katie-portfolio/utils/test-helpers/a11y";
 *
 * const { container } = render(<MyComponent />);
 * await expectNoA11yViolations(container);
 * ```
 */
export async function expectNoA11yViolations(
  container: Element,
): Promise<void> {
  const results = await axe(container);

  if (results.violations.length > 0) {
    const violationMessages = results.violations.map((violation) => {
      const nodeMessages = violation.nodes
        .map((node) => `  Node: ${node.html}\n    ${node.failureSummary}`)
        .join("\n");

      return `${violation.help} (${violation.id})\n${nodeMessages}`;
    });

    throw new Error(
      `Accessibility violations found:\n${violationMessages.join("\n\n")}`,
    );
  }
}
