/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { MobileNavLinks } from "./MobileNavLinks.js";

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
    "aria-current"?:
      | "page"
      | "step"
      | "location"
      | "date"
      | "time"
      | "true"
      | "false"
      | boolean;
    className?: string;
    onClick?: () => void;
  }) {
    return (
      <a
        href={href}
        aria-current={ariaCurrent}
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  },
}));

describe("MobileNavLinks accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("has no accessibility violations when menu is open", async () => {
    const { container } = render(
      <MobileNavLinks isMenuOpen={true} currentPath="/" />,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("has no accessibility violations when menu is closed", async () => {
    const { container } = render(
      <MobileNavLinks isMenuOpen={false} currentPath="/" />,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("has no violations with active path", async () => {
    const { container } = render(
      <MobileNavLinks isMenuOpen={true} currentPath="/projects" />,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("has no violations when onNavigate is provided", async () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <MobileNavLinks
        isMenuOpen={true}
        currentPath="/"
        onNavigate={onNavigate}
      />,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("renders all navigation items when menu is open", () => {
    render(<MobileNavLinks isMenuOpen={true} currentPath="/" />);

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Publications")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("hides all navigation items when menu is closed", () => {
    render(<MobileNavLinks isMenuOpen={false} currentPath="/" />);

    const navContainer = document.getElementById("mobile-navigation");
    expect(navContainer).toHaveAttribute("hidden");
  });

  it("marks active path with aria-current page", () => {
    render(<MobileNavLinks isMenuOpen={true} currentPath="/projects" />);

    const projectsLink = screen.getByText("Projects");
    expect(projectsLink).toHaveAttribute("aria-current", "page");
  });

  it("does not mark non-active links with aria-current", () => {
    render(<MobileNavLinks isMenuOpen={true} currentPath="/projects" />);

    const aboutLink = screen.getByText("About");
    expect(aboutLink).not.toHaveAttribute("aria-current");
  });
});
