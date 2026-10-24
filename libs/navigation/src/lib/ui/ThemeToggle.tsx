"use client";

import { useTheme } from "../hooks/useTheme.js";

/**
 * Compact theme toggle button that cycles through three preferences:
 * System → Light → Dark → System.
 *
 * The icon (sun / moon) reflects the *resolved* theme, not the raw preference,
 * so users always see their actual color scheme. The accessible label
 * announces the current preference and what the next state will be.
 *
 * Respects `prefers-reduced-motion` — the icon transition is disabled when
 * the user requests reduced motion.
 */
export function ThemeToggle() {
  const { preference, resolvedTheme, toggleTheme, mounted } = useTheme();

  /** Next preference in the cycle, for an accessible aria-label. */
  const nextPreferenceLabel =
    preference === "system"
      ? "Light"
      : preference === "light"
        ? "Dark"
        : "System";

  const label = `Theme: ${preferenceLabel(preference)}. Click to switch to ${nextPreferenceLabel}.`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={
        "text-text-muted hover:bg-surface-tinted hover:text-link focus-visible:bg-surface-tinted focus-visible:text-link focus-visible:outline-focus relative inline-flex size-11 cursor-pointer items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
      }
    >
      <span className="sr-only">{label}</span>
      {/* Sun icon — shown for light theme, hidden for dark */}
      <SunIcon
        className={
          "absolute size-6 transition-opacity duration-150 motion-reduce:duration-0 " +
          (resolvedTheme === "light" ? "opacity-100" : "opacity-0")
        }
      />
      {/* Moon icon — shown for dark theme, hidden for light */}
      <MoonIcon
        className={
          "absolute size-6 transition-opacity duration-150 motion-reduce:duration-0 " +
          (resolvedTheme === "dark" ? "opacity-100" : "opacity-0")
        }
      />
      {/* Before hydration, show nothing (prevents flash) — after mount the
          icons above take over. */}
      {!mounted && <span className="size-6" aria-hidden="true" />}
    </button>
  );
}

/** Human-readable preference label for aria-label. */
function preferenceLabel(p: string): string {
  if (p === "light") return "Light";
  if (p === "dark") return "Dark";
  return "System";
}

/** Simple outlined sun icon for the light-theme state. */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      data-slot="icon"
      aria-hidden="true"
      className={className}
    >
      <circle cx={12} cy={12} r={5} />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

/** Simple outlined moon icon for the dark-theme state. */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      data-slot="icon"
      aria-hidden="true"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
