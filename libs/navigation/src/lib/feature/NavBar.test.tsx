/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { axe } from "vitest-axe";

import { NavBar } from "./NavBar.js";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link for happy-dom environment
vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
    "aria-current": ariaCurrent,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    "aria-current"?: string;
    className?: string;
    onClick?: () => void;
  }) {
    return (
      <a
        href={href}
        aria-current={
          ariaCurrent as
            | undefined
            | "page"
            | "step"
            | "location"
            | "date"
            | "time"
            | true
            | "true"
        }
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  },
}));

// Custom matcher assertion helper
function expectNoViolations(results: { violations: unknown[] }) {
  expect(results.violations).toHaveLength(0);
}

describe("NavBar accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<NavBar currentPath="/" />);
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("has no violations with active /projects path", async () => {
    const { container } = render(<NavBar currentPath="/projects" />);
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("has no violations when mobile menu is open", async () => {
    const { container } = render(<NavBar currentPath="/" />);
    const menuButton = screen.getByRole("button");
    fireEvent.click(menuButton);

    const results = await axe(container);
    expectNoViolations(results);
  });
});
