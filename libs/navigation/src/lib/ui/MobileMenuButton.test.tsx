/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { MobileMenuButton } from "./MobileMenuButton.js";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("MobileMenuButton accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("has no accessibility violations when menu is closed", async () => {
    const onToggleMenu = vi.fn();
    const { container } = render(
      <MobileMenuButton isMenuOpen={false} onToggleMenu={onToggleMenu} />,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("has no accessibility violations when menu is open", async () => {
    const onToggleMenu = vi.fn();
    // The MobileMenuButton references aria-controls="mobile-navigation"
    // which is rendered by the parent NavBar component.
    // In isolation, we provide the target element so axe doesn't flag it.
    const { container } = render(
      <div>
        <div id="mobile-navigation" hidden={false} />
        <MobileMenuButton isMenuOpen={true} onToggleMenu={onToggleMenu} />
      </div>,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("has correct aria-expanded and aria-controls attributes", () => {
    const onToggleMenu = vi.fn();
    render(<MobileMenuButton isMenuOpen={false} onToggleMenu={onToggleMenu} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "mobile-navigation");
  });

  it("updates aria-expanded when menu opens", () => {
    const onToggleMenu = vi.fn();
    render(<MobileMenuButton isMenuOpen={true} onToggleMenu={onToggleMenu} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("has accessible label for screen readers", () => {
    const onToggleMenu = vi.fn();
    render(<MobileMenuButton isMenuOpen={false} onToggleMenu={onToggleMenu} />);

    const srOnly = screen.getByText("Open main menu");
    expect(srOnly).toBeInTheDocument();
  });
});
