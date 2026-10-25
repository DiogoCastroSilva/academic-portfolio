import type { ReactNode } from "react";

export type TagSize = "sm" | "md";
export type TagVariant = "default" | "warning";

export interface TagProps {
  children: ReactNode;
  /**
   * Size variant.
   * - `sm`: Compact pill for dense card listing layouts.
   * - `md`: Roomier pill for detail page metadata.
   * @default "md"
   */
  size?: TagSize;
  /**
   * Visual variant.
   * - `default`: Neutral outline pill using border and text-secondary tokens.
   * - `warning`: Solid amber pill using `--color-status-warning-*` tokens.
   * @default "default"
   */
  variant?: TagVariant;
  /**
   * Additional classes for layout positioning (margin, flex placement, etc.).
   * Color and typography are controlled by the variant/size props.
   */
  className?: string;
}

const sizeClasses: Record<TagSize, string> = {
  sm: "px-2.5 py-1 text-xs font-medium",
  md: "px-3 py-1 text-sm font-medium",
};

const variantClasses: Record<TagVariant, string> = {
  default: "border border-border text-text-secondary",
  warning: "bg-status-warning-bg text-status-warning-text",
};

/**
 * Tag — a small pill-shaped label for keywords, categories, and statuses.
 *
 * Renders as a semantic `<span>` with design-system token styling.
 * Use the `variant` prop for the amber status style (e.g. featured highlights)
 * and the `size` prop to match compact card or roomy detail layouts.
 *
 * @example
 * <ul className="flex flex-wrap gap-2">
 *   <li className="min-w-0"><Tag size="sm">TypeScript</Tag></li>
 *   <li><Tag size="sm" variant="warning">Featured</Tag></li>
 * </ul>
 */
export function Tag({
  children,
  size = "md",
  variant = "default",
  className,
}: TagProps) {
  return (
    <span
      className={[
        "inline-flex w-fit items-center justify-center rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
