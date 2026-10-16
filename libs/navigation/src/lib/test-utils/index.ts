/**
 * Shared test utilities for the navigation library.
 * Includes a11y testing helpers for use across navigation component tests.
 */

/**
 * Asserts that axe finds no accessibility violations in the given container.
 * Throws a descriptive error with details if violations are found.
 *
 * This replaces the repeated `expect(results.violations).toHaveLength(0)`
 * pattern across navigation test files.
 *
 * @example
 * ```ts
 * const { container } = render(<MyComponent />);
 * await expectNoA11yViolations(container);
 * ```
 */
export async function expectNoA11yViolations(
  container: Element,
): Promise<void> {
  const { axe } = await import("vitest-axe");

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
