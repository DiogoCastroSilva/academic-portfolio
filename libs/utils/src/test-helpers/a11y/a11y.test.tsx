/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "./index.js";

// A simple component with no accessibility issues
function AccessibleComponent() {
  return (
    <div>
      <h1>Accessible Heading</h1>
      <p>Some content text</p>
      <a href="#main">Skip to main</a>
    </div>
  );
}

// A component with accessibility violations
function InaccessibleComponent() {
  return (
    <div>
      <img src="/test.jpg" />
      <button />
    </div>
  );
}

describe("expectNoA11yViolations (utils)", () => {
  it("passes when no violations are found", async () => {
    const { container } = render(<AccessibleComponent />);
    await expectNoA11yViolations(container);
  });

  it("throws with descriptive error when violations are found", async () => {
    const { container } = render(<InaccessibleComponent />);

    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      "Accessibility violations found:",
    );
  });

  it("throws error includes violation id and help text", async () => {
    const { container } = render(<InaccessibleComponent />);

    try {
      await expectNoA11yViolations(container);
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain("Accessibility violations found:");
      expect(message).toMatch(/(image-alt|button-name|nested-interactive)/);
    }
  });
});
