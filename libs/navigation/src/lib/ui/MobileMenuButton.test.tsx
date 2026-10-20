/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../test-utils/index.js";

import { MobileMenuButton } from "./MobileMenuButton.js";

describe("MobileMenuButton accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("has no accessibility violations when menu is closed", async () => {
    const onToggleMenu = vi.fn();
    const { container } = render(
      <MobileMenuButton isMenuOpen={false} onToggleMenu={onToggleMenu} />,
    );
    await expectNoA11yViolations(container);
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
    await expectNoA11yViolations(container);
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

  it("uses a 44-pixel square interaction target", () => {
    const onToggleMenu = vi.fn();
    render(<MobileMenuButton isMenuOpen={false} onToggleMenu={onToggleMenu} />);

    expect(screen.getByRole("button").className).toContain("size-11");
  });

  it("has accessible label for screen readers", () => {
    const onToggleMenu = vi.fn();
    render(<MobileMenuButton isMenuOpen={false} onToggleMenu={onToggleMenu} />);

    const srOnly = screen.getByText("Open main menu");
    expect(srOnly).toBeInTheDocument();
  });
});
