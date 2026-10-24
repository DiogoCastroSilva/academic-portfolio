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
      <ol className="text-text-secondary flex items-center gap-1 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex min-w-0 items-center gap-1">
            {index > 0 && (
              <ChevronIcon
                className="text-text-muted h-4 w-4"
                aria-hidden={true}
              />
            )}
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-text-secondary hover:text-link focus-visible:outline-focus block max-w-[100px] truncate hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-[150px] md:max-w-xs"
              >
                {item.label}
              </Link>
            ) : item.href && index === items.length - 1 ? (
              <Link
                href={item.href}
                aria-current="page"
                className="text-text-primary focus-visible:outline-focus block max-w-[100px] truncate font-medium focus-visible:outline-2 focus-visible:outline-offset-2 sm:max-w-[150px] md:max-w-xs"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="text-text-primary block max-w-[100px] truncate font-medium sm:max-w-[150px] md:max-w-xs"
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
