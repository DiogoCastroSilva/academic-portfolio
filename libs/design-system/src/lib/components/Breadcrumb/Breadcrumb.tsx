import Link from "next/link";

import { ChevronIcon } from "../ChevronIcon/ChevronIcon.js";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

/**
 * Simple breadcrumb navigation: Home / Projects / Example project
 *
 * If the last item has no `href`, it is rendered as the current page
 * (plain text, not a link) with `aria-current="page"`.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="px-4 py-2">
      <ol className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-500">
        {items.map((item, index) => (
          <li key={index} className="flex min-w-0 items-center gap-1">
            {index > 0 && (
              <ChevronIcon
                className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
                aria-hidden={true}
              />
            )}
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="block max-w-[100px] truncate text-zinc-600 hover:text-sky-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:max-w-[150px] md:max-w-xs dark:text-zinc-500 dark:hover:text-sky-400"
              >
                {item.label}
              </Link>
            ) : item.href && index === items.length - 1 ? (
              <Link
                href={item.href}
                aria-current="page"
                className="block max-w-[100px] truncate font-medium text-slate-900 sm:max-w-[150px] md:max-w-xs dark:text-slate-200"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="block max-w-[100px] truncate font-medium text-slate-900 sm:max-w-[150px] md:max-w-xs dark:text-slate-200"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type { BreadcrumbProps };
