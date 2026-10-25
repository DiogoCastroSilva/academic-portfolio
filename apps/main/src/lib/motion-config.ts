/**
 * Centralized motion timing constants for consistent choreography.
 *
 * Reuses the same semantic values defined in design-system tokens.css:
 *   --motion-duration-enter (0.5s) and --motion-ease-enter (ease-out).
 *
 * These constants keep motion/react animations in sync with CSS-based
 * animations throughout the site. Adjust in one place to update the
 * entire motion language.
 *
 * See docs/architecture/frontend-design-principles.md §6 for guidance.
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

/** Easing curve shared across all motion. Uses Framer Motion's enum ("easeOut")
 * which is equivalent to CSS ease-out (cubic-bezier(0.25, 0.1, 0.25, 1)).
 * The CSS animations in animations.css use the --motion-ease-enter variable
 * which is set to ease-out directly. */
export const MOTION_EASE_ENTER = "easeOut" as const;

/** Movement distance for entrance reveals (20px). */
export const MOTION_OFFSET = 20;

/** Reduced scale factor for portrait entrance (10% shrink). */
export const MOTION_PORTRAIT_SCALE = 0.9;
