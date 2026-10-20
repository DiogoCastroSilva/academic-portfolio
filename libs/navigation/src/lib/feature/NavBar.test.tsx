/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../test-utils/index.js";
import { baseNavigation } from "./config.js";
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

  it("hides Blog when items prop excludes it", () => {
    render(<NavBar currentPath="/" items={baseNavigation} />);

    expect(screen.queryAllByText("Blog")).toHaveLength(0);
    expect(screen.getAllByText("Projects")).toHaveLength(2);
    expect(screen.getAllByText("Publications")).toHaveLength(2);
    expect(screen.getAllByText("About")).toHaveLength(2);
  });

  it("shows Blog by default (items prop omitted)", () => {
    render(<NavBar currentPath="/" />);

    expect(screen.getAllByText("Blog")).toHaveLength(2);
  });

  it("marks Projects active on /projects detail route", () => {
    render(<NavBar currentPath="/projects/example-project" />);
    const projectsLinks = screen.getAllByText("Projects");
    projectsLinks.forEach((link) => {
      expect(link).toHaveAttribute("aria-current", "page");
    });
  });

  it("marks Blog active on /blog detail route", () => {
    render(<NavBar currentPath="/blog/my-post" />);
    const blogLinks = screen.getAllByText("Blog");
    blogLinks.forEach((link) => {
      expect(link).toHaveAttribute("aria-current", "page");
    });
  });

  it("does not mark Projects active on /projects-archive route", () => {
    render(<NavBar currentPath="/projects-archive" />);
    const projectsLinks = screen.getAllByText("Projects");
    projectsLinks.forEach((link) => {
      expect(link).not.toHaveAttribute("aria-current");
    });
  });

  // ---------------------------------------------------------------------------
  // Phase 3: Dark-mode active indicator visibility
  // ---------------------------------------------------------------------------

  it("active indicator uses visible border color (not white) for light mode", () => {
    render(<NavBar currentPath="/projects" />);
    const projectsLinks = screen.getAllByText("Projects");
    projectsLinks.forEach((link) => {
      expect(link).toHaveAttribute("aria-current", "page");
      const className = link.getAttribute("class") || "";
      // Must use a visible accent color (sky-600 per design principles),
      // not border-white which is invisible on light backgrounds
      expect(className).toMatch(/aria-current\/page:border-sky-600/);
      expect(className).not.toMatch(/aria-current\/page:border-white/);
    });
  });

  it("brand link active indicator uses visible border color", () => {
    render(<NavBar currentPath="/" name="Test Portfolio" />);
    const homeLink = screen.getByText("Test Portfolio");
    expect(homeLink).toHaveAttribute("aria-current", "page");
    const className = homeLink.getAttribute("class") || "";
    expect(className).toMatch(/aria-current\/page:border-sky-600/);
  });
});
