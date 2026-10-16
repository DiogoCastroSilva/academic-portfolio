"use client";
import type { ContentMeta } from "@katie-portfolio/content";
import { dates } from "@katie-portfolio/utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

import { ContentImage } from "./ContentImage";

type ContentCardSectionProps = {
  heading: string;
  headingId: string;
  items: ContentMeta[];
  hrefPrefix: string;
  limit?: number;
  emptyMessage?: string;
  tagsLimit?: number;
};

function itemHref(prefix: string, slug: string): string {
  return `${prefix}/${slug}/`;
}

export function ContentCardSection({
  heading,
  headingId,
  items,
  hrefPrefix,
  limit = 6,
  tagsLimit = 2,
  emptyMessage = "No items to display at this time.",
}: ContentCardSectionProps) {
  const visibleItems = items.slice(0, limit);

  return (
    <section
      className="mx-4 rounded-2xl bg-white p-12 text-slate-900 shadow-sm dark:bg-sky-50"
      aria-labelledby={headingId ?? heading}
    >
      <h2
        id={headingId ?? heading}
        className="mb-6 text-2xl font-bold text-slate-900"
      >
        {heading}
      </h2>
      {visibleItems.length === 0 && emptyMessage ? (
        <p className="text-slate-700 dark:text-gray-400">{emptyMessage}</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.2 }}
        >
          <AnimatePresence>
            {visibleItems.map((item, index) => (
              <motion.article
                key={item.slug}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={itemHref(hrefPrefix, item.slug)}
                  className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  aria-label={`Read more: ${item.title}`}
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-stone-200 dark:bg-stone-700">
                    <ContentImage
                      src={item.imageSrc}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3}
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
                            className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3 className="tracking-tightmb-2 line-clamp-2 text-xl leading-tight font-semibold tracking-tight transition-all duration-300 group-hover:-translate-y-1 group-hover:underline">
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
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
