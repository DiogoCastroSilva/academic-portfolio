/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, vi } from "vitest";

import { expectNoA11yViolations } from "../test-utils/index.js";

import { NavBar } from "./NavBar.js";

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

describe("NavBar accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<NavBar currentPath="/" />);
    await expectNoA11yViolations(container);
  });

  it("has no violations with active /projects path", async () => {
    const { container } = render(<NavBar currentPath="/projects" />);
    await expectNoA11yViolations(container);
  });

  it("has no violations when mobile menu is open", async () => {
    const { container } = render(<NavBar currentPath="/" />);
    const menuButton = screen.getByRole("button");
    fireEvent.click(menuButton);

    await expectNoA11yViolations(container);
  });
});
