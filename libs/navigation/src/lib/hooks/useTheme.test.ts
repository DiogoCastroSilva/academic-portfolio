/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_STORAGE_KEY, resolvePreference, useTheme } from "./useTheme.js";

import { renderHook, act } from "@testing-library/react";

describe("resolvePreference", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 'light' for 'light' preference", () => {
    expect(resolvePreference("light")).toBe("light");
  });

  it("returns 'dark' for 'dark' preference", () => {
    expect(resolvePreference("dark")).toBe("dark");
  });

  it("returns 'light' for 'system' when OS prefers light", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as MediaQueryList);
    expect(resolvePreference("system")).toBe("light");
  });

  it("returns 'dark' for 'system' when OS prefers dark", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    expect(resolvePreference("system")).toBe("dark");
  });
});

describe("useTheme hook", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    // Ensure matchMedia mock is present (vi.restoreAllMocks may have cleared
    // spies set up by the resolvePreference describe block)
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as MediaQueryList);
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns 'system' preference when nothing is stored", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("system");
  });

  it("returns stored 'dark' preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("dark");
  });

  it("returns stored 'light' preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("light");
  });

  it("resolves 'dark' preference to dark theme", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("resolves 'light' preference to light theme", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("resolves 'system' to dark when OS prefers dark", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("setTheme persists to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("setTheme updates resolvedTheme immediately", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe("light");
    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("setTheme sets data-theme attribute on documentElement", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("toggleTheme cycles system → light → dark → system", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe("system");

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.preference).toBe("light");

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.preference).toBe("dark");

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.preference).toBe("system");
  });

  it("mounted is true after mount", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.mounted).toBe(true);
  });

  it("updates when another tab writes to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("system");

    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    act(() => {
      window.dispatchEvent(new Event("storage"));
    });

    expect(result.current.preference).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("updates when themechange event is dispatched", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.preference).toBe("dark");

    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    act(() => {
      window.dispatchEvent(new Event("themechange"));
    });

    expect(result.current.preference).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });
});
