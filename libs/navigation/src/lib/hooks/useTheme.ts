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
 * When the preference is `"system"`, the hook subscribes to live OS-level
 * color-scheme changes via `matchMedia('(prefers-color-scheme: dark)')`.
 * This means the applied theme updates without a page reload when the user
 * changes their OS theme — but only while in system mode. Explicit `light`
 * or `dark` preferences are never overridden by OS changes.
 *
 * This hook is SSR-safe: it never accesses `window` or `localStorage` during
 * server-side rendering. The `mounted` flag becomes `true` only after the
 * component has mounted on the client.
 *
 * If `localStorage` is unavailable or throws (e.g. private mode), an
 * in-memory fallback is used so theme switching still works for the current
 * page — preferences just don't persist across reloads.
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
const MEDIA_QUERY_EVENT = "change";

/**
 * In-memory fallback preference used when `localStorage` is unavailable
 * (throws in private mode, is disabled, or hits a quota error). This lets
 * the toggle still work for the current page — changes just don't persist
 * across reloads. Always synced with localStorage when it is available.
 */
let inMemoryPreference: ThemePreference = DEFAULT_PREFERENCE;

// ---------------------------------------------------------------------------
// Browser helpers (guarded for SSR)
// ---------------------------------------------------------------------------

/**
 * Detect the OS-level color-scheme preference.
 *
 * Returns `"dark"` when the `(prefers-color-scheme: dark)` media query
 * matches, otherwise `"light"`. Safe to call during SSR (returns `"light"`
 * when `window` is not available).
 *
 * @internal Exported for theme-init testing.
 */
export function detectSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

/**
 * Read the stored preference from localStorage (SSR-safe).
 *
 * When `localStorage` is available and contains a valid value, that value
 * is returned and the in-memory fallback is synced. When `localStorage` is
 * unavailable or throws, the in-memory fallback is returned instead.
 *
 * @internal Exported for test suites that need to verify read behavior.
 */
export function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined" || !window.localStorage) {
    return inMemoryPreference;
  }
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") {
      inMemoryPreference = raw;
      return raw;
    }
    // localStorage is available but no valid value is stored:
    // the in-memory fallback is only consulted when localStorage
    // itself is unavailable, so return the default here.
    return DEFAULT_PREFERENCE;
  } catch {
    // localStorage may throw in private mode or if disabled
    return inMemoryPreference;
  }
}

/**
 * Persist the preference to localStorage (SSR-safe, ignores errors).
 *
 * The in-memory fallback is always updated, so that if localStorage becomes
 * unavailable later (or was never available), the most recent preference
 * is still tracked for the current page.
 */
