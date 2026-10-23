/**
 * Local font definitions using next/font/local.
 *
 * Two font families are loaded from apps/main/public/fonts/:
 *
 * - Inter (variable font): interface and reading typography (body, nav, cards,
 *   metadata, controls). The variable font supports the full wght range (100–900)
 *   and the opsz (optical size) axis. No static fallback files are shipped — the
 *   variable font covers all weights needed.
 *
 * - DM Serif Display: display typography for the researcher's name and major
 *   headings. Only Regular and Italic (400) are supplied, so only those weights
 *   are declared.
 *
 * Both families are loaded once at the root layout and exposed via CSS custom
 * properties `--font-inter-loaded` and `--font-display-loaded`. These are
 * intentionally named differently from the Tailwind token names (`--font-sans`
 * and `--font-display`) to avoid a self-referencing cascade collision in the
 * `@theme` block. The `@theme` block maps the Tailwind tokens to the loaded
 * font variables:
 *
 *   --font-sans     → var(--font-inter-loaded, …)
 *   --font-display  → var(--font-display-loaded, …)
 *
 * `display: "swap"` prevents FOIT (Flash of Invisible Text) on the static
 * site, which is important for GitHub Pages deployments where font loading
 * may be slow.
 *
 * Preload is set to `false` because `next/font/local` preloads every
 * declared `src` variant and does not support selective per-src preloading.
 * Instead, only the critical (roman / regular) variants are manually
 * preloaded via `<link rel="preload">` tags in the root layout for
 * above-the-fold text. Italic variants load on demand via @font-face
 * matching when their `font-style: italic` is needed — the italic glyphs
 * are not visible in the initial viewport.
 *
 * Font files include OFL.txt in apps/main/public/fonts/ per the SIL Open Font
 * License requirements.
 */
import localFont from "next/font/local";

export const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter/roman.var.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/italic.var.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-inter-loaded",
  display: "swap",
  preload: false,
});

export const dmSerifDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/dm-serif-display/regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/dm-serif-display/italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-display-loaded",
  display: "swap",
  preload: false,
});
