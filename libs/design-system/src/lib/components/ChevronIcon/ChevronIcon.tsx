/**
 * ChevronIcon — a lightweight, semantic SVG icon.
 *
 * Used as a separator in navigation components (e.g. Breadcrumb).
 * Renders an SVG with `aria-hidden` support and no external dependencies.
 */
type ChevronIconProps = {
  className?: string;
  "aria-hidden"?: boolean;
};

export function ChevronIcon({
  className,
  "aria-hidden": ariaHidden,
}: ChevronIconProps) {
  return (
    <svg
      className={className}
      aria-hidden={ariaHidden}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

export type { ChevronIconProps };
