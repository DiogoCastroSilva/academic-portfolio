/**
 * Pagination utility for statically-exported collection pages.
 *
 * Provides pure functions to slice a sorted list of items into pages,
 * parse the `page` query parameter safely, and generate the sequence of
 * page numbers (with ellipsis) for the pagination navigation component.
 */

/** Number of items displayed per paginated collection page. */
export const PAGE_SIZE = 10;

/** Maximum number of numeric page buttons to show in the Pagination nav. */
export const MAX_VISIBLE_PAGES = 5;

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

/**
 * Generate the sequence of page numbers (and ellipsis markers) to render
 * in the pagination navigation.
 *
 * Rules:
 * - Always shows page 1 and the last page.
 * - Shows a contiguous window of up to `maxVisible - 2` pages around the
 *   current page.  `"..."` ellipsis strings are inserted when there are
 *   gaps in the sequence.
 * - If `totalPages <= maxVisible` every page number is returned with no
 *   ellipsis.
 *
 * @param currentPage 1-based current page.
 * @param totalPages  Total number of pages.
 * @param maxVisible  Maximum page-number buttons (including 1 and last).
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = MAX_VISIBLE_PAGES,
): Array<number | "..."> {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Window of pages *between* page 1 and the last page.
  const windowSize = maxVisible - 2;
  const halfWindow = Math.floor(windowSize / 2);

  let start = Math.max(2, currentPage - halfWindow);
  const end = Math.min(totalPages - 1, start + windowSize - 1);

  // Re-anchor the window if it doesn't fill the available space.
  if (end - start + 1 < windowSize) {
    start = Math.max(2, end - windowSize + 1);
  }

  const pages: Array<number | "..."> = [1];

  if (start > 2) {
    pages.push("...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}
