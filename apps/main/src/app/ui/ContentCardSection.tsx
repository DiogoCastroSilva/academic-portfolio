"use client";
import type { ContentMeta } from "@academic-portfolio/content";
import { dates } from "@academic-portfolio/utils";
import Link from "next/link";

import { ContentImage } from "./ContentImage";

type ContentCardSectionProps = {
  heading: string;
  headingId: string;
  items: ContentMeta[];
  hrefPrefix: string;
  /**
   * HTML heading level for the section title.
   * Use `"h1"` on collection listing pages (where the heading is the
   * page title) and `"h2"` everywhere else (e.g. the homepage, where
   * the name H1 already serves as the page title).
   * @default "h2"
   */
  headingLevel?: "h1" | "h2";
  /**
   * Maximum number of items to display in the card grid.
   * When omitted, ALL items are displayed (used by collection listing
   * pages that slice items server-side via `paginate()`).
   */
  limit?: number;
  emptyMessage?: string;
  tagsLimit?: number;
  /**
   * Optional "View all" link rendered after the card grid.
   * When omitted, no link is rendered (e.g. on paginated collection pages
   * where a Pagination nav takes its place, or on the homepage Blog section
   * which always has fewer items than the limit).
   */
  viewAllHref?: string;
  /** Visible label for the "View all" link (e.g. "View all posts"). */
  viewAllLabel?: string;
};

function itemHref(prefix: string, slug: string): string {
  return `${prefix}/${slug}/`;
}

export function ContentCardSection({
  heading,
  headingId,
  items,
  hrefPrefix,
  headingLevel = "h2",
  limit,
  tagsLimit = 2,
  emptyMessage = "No items to display at this time.",
  viewAllHref,
  viewAllLabel = "View all",
}: ContentCardSectionProps) {
  const visibleItems = items.slice(0, limit);
  const HeadingTag: "h1" | "h2" = headingLevel;
  return (
    <section
      className="mx-4 rounded-2xl bg-white p-12 text-slate-900 shadow-sm dark:bg-sky-50"
      aria-labelledby={headingId ?? heading}
    >
      <HeadingTag
        id={headingId ?? heading}
        className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl"
      >
        {heading}
      </HeadingTag>
      {visibleItems.length === 0 && emptyMessage ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            aria-hidden="true"
            className="mb-4 h-12 w-12 text-sky-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 2h6m2 6a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM9 9h.01M9 9a.75.75 0 11-1.5 0V8a.75.75 0 011.5 0v1z"
            />
          </svg>
          <p className="text-slate-600 dark:text-slate-600">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="contents">
              {visibleItems.map((item, index) => (
                <article
                  key={item.slug}
                  className="animate-fadeInUp rounded-2xl border border-zinc-200 bg-white motion-reduce:animate-none dark:border-zinc-300 dark:bg-sky-50"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <Link
                    href={itemHref(hrefPrefix, item.slug)}
                    className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                    aria-label={`Read more: ${item.title}`}
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-200 dark:bg-stone-300">
                      <ContentImage
                        src={item.imageSrc}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index === 0}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex gap-2">
                        <time dateTime={item.date}>
                          {dates.formatISODate(item.date)}
                        </time>
                        <ul className="flex flex-wrap gap-2">
                          {item.tags?.slice(0, tagsLimit).map((tag) => (
                            <li
                              key={tag}
                              className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-500 dark:text-zinc-600"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="mb-2 line-clamp-2 text-xl leading-tight font-semibold tracking-tight transition-all duration-300 group-hover:-translate-y-1 group-hover:underline">
                          {item.title}
                        </h3>
                        {item.excerpt ? (
                          <p className="line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-gray-400">
                            {item.excerpt}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {viewAllHref && (
              <div className="col-span-full mt-2">
                <Link
                  href={viewAllHref}
                  className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  aria-label={viewAllLabel}
                >
                  {viewAllLabel}
                  <svg
                    aria-hidden="true"
                    className="-mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
