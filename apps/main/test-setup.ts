import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Mock next/link globally for component tests in happy-dom environment.
// Renders an <a> element and forwards all props (including aria-* attributes).
vi.mock("next/link", () => ({
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
}));
