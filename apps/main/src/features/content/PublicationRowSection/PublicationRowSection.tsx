"use client";

import type { ContentMeta } from "@academic-portfolio/content";
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

export type PublicationRowSectionProps = {
  /** Section title (e.g. "Publications"). */
  heading: string;
  /** Unique ID for the heading element (used for anchor links). */
  headingId: string;
  /** Publication items to render. */
  items: ContentMeta[];
  /** Prefix for detail-page links (e.g. `/publications`). */
  hrefPrefix: string;
  /**
   * HTML heading level for the section title.
   * Use `"h1"` on collection listing pages and `"h2"` on the homepage.
   * @default "h2"
   */
  headingLevel?: "h1" | "h2";
  /**
   * Maximum number of items to display.
   * When omitted, ALL items are displayed.
   */
  limit?: number;
  emptyMessage?: string;
  tagsLimit?: number;
  /**
   * Optional "View all" link rendered after the row list.
   * When omitted, no link is rendered.
   */
  viewAllHref?: string;
  /** Visible label for the "View all" link. */
  viewAllLabel?: string;
};

/**
 * Section-level container variants.
 * The section itself does not animate visually — it serves as the
 * stagger controller for its direct children (heading + row list).
 */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: MOTION_DELAY_CHILDREN,
    },
  },
};

/** Row-list variants — staggers publication rows. */
const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: MOTION_STAGGER,
    },
  },
};

/** Individual row: fade up from MOTION_OFFSET on enter. */
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

function itemHref(prefix: string, slug: string): string {
  return `${prefix}/${slug}/`;
}

/** Extract a 4-digit year from an ISO date string. */
function formatYear(date: string): string {
  if (!date) return "";
  return date.substring(0, 4);
}

export function PublicationRowSection({
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
}: PublicationRowSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const visibleItems = items.slice(0, limit);
  const MotionHeading = headingLevel === "h1" ? MotionH1 : MotionH2;
  const MotionSection = shouldReduceMotion ? "section" : motion.section;
  const MotionArticle = shouldReduceMotion ? "article" : motion.article;
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;
  const motionProps = shouldReduceMotion ? {} : { variants: itemVariants };

  return (
    <MotionSection
      aria-labelledby={headingId ?? heading}
      className="text-text-primary mx-4 p-6 sm:p-10 lg:p-12"
      {...(shouldReduceMotion
        ? {}
        : {
            variants: containerVariants,
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
          className="divide-border flex flex-col gap-1 divide-y"
          {...(shouldReduceMotion ? {} : { variants: listVariants })}
        >
          {visibleItems.map((item) => (
            <MotionArticle
              key={item.slug}
              className="group relative py-5 first:pt-0 last:pb-0"
              {...motionProps}
            >
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
                {item.imageType === "cover" && (
                  <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-md sm:w-24 sm:max-w-24">
                    <ContentImage
                      src={item.imageSrc}
                      alt=""
                      className="h-full w-full object-cover"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-text-primary group-hover:text-link text-lg leading-tight font-semibold transition-colors md:text-xl">
                    <Link
                      href={itemHref(hrefPrefix, item.slug)}
                      className="hover:text-link focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2"
                      aria-label={`Read more: ${item.title}`}
                    >
                      {item.title}
                    </Link>
                  </h3>
                  {item.authors && item.authors.length > 0 && (
                    <p className="text-text-secondary mt-1 text-sm leading-5">
                      {item.authors.join(", ")}
                      {item.venue && ` · ${item.venue}`}
                    </p>
                  )}
                  {item.venue && !item.authors?.length && (
                    <p className="text-text-secondary mt-1 text-sm">
                      {item.venue}
                    </p>
                  )}
                  <time
                    dateTime={item.date}
                    className="text-text-secondary mt-1 text-sm"
                  >
                    {formatYear(item.date)}
                  </time>
                  {item.excerpt ? (
                    <p className="text-text-secondary mt-2 line-clamp-2 text-sm leading-6">
                      {item.excerpt}
                    </p>
                  ) : null}
                  {item.tags && item.tags.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {item.tags.slice(0, tagsLimit).map((tag) => (
                        <li key={tag}>
                          <Tag size="sm">{tag}</Tag>
                        </li>
                      ))}
                      {item.tags.length > tagsLimit && (
                        <li
                          aria-label={`${item.tags.length - tagsLimit} more tags`}
                          className="text-text-secondary text-xs font-medium"
                        >
                          +{item.tags.length - tagsLimit} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              {/* External link indicators (DOI, PDF, additional links) */}
              {(item.doi || item.paperUrl || item.links?.length) && (
                <div className="text-text-secondary absolute top-0 right-2 flex items-center gap-1.5 text-xs">
                  {item.doi && (
                    <a
                      href={`https://doi.org/${item.doi}`}
                      className="text-link hover:text-link-hover focus-visible:outline-focus rounded focus-visible:outline-2 focus-visible:outline-offset-2"
                      aria-label={`DOI: ${item.doi}`}
                      title={`DOI: ${item.doi}`}
                    >
                      DOI
                    </a>
                  )}
                  {item.paperUrl && (
                    <a
                      href={item.paperUrl}
                      className="text-link hover:text-link-hover focus-visible:outline-focus rounded focus-visible:outline-2 focus-visible:outline-offset-2"
                      aria-label="Link to paper"
                      title="Link to paper"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF
                    </a>
                  )}
                  {item.links?.length ? (
                    <span
                      aria-label={`${item.links.length} additional links`}
                      className="text-text-secondary"
                      title={`${item.links.length} additional links`}
                    >
                      +{item.links.length}
                    </span>
                  ) : null}
                </div>
              )}
              {item.selected && (
                <span
                  aria-label="Featured publication"
                  className="bg-accent/90 text-text-on-accent absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-[1px]"
                >
                  Featured
                </span>
              )}
            </MotionArticle>
          ))}
        </MotionDiv>
      )}

      {viewAllHref && visibleItems.length > 0 && (
        <MotionDiv className="mt-4" {...motionProps}>
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
    </MotionSection>
  );
}
