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
 * properties `--font-sans` and `--font-display`. Tailwind utility names
 * `font-sans` / `font-display` are registered in tw-input.css via the @theme
 * block, each backed by these variables with system-font fallbacks.
 *
 * `display: "swap"` prevents FOIT (Flash of Invisible Text) on the static
 * site, which is important for GitHub Pages deployments where font loading
 * may be slow.
 *
 * Font files include OFL.txt in apps/main/public/fonts/ per the SIL Open Font
 * License requirements.
 */
import localFont from "next/font/local";

export const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter/roman.var.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/italic.var.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const dmSerifDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/dm-serif-display/regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/dm-serif-display/italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-display",
  display: "swap",
  preload: true,
});
