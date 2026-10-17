/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockNextLink } from "./index.js";

// A test component that uses next/link mock
function TestLink({ href, children, ...rest }: Record<string, unknown>) {
  const Link = mockNextLink.default;
  return React.createElement(
    Link,
    { href, ...rest } as Record<string, unknown>,
    children,
  );
}

describe("mockNextLink", () => {
  it("renders an <a> element", () => {
    render(<TestLink href="/test">Test Link</TestLink>);
    const link = screen.getByRole("link", { name: "Test Link" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });

  it("forwards href to the <a> element", () => {
    render(<TestLink href="/my-page">My Page</TestLink>);
    const link = screen.getByRole("link", { name: "My Page" });
    expect(link).toHaveAttribute("href", "/my-page");
  });

  it("forwards arbitrary props including aria attributes", () => {
    render(
      <TestLink href="/page" aria-label="Skip to content" className="nav-link">
        Skip
      </TestLink>,
    );
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("aria-label", "Skip to content");
    expect(link).toHaveClass("nav-link");
  });

  it("renders children correctly", () => {
    render(
      <TestLink href="/page">
        <span>Nested child</span>
      </TestLink>,
    );
    expect(screen.getByText("Nested child")).toBeInTheDocument();
  });

  it("does not pass through Next.js Link-specific props", () => {
    render(
      <TestLink href="/page" legacyBehavior replace>
        Test
      </TestLink>,
    );
    const link = screen.getByRole("link", { name: "Test" });
    // Should not have legacyBehavior or replace on the <a> element
    expect(link).not.toHaveAttribute("legacybehavior");
    expect(link).not.toHaveAttribute("replace");
  });
});
