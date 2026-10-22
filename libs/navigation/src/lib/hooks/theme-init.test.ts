/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_STORAGE_KEY } from "./useTheme.js";
import { themeInitScript } from "./theme-init.js";

/**
 * Execute the inline `themeInitScript` string as JavaScript.
 *
 * The script is a self-executing IIFE, so `new Function(themeInitScript)`
 * creates a function whose body is the IIFE. Calling it runs the script
 * exactly as it would run in `<head>` before first paint.
 */
function runThemeInitScript(): void {
  const fn = new Function(themeInitScript);
  fn();
}

describe("themeInitScript", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.restoreAllMocks();
    // Provide a matchMedia mock that defaults to "light"
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as MediaQueryList);
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.restoreAllMocks();
  });

  it("sets data-theme from a stored preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    runThemeInitScript();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("sets data-theme to light from a stored preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    runThemeInitScript();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("falls back to system theme (light) when no preference is stored", () => {
    runThemeInitScript();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("falls back to system theme (dark) when no preference stored and OS prefers dark", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    runThemeInitScript();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("ignores invalid stored values and falls back to system theme", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "invalid");
    runThemeInitScript();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("falls back to system theme when localStorage throws", () => {
    // Replace localStorage with a throwing mock
    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    const throwingStorage = {
      getItem: vi.fn(() => {
        throw new Error("localStorage unavailable");
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } as unknown as Storage;
    Object.defineProperty(window, "localStorage", {
      value: throwingStorage,
      writable: true,
      configurable: true,
    });

    try {
      runThemeInitScript();
      // matchMedia default is "light"
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    } finally {
      if (descriptor) {
        Object.defineProperty(window, "localStorage", descriptor);
      }
    }
  });

  it("is a non-empty string suitable for inline injection", () => {
    expect(typeof themeInitScript).toBe("string");
    expect(themeInitScript.length).toBeGreaterThan(0);
    // Should be a self-executing IIFE
    expect(themeInitScript.trim()).toMatch(/^\(function\s*\(/);
  });
});
