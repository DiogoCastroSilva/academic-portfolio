import { vi } from "vitest";

import { mockNextLink } from "@academic-portfolio/utils/test-helpers/next-mocks";

// Mock next/link globally for component tests.
// Renders an <a> element and forwards all props (including aria-* attributes).
vi.mock("next/link", () => mockNextLink);

// Suppress unhandled AbortError from happy-dom's Animation.cancel()
// when motion-dom (framer-motion) stops animations during teardown.
process.on("unhandledRejection", (reason: unknown) => {
  if (
    reason instanceof Error &&
    reason.name === "AbortError" &&
    reason.message === "The animation was canceled."
  ) {
    return;
  }
  const err = reason instanceof Error ? reason : new Error(String(reason));
  console.error(err);
});
