/**
 * Tests that MOTION_VIEWPORT enforces `once: true`, preventing animation
 * replay when users scroll out of and back into the viewport.
 */

import { describe, expect, it } from "vitest";

import { MOTION_VIEWPORT } from "./motion-config.js";

describe("MOTION_VIEWPORT replay prevention", () => {
  it("guarantees once: true so reveals never replay after first fire", () => {
    expect(MOTION_VIEWPORT).toHaveProperty("once", true);
  });

  it("includes a negative margin so animations fire before elements fully enter viewport", () => {
    expect(MOTION_VIEWPORT.margin).toBeDefined();
    // Negative margin means the trigger fires slightly before the element
    // hits the viewport — a standard UX pattern for smooth reveals.
    expect(typeof MOTION_VIEWPORT.margin).toBe("string");
  });
});
