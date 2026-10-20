/**
 * Generate the sequence of page numbers (and ellipsis markers) to render
 * in the pagination navigation.
 *
 * This utility is colocated with the Pagination component — it is a pure
 * UI helper that determines which page-number buttons to display.
 * Server-side pagination utilities (`paginate`, `parsePageParam`,
 * `PAGE_SIZE`) remain in the consuming application's `lib/pagination.ts`.
 */

/** Maximum number of numeric page buttons to show in the Pagination nav. */
export const MAX_VISIBLE_PAGES = 5;

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
