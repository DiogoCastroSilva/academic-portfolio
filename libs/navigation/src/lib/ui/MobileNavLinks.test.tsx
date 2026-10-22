/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../test-utils/index.js";
import { baseNavigation } from "../feature/config.js";

import { MobileNavLinks } from "./MobileNavLinks.js";

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
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations when menu is closed", async () => {
    const { container } = render(
      <MobileNavLinks isMenuOpen={false} currentPath="/" />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no violations with active path", async () => {
    const { container } = render(
      <MobileNavLinks isMenuOpen={true} currentPath="/projects" />,
    );
    await expectNoA11yViolations(container);
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
    await expectNoA11yViolations(container);
  });

  it("renders all navigation items when menu is open", () => {
    render(<MobileNavLinks isMenuOpen={true} currentPath="/" />);

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Publications")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("hides Blog when items prop excludes it", () => {
    render(
      <MobileNavLinks
        isMenuOpen={true}
        currentPath="/"
        items={baseNavigation}
      />,
    );

    expect(screen.queryByText("Blog")).not.toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
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

  it("marks Projects active on /projects detail route", () => {
    render(
      <MobileNavLinks
        isMenuOpen={true}
        currentPath="/projects/example-project"
      />,
    );

    const projectsLink = screen.getByText("Projects");
    expect(projectsLink).toHaveAttribute("aria-current", "page");
  });

  it("marks Blog active on /blog detail route", () => {
    render(<MobileNavLinks isMenuOpen={true} currentPath="/blog/my-post" />);

    const blogLink = screen.getByText("Blog");
    expect(blogLink).toHaveAttribute("aria-current", "page");
  });

  it("does not mark Projects active on /projects-archive route", () => {
    render(
      <MobileNavLinks isMenuOpen={true} currentPath="/projects-archive" />,
    );

    const projectsLink = screen.getByText("Projects");
    expect(projectsLink).not.toHaveAttribute("aria-current");
  });

  // ---------------------------------------------------------------------------
  // Phase 3: Active indicator visibility
  // ---------------------------------------------------------------------------

  it("active indicator uses visible border color (not border-white)", () => {
    render(<MobileNavLinks isMenuOpen={true} currentPath="/projects" />);

    const projectsLink = screen.getByText("Projects");
    expect(projectsLink).toHaveAttribute("aria-current", "page");
    const className = projectsLink.getAttribute("class") || "";
    // White border is invisible on light backgrounds in light mode
    expect(className).toMatch(/aria-current\/page:border-sky-600/);
    expect(className).not.toMatch(/aria-current\/page:border-white/);
  });

  // ---------------------------------------------------------------------------
  // ThemeToggle integration
  // ---------------------------------------------------------------------------

  it("renders ThemeToggle button inside mobile menu when open", () => {
    render(<MobileNavLinks isMenuOpen={true} currentPath="/" />);
    const themeButton = screen.getByRole("button", { name: /Theme:/i });
    expect(themeButton).toBeInTheDocument();
  });

  it("ThemeToggle is in the DOM (hidden) when mobile menu is closed", () => {
    const { container } = render(
      <MobileNavLinks isMenuOpen={false} currentPath="/" />,
    );
    const mobileNav = document.getElementById("mobile-navigation");
    expect(mobileNav).toHaveAttribute("hidden");
    // The ThemeToggle button should still be in the DOM, just hidden
    const themeButton = container.querySelector('button[aria-label*="Theme"]');
    expect(themeButton).not.toBeNull();
  });

  it("does not duplicate ThemeToggle (one copy in mobile menu)", () => {
    render(<MobileNavLinks isMenuOpen={true} currentPath="/" />);
    const themeButtons = screen.getAllByRole("button", { name: /Theme:/i });
    // Only the mobile copy should be found (desktop copy lives in NavBar, not here)
    expect(themeButtons).toHaveLength(1);
  });
});
