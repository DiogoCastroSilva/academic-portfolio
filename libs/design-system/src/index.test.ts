import { describe, expect, it } from "vitest";

import * as designSystem from "../src/index.js";

describe("design-system library", () => {
  it("exports a stable public API", () => {
    // At this stage (T-001), the library exports no components yet.
    // This test ensures the entry point is importable and the public
    // API contract is verifiable. Components are promoted in T-003–T-005.
    expect(designSystem).toBeDefined();
    expect(typeof designSystem).toBe("object");
  });
});
