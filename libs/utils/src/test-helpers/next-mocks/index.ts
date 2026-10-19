/// <reference lib="dom" />

import React from "react";

/**
 * Default mock for `next/link`.
 *
 * Renders an `<a>` element and forwards all props, including `aria-*` attributes.
 * Use this in a global `test-setup.ts` via `vi.mock("next/link", () => mockNextLink)`.
 *
 * @example
 * ```ts
 * // test-setup.ts
 * import { vi } from "vitest";
 * import { mockNextLink } from "@academic-portfolio/utils/test-helpers/next-mocks";
 *
 * vi.mock("next/link", () => mockNextLink);
 * ```
 */
export const mockNextLink: {
  default: React.FC<{
    children?: React.ReactNode;
    href?: string;
    [key: string]: unknown;
  }>;
} = {
  default: function MockLink({
    children,
    href,
    ...rest
  }: {
    children?: React.ReactNode;
    href?: string;
    [key: string]: unknown;
  }) {
    return React.createElement("a", { href, ...rest }, children);
  },
};
