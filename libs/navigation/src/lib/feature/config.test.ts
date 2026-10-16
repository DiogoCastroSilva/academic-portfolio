import { describe, expect, it } from "vitest";

import { navigation } from "./config.js";

describe("navigation config", () => {
  it("exports a non-empty array of navigation items", () => {
    expect(Array.isArray(navigation)).toBe(true);
    expect(navigation.length).toBeGreaterThan(0);
  });

  it("every item has a non-empty name and href", () => {
    for (const item of navigation) {
      expect(item.name).toMatch(/^\S+/);
      expect(item.href).toMatch(/^\/\S/);
    }
  });

  it("includes the core site sections", () => {
    const names = navigation.map((item) => item.name);
    expect(names).toEqual(
      expect.arrayContaining(["Projects", "Publications", "About"]),
    );
  });

  it("all hrefs are root-relative paths without query strings", () => {
    for (const item of navigation) {
      expect(item.href).toMatch(/^\/[a-z-]*$/);
    }
  });
});
