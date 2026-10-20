/**
 * Pagination utility for statically-exported collection pages.
 *
 * Provides pure functions to slice a sorted list of items into pages,
 * parse the `page` query parameter safely.
 *
 * Note: `generatePageNumbers` and `MAX_VISIBLE_PAGES` (the UI-level page
 * button sequence generator) now live in `@academic-portfolio/design-system`
 * alongside the Pagination component.
 */

/** Number of items displayed per paginated collection page. */
export const PAGE_SIZE = 10;

export interface PaginationResult<T> {
  /** Items for the current page only. */
  items: T[];
  /** The validated current page number (1-based). */
  currentPage: number;
  /** Total number of pages given the total item count. */
  totalPages: number;
  /** Total number of items across all pages. */
  totalItems: number;
  /** Whether a Previous link should be rendered. */
  hasPrev: boolean;
  /** Whether a Next link should be rendered. */
  hasNext: boolean;
  /** 0-based index of the first item on the current page. */
  startOffset: number;
  /** 0-based index of the position after the last item on the current page. */
  endOffset: number;
}

/**
 * Split a sorted array of items into a page.
 *
 * The `currentPage` value is clamped to the range `[1, totalPages]`.
 * When the collection is empty `totalPages` is 1 (not 0), so the caller
 * can always rely on being able to render page 1.
 *
 * @param items       Fully sorted array of content items (all pages).
 * @param currentPage 1-based page number from the URL.
 * @param pageSize    Items per page (defaults to {@link PAGE_SIZE}).
 * @returns Pagination metadata and the page's slice of items.
 */
export function paginate<T>(
  items: T[],
  currentPage: number,
  pageSize: number = PAGE_SIZE,
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.max(1, Math.min(currentPage, totalPages));
  const startOffset = (page - 1) * pageSize;
  const endOffset = Math.min(startOffset + pageSize, totalItems);

  return {
    items: items.slice(startOffset, endOffset),
    currentPage: page,
    totalPages,
    totalItems,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    startOffset,
    endOffset,
  };
}

/**
 * Safely parse a `page` query-param value into a 1-based page number.
 *
 * Returns `fallback` (default 1) for:
 * - empty / undefined / null values
 * - non-numeric strings
 * - numbers less than 1
 *
 * @param value    Raw string from the URL search params.
 * @param fallback Default page when the value is invalid (default 1).
 */
export function parsePageParam(
  value: string | null | undefined,
  fallback: number = 1,
): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

// generatePageNumbers and MAX_VISIBLE_PAGES have been migrated to
// @academic-portfolio/design-system — they are UI helpers that live
// alongside the Pagination component.
