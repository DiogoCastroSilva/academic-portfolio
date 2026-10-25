/**
 * Centralized motion timing constants for consistent choreography.
 *
 * Reuses the same semantic values defined in design-system tokens.css:
 *   --motion-duration-enter (0.5s) and --motion-ease-enter (cubic-bezier(0.22, 1, 0.36, 1)).
 *
 * These constants keep motion/react animations in sync with CSS-based
 * animations throughout the site. Adjust in one place to update the
 * entire motion language.
 *
 * See docs/architecture/frontend-design-principles.md §6 for guidance.
 *
 * Progressive enhancement pattern:
 *   - Motion components use `initial={false}` (NEVER `initial: "hidden"`)
 *   - Items receive `.motion-item-initial` CSS class (see animations.css)
 *   - The `jsDetectorScript` (libs/navigation) sets `data-js` on `<html>`
 *     in `<head>` before first paint, gating the opacity-0 CSS state
 *   - Without JS: `.motion-item-initial` = opacity-1 (visible in SSR)
 *   - With JS: `.motion-item-initial` = opacity-0, Motion animates to opacity-1
 */

/** Duration for section-level entrance reveals (500ms). */
export const MOTION_DURATION_SECTION = 0.5;

/** Duration for sibling/child item reveals within a section (450ms). */
export const MOTION_DURATION_CHILD = 0.45;

/** Duration for hero/intro coordination animations (600ms). */
export const MOTION_DURATION_HERO = 0.6;

/** Stagger delay between sibling items (80ms). */
export const MOTION_STAGGER = 0.08;

/** Delay before the first staggered child begins (50ms). */
export const MOTION_DELAY_CHILDREN = 0.05;

/** Easing curve for all entrance animations. Uses an editorial-style
 * ease-out cubic bezier [0.22, 1, 0.36, 1] — steeper and more intentional
 * than the standard CSS ease-out (cubic-bezier(0.25, 0.1, 0.25, 1)).
 * The same curve is defined as --motion-ease-enter in tokens.css for CSS
 * animations in animations.css. */
export const MOTION_EASE_ENTER = [0.22, 1, 0.36, 1] as const;

/** Movement distance for entrance reveals (20px). */
export const MOTION_OFFSET = 20;

/** Reduced scale factor for portrait entrance (10% shrink). */
export const MOTION_PORTRAIT_SCALE = 0.9;

/** Viewport margin for scroll-triggered animations.
 * A -20% bottom margin shrinks the effective trigger region so reveals fire
 * just *before* an element's bottom edge reaches the viewport bottom —
 * creating a subtle anticipation effect without triggering prematurely.
 *
 * Use this for sections with multiple staggered children (cards, rows,
 * timeline entries). For very short sections (one or two lines) the default
 * `{ once: true }` without a margin may be more appropriate.
 *
 * Shared across ContentCardSection, PublicationRowSection, and all
 * About-page animated sections for consistent scroll-trigger behavior. */
export const MOTION_VIEWPORT_MARGIN = "0px 0px -20% 0px";