function writeStoredPreference(preference: ThemePreference): void {
  inMemoryPreference = preference;
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // localStorage may throw in private mode or if disabled;
    // the in-memory fallback already captured the value
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

/**
 * Composite snapshot returned by the external store. Including `systemTheme`
 * allows `useSyncExternalStore` to detect OS-level color-scheme changes
 * (via the matchMedia listener in `subscribe`) and trigger re-renders —
 * even when the stored *preference* stays `"system"`.
 */
interface ThemeSnapshot {
  preference: ThemePreference;
  systemTheme: ResolvedTheme;
}

/** Stable server snapshot (never changes reference). */
const SERVER_SNAPSHOT: ThemeSnapshot = Object.freeze({
  preference: DEFAULT_PREFERENCE,
  systemTheme: "light",
});

/**
 * Cached client snapshot for referential stability.
 *
 * `useSyncExternalStore` uses `Object.is` to compare snapshots between
 * renders — returning a new object each call would cause infinite re-renders.
 * This cache is always validated against fresh reads, so it is safe to
 * share across hook instances.
 */
let cachedSnapshot: ThemeSnapshot | null = null;

function getSnapshot(): ThemeSnapshot {
  const pref = readStoredPreference();
  const sys = detectSystemTheme();
  if (
    cachedSnapshot &&
    cachedSnapshot.preference === pref &&
    cachedSnapshot.systemTheme === sys
  ) {
    return cachedSnapshot;
  }
  cachedSnapshot = { preference: pref, systemTheme: sys };
  return cachedSnapshot;
}

function getServerSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

/**
 * Subscribe to theme changes:
 * - `storage` events (cross-tab writes)
 * - `themechange` custom events (same-tab writes via setTheme)
 * - `prefers-color-scheme` media query `change` events (OS-level)
 *
 * The media query listener only fires the callback when the stored
 * preference is `"system"`, so explicit `light`/`dark` preferences are
 * never overridden by OS-level changes.
 */
function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);

  let cleanupMediaQuery: (() => void) | undefined;

  const mediaQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : undefined;

  if (mediaQuery) {
    const mediaListener = (): void => {
      // Only trigger a re-check when the stored preference is "system".
      // Explicit light/dark preferences should NOT be overridden by OS changes.
      if (readStoredPreference() === "system") {
        callback();
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener(MEDIA_QUERY_EVENT, mediaListener);
      cleanupMediaQuery = () => {
        mediaQuery.removeEventListener(MEDIA_QUERY_EVENT, mediaListener);
      };
    } else if (typeof mediaQuery.addListener === "function") {
      // Legacy addListener/removeListener (older Safari / some happy-dom versions)
      mediaQuery.addListener(mediaListener as (e: MediaQueryListEvent) => void);
      cleanupMediaQuery = () => {
        mediaQuery.removeListener(
          mediaListener as (e: MediaQueryListEvent) => void,
        );
      };
    }
  }

  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    cleanupMediaQuery?.();
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
 * When the preference is `"system"`, OS-level color scheme changes are
 * subscribed to live — the applied theme updates without a page reload.
 * Explicit `light`/`dark` preferences are never overridden by OS changes.
 *
 * If `localStorage` is unavailable, an in-memory fallback keeps the toggle
 * functional for the current page.
 *
 * @example
 * ```tsx
 * const { preference, resolvedTheme, setTheme, mounted } = useTheme();
 * ```
 */
export function useTheme(): UseThemeResult {
  const snapshot = useSyncExternalStore(
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

  const { preference, systemTheme } = snapshot;

  // Compute resolvedTheme from the snapshot's systemTheme to avoid a second
  // matchMedia call (detectSystemTheme was already called in getSnapshot).
  const resolvedTheme =
    preference === "light"
      ? "light"
      : preference === "dark"
        ? "dark"
        : systemTheme;

  useEffect(() => {
    // Apply the data-theme attribute as a fallback for when the inline
    // theme-init script was not present (e.g. test environments, or if
    // the script was somehow blocked). The inline script is the primary
    // mechanism to prevent FOUC; this ensures consistency after hydration.
    applyThemeAttribute(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    writeStoredPreference(next);
    const resolved = resolvePreference(next);
    /* Apply the DOM attribute synchronously *before* dispatching the notification
     * event. This ensures the theme visually changes instantly on the next
     * microtask, rather than waiting for any React re-render work triggered by
     * the `useSyncExternalStore` notification. The re-render then reconciles
     * component state to match (idempotent). */
    applyThemeAttribute(resolved);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
  }, []);

  /**
   * Cycle to the next preference: system → light → dark → system.
   *
   * Reads the latest preference directly from `readStoredPreference()` (synchronous
   * localStorage / in-memory fallback) rather than from the React snapshot closure.
   * This ensures that rapid successive clicks — before React has had a chance to
   * flush a re-render — still advance the cycle correctly. Without this, the
   * callback would capture a stale `preference` value from the last render and
   * multiple clicks could collapse to the same preference.
   */
  const toggleTheme = useCallback(() => {
    const current = readStoredPreference();
    const next: ThemePreference =
      current === "system" ? "light" : current === "light" ? "dark" : "system";
    setTheme(next);
  }, [setTheme]);

  return {
    preference,
    resolvedTheme,
    mounted,
    setTheme,
    toggleTheme,
  };
}

/**
 * Reset internal state (in-memory preference and cached snapshot).
 *
 * Intended for test suites that need a clean slate between tests. Not part
 * of the public API.
 *
 * @internal
 */
export function _resetInternalState(): void {
  inMemoryPreference = DEFAULT_PREFERENCE;
  cachedSnapshot = null;
}
