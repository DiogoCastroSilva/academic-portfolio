/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { jsDetectorScript } from "./js-detector.js";

describe("jsDetectorScript", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-js");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-js");
  });

  it("is a non-empty string suitable for inline injection", () => {
    expect(typeof jsDetectorScript).toBe("string");
    expect(jsDetectorScript.length).toBeGreaterThan(0);
    // Should be a self-executing IIFE
    expect(jsDetectorScript.trim()).toMatch(/^\(function\(\)/);
  });

  it("sets data-js on the document element when executed", () => {
    const fn = new Function(jsDetectorScript);
    fn();
    expect(document.documentElement.hasAttribute("data-js")).toBe(true);
  });

  it("is idempotent — running multiple times does not cause errors", () => {
    const fn = new Function(jsDetectorScript);
    fn();
    fn();
    fn();
    expect(document.documentElement.hasAttribute("data-js")).toBe(true);
  });
});
