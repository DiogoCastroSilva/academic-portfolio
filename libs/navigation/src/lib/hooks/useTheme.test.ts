/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  THEME_STORAGE_KEY,
  _resetInternalState,
  resolvePreference,
  useTheme,
} from "./useTheme.js";

import { renderHook, act } from "@testing-library/react";

/**
 * Create a controllable `matchMedia` mock for testing OS-level theme changes.
 * Returns a `triggerChange` helper to simulate the OS color-scheme preference
 * switching. The mock properly supports `addEventListener` / `removeEventListener`
 * so that `useTheme`'s media-query subscription works in tests.
 */
function createControllableMatchMedia(initialMatches = false) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches: initialMatches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: (
      event: string,
      listener: (e: MediaQueryListEvent) => void,
    ) => {
      if (event === "change") listeners.push(listener);
    },
    removeEventListener: (
      event: string,
      listener: (e: MediaQueryListEvent) => void,
    ) => {
      if (event === "change") {
        const idx = listeners.indexOf(listener);
        if (idx >= 0) listeners.splice(idx, 1);
      }
    },
    dispatchEvent: vi.fn(),
  };

  vi.spyOn(window, "matchMedia").mockImplementation(
    () => mql as unknown as MediaQueryList,
  );

  return {
    mql,
    triggerChange: (matches: boolean) => {
      mql.matches = matches;
      const event = { matches } as MediaQueryListEvent;
      listeners.forEach((l) => l(event));
    },
  };
}

/**
 * Replace `window.localStorage` with a storage object whose methods throw,
 * simulating private mode or quota errors. Returns a restore function.
 */
function makeLocalStorageThrow() {
  const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
  const throwingStorage = {
    getItem: vi.fn(() => {
      throw new Error("localStorage unavailable");
    }),
    setItem: vi.fn(() => {
      throw new Error("localStorage unavailable");
    }),
    removeItem: vi.fn(() => {
      throw new Error("localStorage unavailable");
    }),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  } as unknown as Storage;
  Object.defineProperty(window, "localStorage", {
    value: throwingStorage,
    writable: true,
    configurable: true,
  });
  return () => {
    if (descriptor) {
      Object.defineProperty(window, "localStorage", descriptor);
    }
  };
}

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
    _resetInternalState();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    _resetInternalState();
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

  // ---------------------------------------------------------------------------
  // OS-level color-scheme changes (live subscription via matchMedia)
  // ---------------------------------------------------------------------------

  describe("OS-level color-scheme changes", () => {
    it("updates resolved theme when OS switches to dark while in system mode", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "system");
      const { triggerChange } = createControllableMatchMedia(false);

      const { result } = renderHook(() => useTheme());
      expect(result.current.preference).toBe("system");
      expect(result.current.resolvedTheme).toBe("light");

      act(() => {
        triggerChange(true);
      });

      expect(result.current.resolvedTheme).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("updates resolved theme when OS switches to light while in system mode", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "system");
      const { triggerChange } = createControllableMatchMedia(true);

      const { result } = renderHook(() => useTheme());
      expect(result.current.resolvedTheme).toBe("dark");

      act(() => {
        triggerChange(false);
      });

      expect(result.current.resolvedTheme).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("does NOT override explicit light preference when OS changes to dark", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
      const { triggerChange } = createControllableMatchMedia(false);

      const { result } = renderHook(() => useTheme());
      expect(result.current.preference).toBe("light");
      expect(result.current.resolvedTheme).toBe("light");

      act(() => {
        triggerChange(true);
      });

      expect(result.current.preference).toBe("light");
      expect(result.current.resolvedTheme).toBe("light");
    });

    it("does NOT override explicit dark preference when OS changes to light", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
      const { triggerChange } = createControllableMatchMedia(true);

      const { result } = renderHook(() => useTheme());
      expect(result.current.preference).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");

      act(() => {
        triggerChange(false);
      });

      expect(result.current.preference).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });

    it("updates when OS changes while no preference is stored (defaults to system)", () => {
      const { triggerChange } = createControllableMatchMedia(false);

      const { result } = renderHook(() => useTheme());
      expect(result.current.preference).toBe("system");
      expect(result.current.resolvedTheme).toBe("light");

      act(() => {
        triggerChange(true);
      });

      expect(result.current.resolvedTheme).toBe("dark");
    });
  });

  // ---------------------------------------------------------------------------
  // localStorage unavailable (in-memory fallback)
  // ---------------------------------------------------------------------------

  describe("localStorage unavailable", () => {
    it("falls back to in-memory default when localStorage throws on read", () => {
      const restore = makeLocalStorageThrow();
      try {
        const { result } = renderHook(() => useTheme());
        expect(result.current.preference).toBe("system");
      } finally {
        restore();
      }
    });

    it("persists via in-memory fallback when setTheme is called", () => {
      const restore = makeLocalStorageThrow();
      try {
        const { result } = renderHook(() => useTheme());
        expect(result.current.preference).toBe("system");

        act(() => {
          result.current.setTheme("dark");
        });

        expect(result.current.preference).toBe("dark");
        expect(result.current.resolvedTheme).toBe("dark");
        expect(document.documentElement.getAttribute("data-theme")).toBe(
          "dark",
        );
      } finally {
        restore();
      }
    });

    it("persists via in-memory fallback across toggleTheme calls", () => {
      const restore = makeLocalStorageThrow();
      try {
        const { result } = renderHook(() => useTheme());

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
      } finally {
        restore();
      }
    });

    it("syncs in-memory state with localStorage when it becomes available again", () => {
      const restore = makeLocalStorageThrow();
      try {
        const { result } = renderHook(() => useTheme());
        act(() => {
          result.current.setTheme("dark");
        });
        expect(result.current.preference).toBe("dark");
      } finally {
        restore();
      }
      // localStorage is available again, but the value was never persisted.
      // readStoredPreference returns DEFAULT_PREFERENCE when localStorage is
      // available but the key is missing, syncing inMemoryPreference.
      const { result } = renderHook(() => useTheme());
      expect(result.current.preference).toBe("system");
    });
  });
});
