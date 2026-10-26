"use client";

import type { ContentMeta } from "@academic-portfolio/content";
import { ContentImage } from "@academic-portfolio/design-system";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import {
  MOTION_DURATION_CHILD,
  MOTION_EASE_ENTER,
  MOTION_VIEWPORT,
} from "@/lib/motion-config.js";

export type FeaturedProjectsSectionProps = {
  /** Section heading (e.g. "Featured"). */
  heading: string;
  /** Unique ID for the heading element (used for anchor links). */
  headingId: string;
  /** Featured project items to render. Must be pre-filtered (selected === true). */
  items: ContentMeta[];
  /** Prefix for detail-page links (e.g. `/projects`). */
  hrefPrefix: string;
};

/** Section-level container variants — single group-level reveal.
 *
 * The `visible` variant includes `opacity: 1, y: 0` so Motion applies an
 * inline style that overrides the CSS `.motion-item-initial` opacity-0 state
 * (under `html[data-js]`). Without these values, the section stays at opacity-0
 * after `whileInView` fires, making content invisible to JS users.
 *
 * `hidden: {}` mirrors the container-variants pattern in ContentCardSection
 * and PublicationRowSection — Motion does not apply initial styles here
 * because `initial: false` is set; the CSS `.motion-item-initial` class
 * (guarded by `html[data-js]`) provides the pre-animation state instead.
 */
export const sectionVariants = {
  hidden: {},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION_CHILD,
      ease: MOTION_EASE_ENTER,
    },
  },
};

function itemHref(prefix: string, slug: string): string {
  return `${prefix}/${slug}/`;
}

/** Extract a 4-digit year from an ISO date string. */
function formatYear(date: string): string {
  if (!date) return "";
  return date.substring(0, 4);
}

/**
 * Editorial featured-projects section.
 *
 * Renders up to three featured projects (those with `selected: true`) in a
 * curated, image-led layout:
 *   - 1 lead project spanning two-thirds of the desktop grid.
 *   - Up to 2 supporting projects in the remaining column(s).
 *
 * When only one featured project exists, the lead spans the full width.
 * When no featured projects exist, the component renders nothing.
 *
 * Motion uses the shared progressive-enhancement pattern:
 * `.motion-item-initial` class + `initial={false}` + `whileInView` so
 * content is visible in SSR and only animates as an enhancement.
 */
export function FeaturedProjectsSection({
  heading,
  headingId,
  items,
  hrefPrefix,
}: FeaturedProjectsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionSection = shouldReduceMotion ? "section" : motion.section;

  if (items.length === 0) return null;

  const lead = items[0];
  const supporting = items.slice(1, 3);

  return (
    <MotionSection
      className="motion-item-initial mx-4 p-6 sm:p-10 lg:p-12"
      aria-labelledby={headingId}
      {...(shouldReduceMotion
        ? {}
        : {
            variants: sectionVariants,
            initial: false,
            whileInView: "visible",
            viewport: MOTION_VIEWPORT,
          })}
    >
      <h2
        id={headingId}
        className="text-text-secondary font-display mb-6 scroll-mt-16 text-2xl font-normal md:text-3xl"
      >
        {heading}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Lead featured project — editorial emphasis with wide image */}
        <article
          className={supporting.length > 0 ? "md:col-span-2" : "md:col-span-3"}
        >
          <Link
            href={itemHref(hrefPrefix, lead.slug)}
            className="group focus-visible:outline-focus block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label={`View project: ${lead.title}`}
          >
            <div className="bg-surface-elevated relative aspect-[16/9] w-full overflow-hidden rounded-xl">
              <ContentImage
                src={lead.imageSrc}
                alt={lead.title}
                className="h-full w-full object-cover transition-transform duration-250 group-hover:scale-105"
                sizes={
                  supporting.length > 0
                    ? "(max-width: 768px) 100vw, 66vw"
                    : "100vw"
                }
                priority={false}
              />
            </div>
            <div className="mt-4">
              <h3 className="text-text-primary text-xl leading-tight font-semibold tracking-tight">
                {lead.title}
              </h3>
              {lead.excerpt ? (
                <p className="text-text-secondary mt-2 line-clamp-3 text-sm leading-6">
                  {lead.excerpt}
                </p>
              ) : null}
              {lead.date ? (
                <time
                  dateTime={lead.date}
                  className="text-text-secondary mt-2 block text-sm"
                >
                  {formatYear(lead.date)}
                </time>
              ) : null}
            </div>
          </Link>
        </article>

        {/* Supporting featured projects (up to 2) */}
        {supporting.map((item) => (
          <article key={item.slug}>
            <Link
              href={itemHref(hrefPrefix, item.slug)}
              className="group focus-visible:outline-focus block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={`View project: ${item.title}`}
            >
              <div className="bg-surface-elevated relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                <ContentImage
                  src={item.imageSrc}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-250 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
              </div>
              <div className="mt-4">
                <h3 className="text-text-primary text-lg leading-tight font-semibold">
                  {item.title}
                </h3>
                {item.excerpt ? (
                  <p className="text-text-secondary mt-2 line-clamp-3 text-sm leading-6">
                    {item.excerpt}
                  </p>
                ) : null}
                {item.date ? (
                  <time
                    dateTime={item.date}
                    className="text-text-secondary mt-2 block text-sm"
                  >
                    {formatYear(item.date)}
                  </time>
                ) : null}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </MotionSection>
  );
}
