/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";

import { Tag } from "./Tag.js";

describe("Tag", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a <span> with the provided children", () => {
    render(<Tag>TypeScript</Tag>);
    const tag = screen.getByText("TypeScript");
    expect(tag.tagName).toBe("SPAN");
    expect(tag).toHaveTextContent("TypeScript");
  });

  it("applies default size (md) and variant (default) classes", () => {
    const { container } = render(<Tag>React</Tag>);
    const span = container.querySelector("span");
    // Size: md → px-3 py-1 text-sm
    expect(span).toHaveClass("px-3");
    expect(span).toHaveClass("py-1");
    expect(span).toHaveClass("text-sm");
    // Variant: default → border + text-secondary + rounded-full
    expect(span).toHaveClass("border-border");
    expect(span).toHaveClass("text-text-secondary");
    expect(span).toHaveClass("rounded-full");
  });

  it('applies compact size (sm) classes when size="sm"', () => {
    const { container } = render(<Tag size="sm">Vue</Tag>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("px-2.5");
    expect(span).toHaveClass("text-xs");
    // Should NOT have md classes
    expect(span).not.toHaveClass("px-3");
  });

  it('applies warning variant classes when variant="warning"', () => {
    const { container } = render(<Tag variant="warning">Featured</Tag>);
    const span = container.querySelector("span");
    // Warning variant: amber status tokens
    expect(span).toHaveClass("bg-status-warning-bg");
    expect(span).toHaveClass("text-status-warning-text");
    // Should NOT have default variant border classes
    expect(span).not.toHaveClass("border-border");
  });

  it('applies default variant classes when variant="default"', () => {
    const { container } = render(<Tag variant="default">TypeScript</Tag>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("border-border");
    expect(span).toHaveClass("text-text-secondary");
    expect(span).toHaveClass("border");
  });

  it("applies custom className for layout alongside base classes", () => {
    const { container } = render(<Tag className="mt-1 ml-2">TypeScript</Tag>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("ml-2");
    expect(span).toHaveClass("mt-1");
    // Base classes still present
    expect(span).toHaveClass("rounded-full");
    expect(span).toHaveClass("text-text-secondary");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ul>
        <li>
          <Tag size="sm">TypeScript</Tag>
        </li>
        <li>
          <Tag size="sm" variant="warning">
            Featured
          </Tag>
        </li>
      </ul>,
    );
    await expectNoA11yViolations(container);
  });
});
