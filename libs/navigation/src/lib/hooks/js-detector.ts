/**
 * Inline JS-detection script for progressive enhancement.
 *
 * Injected into `<head>` via `dangerouslySetInnerHTML` in the root layout,
 * alongside `themeInitScript`. Runs synchronously before first paint to
 * set `data-js` on `<html>` — enabling CSS to distinguish between a
 * no-JavaScript environment and a JavaScript-enabled environment.
 *
 * This is required for Motion components that use `initial={false}` with
 * CSS-driven pre-visibility states: content is visible by default (SSR /
 * no-JS), and only becomes opacity-0 when JS is detected (allowing Motion
 * to enhance with viewport-triggered reveals).
 *
 * Pattern: `html[data-js] .motion-item-initial { opacity: 0; }`
 *
 * @returns A string of JavaScript to be inlined in `<head>`.
 */
export const jsDetectorScript = `(function(){document.documentElement.setAttribute('data-js','')})();`;
