/**
 * Accessible, static-export-friendly pagination navigation.
 *
 * Renders only when `totalPages > 1`.  All links are `next/link` anchors so
 * navigation is client-side and works without a server.
 *
 * URLs produced (respecting `trailingSlash: true` in next.config.mjs):
 *   - page 1  → `${baseUrl}/`            (clean, e.g. `/blog/`)
 *   - page N  → `${baseUrl}/page/${N}/`  (e.g. `/blog/page/2/`)
 *
 * Using path-based pagination ensures each page is a standalone static
 * HTML file generated at build time, which is required for Next.js
 * static export / GitHub Pages and sitemap/SEO.
 */

"use client";

import Link from "next/link";

import { generatePageNumbers } from "../lib/pagination";

interface PaginationProps {
  /** 1-based current page number. */
  currentPage: number;
  /** Total number of pages.  When ≤ 1 the component renders nothing. */
  totalPages: number;
  /** Base path for this collection, e.g. `/blog` or `/projects`. */
  baseUrl: string;
}

/** Build the URL for a given page number. */
function buildPageUrl(baseUrl: string, page: number): string {
  const base = baseUrl.replace(/\/+$/, ""); // strip trailing slash
  if (page <= 1) {
    return `${base}/`;
  }
  return `${base}/page/${page}/`;
}

const btnBase =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-slate-700 hover:bg-zinc-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-zinc-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-gray-100";

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePageNumbers(currentPage, totalPages);
  const showPrev = currentPage > 1;
  const showNext = currentPage < totalPages;

  return (
    <nav aria-label="Pagination" className="flex justify-center py-8">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        {showPrev && (
          <li>
            <Link
              href={buildPageUrl(baseUrl, currentPage - 1)}
              aria-label="Previous page"
              className={btnBase}
            >
              <span aria-hidden="true" className="text-base leading-none">
                ‹
              </span>
            </Link>
          </li>
        )}

        {pages.map((page, index) =>
          page === "..." ? (
            <li key={`ellipsis-${index}`} aria-hidden="true">
              <span className="px-2 py-1 text-sm text-zinc-500 dark:text-zinc-400">
                …
              </span>
            </li>
          ) : page === currentPage ? (
            <li key={page}>
              <span
                aria-current="page"
                aria-label={`Page ${page} of ${totalPages}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white"
              >
                {page}
              </span>
            </li>
          ) : (
            <li key={page}>
              <Link
                href={buildPageUrl(baseUrl, page)}
                aria-label={`Go to page ${page}`}
                className={btnBase}
              >
                {page}
              </Link>
            </li>
          ),
        )}

        {showNext && (
          <li>
            <Link
              href={buildPageUrl(baseUrl, currentPage + 1)}
              aria-label="Next page"
              className={btnBase}
            >
              <span aria-hidden="true" className="text-base leading-none">
                ›
              </span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
