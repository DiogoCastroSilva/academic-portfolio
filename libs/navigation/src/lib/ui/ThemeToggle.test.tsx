/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import {
  cleanup,
  fireEvent,
  act,
  render,
  screen,
} from "@testing-library/react";
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

  it("shows sun icon (opacity-100) and hides moon icon (opacity-0) when resolved theme is light", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { container } = render(<ThemeToggle />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(2);

    // Sun icon has a <circle> element, moon icon has only <path>s
    const sunIcon = Array.from(svgs).find(
      (svg) => svg.querySelector("circle") !== null,
    );
    const moonIcon = Array.from(svgs).find(
      (svg) => svg.querySelector("circle") === null,
    );

    expect(sunIcon).toBeDefined();
    expect(sunIcon!.className).toMatch(/opacity-100/);

    expect(moonIcon).toBeDefined();
    expect(moonIcon!.className).toMatch(/opacity-0/);
  });

  it("shows moon icon (opacity-100) and hides sun icon (opacity-0) when resolved theme is dark", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const { container } = render(<ThemeToggle />);
    // The moon icon SVG should be rendered (present in the DOM)
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(2);

    // Sun icon has a <circle> element, moon icon has only <path>s
    const sunIcon = Array.from(svgs).find(
      (svg) => svg.querySelector("circle") !== null,
    );
    const moonIcon = Array.from(svgs).find(
      (svg) => svg.querySelector("circle") === null,
    );

    expect(sunIcon).toBeDefined();
    expect(sunIcon!.className).toMatch(/opacity-0/);

    expect(moonIcon).toBeDefined();
    expect(moonIcon!.className).toMatch(/opacity-100/);

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

  it("has cursor-pointer for hover affordance", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button.className).toMatch(/cursor-pointer/);
  });

  it("applies data-theme attribute synchronously on toggle (before re-render)", () => {
    // Verify that clicking the toggle sets the data-theme attribute immediately,
    // without waiting for the React re-render to complete.
    render(<ThemeToggle />);
    const button = screen.getByRole("button");

    // Default preference is "system" → resolves to "light" (OS light in test)
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    fireEvent.click(button);
    // system → light, but system prefers light in tests, so it stays "light"
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    fireEvent.click(button);
    // light → dark
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("cycles through all three preferences on rapid clicks", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");

    // Rapid clicks: system → light → dark → system
    // All within a single act() — simulates rapid clicking
    act(() => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("button remains clickable (not disabled) after rapid toggles", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");

    act(() => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    expect(button).not.toBeDisabled();

    // Button should still work after rapid clicks
    act(() => {
      fireEvent.click(button);
    });
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
