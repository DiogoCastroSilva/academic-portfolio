/**
 * Theme management hook for the academic-portfolio site.
 *
 * Provides a three-way theme toggle (System / Light / Dark) with persistence
 * to `localStorage` under the key `academic-portfolio-theme`.
 *
 * The resolved theme (actual `light` or `dark` applied to the document) is
 * computed from the stored preference, falling back to the OS-level
 * `prefers-color-scheme` media query when the preference is `"system"` or
 * when no preference has been stored yet.
 *
 * This hook is SSR-safe: it never accesses `window` or `localStorage` during
 * server-side rendering. The `mounted` flag becomes `true` only after the
 * component has mounted on the client.
 */
"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/** Available theme preferences stored in localStorage. */
export type ThemePreference = "system" | "light" | "dark";

/** The actual color scheme applied to the document. */
export type ResolvedTheme = "light" | "dark";

/** localStorage key for the persisted theme preference. */
export const THEME_STORAGE_KEY = "academic-portfolio-theme";

/** Default preference when nothing is stored in localStorage. */
const DEFAULT_PREFERENCE: ThemePreference = "system";

/** Events that should trigger a re-read of the theme preference. */
const STORAGE_EVENT = "storage";
const THEME_CHANGE_EVENT = "themechange";

// ---------------------------------------------------------------------------
// Browser helpers (guarded for SSR)
// ---------------------------------------------------------------------------

/** Detect the OS-level color-scheme preference. */
function detectSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

/** Read the stored preference from localStorage (SSR-safe). */
function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_PREFERENCE;
  }
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") {
      return raw;
    }
  } catch {
    // localStorage may throw in private mode or if disabled
  }
  return DEFAULT_PREFERENCE;
}

/** Persist the preference to localStorage (SSR-safe, ignores errors). */
function writeStoredPreference(preference: ThemePreference): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // ignore
  }
}

/** Apply the `data-theme` attribute to `<html>` based on the resolved theme. */
export function applyThemeAttribute(theme: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

/** Compute the resolved theme from a stored preference. */
export function resolvePreference(preference: ThemePreference): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return detectSystemTheme();
}

// ---------------------------------------------------------------------------
// External store (React 19 compatible)
// ---------------------------------------------------------------------------

function getSnapshot(): ThemePreference {
  return readStoredPreference();
}

function getServerSnapshot(): ThemePreference {
  return DEFAULT_PREFERENCE;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

// ---------------------------------------------------------------------------
// Public hook
// ---------------------------------------------------------------------------

export interface UseThemeResult {
  /** The current stored preference (may be "system"). */
  preference: ThemePreference;
  /** The actual color scheme applied (`"light"` or `"dark"`). */
  resolvedTheme: ResolvedTheme;
  /** True after the component has mounted on the client. */
  mounted: boolean;
  /** Update the theme preference and persist it. */
  setTheme: (preference: ThemePreference) => void;
  /** Cycle to the next preference: system → light → dark → system. */
  toggleTheme: () => void;
}

/**
 * Hook for reading and updating the site theme preference.
 *
 * Safe to call during SSR — returns the default preference and `mounted: false`
 * on the server. After hydration, `mounted` becomes `true` and the actual
 * stored preference is reflected.
 *
 * @example
 * ```tsx
 * const { preference, resolvedTheme, setTheme, mounted } = useTheme();
 * ```
 */
export function useTheme(): UseThemeResult {
  const preference = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Track whether the component has mounted on the client. Uses
  // useSyncExternalStore (same as `preference`) so that SSR returns false
  // and the client returns true — React handles the post-hydration sync
  // re-render automatically, without needing a setState call in an effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const resolvedTheme = resolvePreference(preference);

  useEffect(() => {
    // Apply the data-theme attribute as a fallback for when the inline
    // theme-init script was not present (e.g. test environments, or if
    // the script was somehow blocked). The inline script is the primary
    // mechanism to prevent FOUC; this ensures consistency after hydration.
    applyThemeAttribute(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    writeStoredPreference(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
    const resolved = resolvePreference(next);
    applyThemeAttribute(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemePreference =
      preference === "system"
        ? "light"
        : preference === "light"
          ? "dark"
          : "system";
    setTheme(next);
  }, [preference, setTheme]);

  return {
    preference,
    resolvedTheme,
    mounted,
    setTheme,
    toggleTheme,
  };
}
