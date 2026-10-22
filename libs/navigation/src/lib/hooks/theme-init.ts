/**
 * Inline theme-initialization script for the academic-portfolio site.
 *
 * This script is injected into `<head>` via `dangerouslySetInnerHTML` in
 * the root layout. It reads the stored theme preference from localStorage
 * and synchronously sets the `data-theme` attribute on `<html>` *before*
 * the browser paints any content, preventing a flash of incorrect theme
 * (FOUC / FOIT).
 *
 * When the stored preference is `"system"` (or nothing is stored), it falls
 * back to the OS-level `prefers-color-scheme` media query.
 *
 * The script is deliberately dependency-free and minimal — it must work even
 * before React hydration. It is NOT a client component.
 *
 * @returns A string of JavaScript to be inlined in `<head>`.
 */
export const themeInitScript = `
(function() {
  var key = 'academic-portfolio-theme';
  var html = document.documentElement;
  var pref;
  try {
    pref = localStorage.getItem(key);
  } catch (e) {
    pref = null;
  }
  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }
  if (pref === 'light' || pref === 'dark') {
    html.setAttribute('data-theme', pref);
  } else {
    html.setAttribute('data-theme', getSystemTheme());
  }
})();
`;
