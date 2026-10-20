/**
 * @academic-portfolio/design-system — shared design primitives and foundations.
 *
 * This library is the single source of truth for:
 * - Semantic CSS custom properties (design tokens)
 * - Typography foundation (prose styles, heading scales)
 * - Shared UI primitives (feature-agnostic components)
 * - Animation utilities
 *
 * Components in this library are intentionally minimal — only primitives
 * that are used across multiple feature routes belong here. See ADR-0008.
 *
 * Components are promoted incrementally (T-003–T-005) as they are migrated
 * from apps/main/src/app/ui/.
 */

/**
 * The CSS entry point for the design system. Import this file once from
 * `apps/main/src/app/global.css` to load all tokens, themes, typography,
 * and animations.
 */
export const styles = "../../../libs/design-system/src/styles/index.css";

export { ContentImage } from "./lib/components/ContentImage/index.js";
export type { ContentImageProps } from "./lib/components/ContentImage/index.js";
export { Pagination } from "./lib/components/Pagination/index.js";
export type { PaginationProps } from "./lib/components/Pagination/index.js";
export {
  generatePageNumbers,
  MAX_VISIBLE_PAGES,
} from "./lib/components/Pagination/index.js";
export { Breadcrumb } from "./lib/components/Breadcrumb/index.js";
export type { BreadcrumbProps } from "./lib/components/Breadcrumb/index.js";
export { ChevronIcon } from "./lib/components/ChevronIcon/index.js";
export type { ChevronIconProps } from "./lib/components/ChevronIcon/index.js";
