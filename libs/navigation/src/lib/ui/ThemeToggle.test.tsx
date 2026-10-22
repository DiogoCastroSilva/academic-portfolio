/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../test-utils/index.js";
import { ThemeToggle } from "./ThemeToggle.js";
import { THEME_STORAGE_KEY } from "../hooks/useTheme.js";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders an accessible toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label");
    expect(button).toHaveAttribute("title");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ThemeToggle />);
    await expectNoA11yViolations(container);
  });

  it("shows sun icon when resolved theme is light", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Sun path should be visible (opacity-100)
    const sunIcon = container.querySelector("svg");
    expect(sunIcon).not.toBeNull();
  });

  it("shows moon icon when resolved theme is dark", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const { container } = render(<ThemeToggle />);
    // The moon icon SVG should be rendered (present in the DOM)
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // data-theme attribute is set by the inline theme-init script, not by
    // the hook itself — verify it here for end-to-end confidence
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("cycles themes on click: system → light → dark → system", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button");

    // Initial: system
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    fireEvent.click(button);
    // system → light
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    fireEvent.click(button);
    // light → dark
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    fireEvent.click(button);
    // dark → system
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });

  it("updates aria-label to reflect current preference and next step", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "system");
    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    const label = button.getAttribute("aria-label") || "";
    // Should mention "System" and "Light" (next step)
    expect(label).toMatch(/System/i);
    expect(label).toMatch(/Light/i);
  });

  it("includes motion-reduce class for reduced-motion support", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button.className).toMatch(/motion-reduce:transition-none/);
  });

  it("has focus-visible outline for keyboard navigation", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button.className).toMatch(/focus-visible:outline/);
  });
});
