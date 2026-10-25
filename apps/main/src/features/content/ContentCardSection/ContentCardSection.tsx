"use client";

import type { ContentMeta } from "@academic-portfolio/content";
import { dates } from "@academic-portfolio/utils";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { ContentImage, Tag } from "@academic-portfolio/design-system";
import {
  MOTION_DELAY_CHILDREN,
  MOTION_DURATION_CHILD,
  MOTION_EASE_ENTER,
  MOTION_OFFSET,
  MOTION_STAGGER,
  MOTION_VIEWPORT_MARGIN,
} from "@/lib/motion-config.js";

/**
 * Section-level container variants.
 * The section itself does not animate visually — it serves as the
 * stagger controller for its direct children (heading + grid).
 */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: MOTION_DELAY_CHILDREN,
    },
  },
};

/**
 * Grid-level variants — staggers the card articles within the grid.
 */
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: MOTION_STAGGER,
    },
  },
};

/**
 * Item-level variants — applied to heading, each card, and the
 * "View all" link. Children fade up from MOTION_OFFSET on enter.
 */
const itemVariants = {
  hidden: { opacity: 0, y: MOTION_OFFSET },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION_CHILD,
      ease: MOTION_EASE_ENTER,
    },
  },
};

const MotionH1 = motion.create("h1");
const MotionH2 = motion.create("h2");
export type ContentCardSectionProps = {
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
  const shouldReduceMotion = useReducedMotion();
  const visibleItems = items.slice(0, limit);
  const MotionHeading = headingLevel === "h1" ? MotionH1 : MotionH2;
  const MotionSection = shouldReduceMotion ? "section" : motion.section;
  const MotionArticle = shouldReduceMotion ? "article" : motion.article;
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;
  const motionProps = shouldReduceMotion ? {} : { variants: itemVariants };

  return (
    <MotionSection
      className="text-text-primary mx-4 p-6 sm:p-10 lg:p-12"
      aria-labelledby={headingId ?? heading}
      {...(shouldReduceMotion ? {} : { variants: containerVariants })}
      {...(shouldReduceMotion
        ? {}
        : {
            initial: "hidden" as const,
            whileInView: "visible" as const,
            viewport: {
              once: true,
              margin: MOTION_VIEWPORT_MARGIN,
            } as const,
          })}
    >
      <MotionHeading
        id={headingId ?? heading}
        className="text-text-secondary font-display mb-6 scroll-mt-16 text-2xl font-normal md:text-3xl"
        {...motionProps}
      >
        {heading}
      </MotionHeading>
      {visibleItems.length === 0 && emptyMessage ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            aria-hidden="true"
            className="text-accent mb-4 h-12 w-12"
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
          <p className="text-text-secondary">{emptyMessage}</p>
        </div>
      ) : (
        <MotionDiv
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          {...(shouldReduceMotion ? {} : { variants: gridVariants })}
        >
          {visibleItems.map((item, index) => (
            <MotionArticle
              key={item.slug}
              className="bg-surface-card border-border shadow-card rounded-2xl border"
              {...motionProps}
            >
              <Link
                href={itemHref(hrefPrefix, item.slug)}
                className="group focus-visible:outline-focus block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label={`Read more: ${item.title}`}
              >
                <div className="bg-surface-elevated relative aspect-[16/9] w-full overflow-hidden">
                  <ContentImage
                    src={item.imageSrc}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-250 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index === 0}
                  />
                  {item.selected && (
                    <span
                      aria-label="Featured project"
                      className="bg-accent/90 text-text-on-accent absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-[1px]"
                    >
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <time
                      dateTime={item.date}
                      className="text-text-secondary text-sm"
                    >
                      {dates.formatISODate(item.date)}
                    </time>
                    <ul className="flex flex-wrap items-center gap-2">
                      {item.tags?.slice(0, tagsLimit).map((tag) => (
                        <li key={tag} className="min-w-0">
                          <Tag size="sm">{tag}</Tag>
                        </li>
                      ))}
                      {item.tags && item.tags.length > tagsLimit && (
                        <li
                          aria-label={`${item.tags.length - tagsLimit} more tags`}
                          className="text-text-secondary text-xs font-medium"
                        >
                          +{item.tags.length - tagsLimit} more
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    {item.authors && item.authors.length > 0 && (
                      <p
                        className="text-text-secondary mb-1 text-sm leading-5"
                        aria-label={
                          item.authors.length === 1
                            ? `By ${item.authors[0]}`
                            : `By ${item.authors.length} authors`
                        }
                      >
                        {item.authors.join(", ")}
                        {item.venue && ` · ${item.venue}`}
                      </p>
                    )}
                    {item.venue && !item.authors?.length && (
                      <p className="text-text-secondary mb-1 text-sm leading-5">
                        {item.venue}
                      </p>
                    )}
                    <h3 className="text-text-primary mb-1 line-clamp-2 text-xl leading-tight font-semibold tracking-tight transition-all duration-250 group-hover:underline">
                      {item.title}
                    </h3>
                    {item.excerpt ? (
                      <p className="text-text-secondary line-clamp-3 text-sm leading-6">
                        {item.excerpt}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            </MotionArticle>
          ))}

          {viewAllHref && (
            <MotionDiv className="col-span-full mt-2" {...motionProps}>
              <Link
                href={viewAllHref}
                className="text-link hover:text-link-hover focus-visible:outline-focus inline-flex items-center gap-1 text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
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
            </MotionDiv>
          )}
        </MotionDiv>
      )}
    </MotionSection>
  );
}
