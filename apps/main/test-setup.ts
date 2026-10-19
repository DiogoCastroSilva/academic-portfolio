import "@testing-library/jest-dom";
import { vi } from "vitest";

import { mockNextLink } from "@katie-portfolio/utils/test-helpers/next-mocks";

// Mock next/link globally for component tests in happy-dom environment.
// Renders an <a> element and forwards all props (including aria-* attributes).
vi.mock("next/link", () => mockNextLink);

// Suppress unhandled AbortError from happy-dom's Animation.cancel()
// when motion-dom (framer-motion) stops animations during teardown.
// This is a known happy-dom/motion-dom interaction in the test
// environment only — it does not affect production builds.
process.on("unhandledRejection", (reason: unknown) => {
  if (
    reason instanceof Error &&
    reason.name === "AbortError" &&
    reason.message === "The animation was canceled."
  ) {
    // Ignore — harmless test-environment animation teardown artifact
    return;
  }
  // Re-throw non-matching rejections by re-emitting to the global handler
  const err = reason instanceof Error ? reason : new Error(String(reason));
  console.error(err);
});
