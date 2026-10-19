import { describe, expect, it } from "vitest";

import {
  generatePageNumbers,
  parsePageParam,
  paginate,
  PAGE_SIZE,
} from "./pagination.js";

// ---------------------------------------------------------------------------
// paginate()
// ---------------------------------------------------------------------------

describe("paginate", () => {
  it("returns correct page for single page of items (10 items, page 1)", () => {
    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
    const result = paginate(items, 1);

    expect(result.items).toHaveLength(10);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(10);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
    expect(result.startOffset).toBe(0);
    expect(result.endOffset).toBe(10);
  });

  it("returns empty items for empty collection", () => {
    const result = paginate([], 1);

    expect(result.items).toHaveLength(0);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(0);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });

  it("splits 11 items into 10 + 1 across two pages", () => {
    const items = Array.from({ length: 11 }, (_, i) => `item-${i}`);

    const page1 = paginate(items, 1);
    expect(page1.items).toHaveLength(10);
    expect(page1.totalPages).toBe(2);
    expect(page1.hasNext).toBe(true);
    expect(page1.hasPrev).toBe(false);
    expect(page1.startOffset).toBe(0);
    expect(page1.endOffset).toBe(10);

    const page2 = paginate(items, 2);
    expect(page2.items).toHaveLength(1);
    expect(page2.currentPage).toBe(2);
    expect(page2.hasPrev).toBe(true);
    expect(page2.hasNext).toBe(false);
    expect(page2.startOffset).toBe(10);
    expect(page2.endOffset).toBe(11);
  });

  it("splits 20 items into 10 + 10 across two pages", () => {
    const items = Array.from({ length: 20 }, (_, i) => `item-${i}`);

    const page1 = paginate(items, 1);
    expect(page1.items).toHaveLength(10);
    expect(page1.totalPages).toBe(2);

    const page2 = paginate(items, 2);
    expect(page2.items).toHaveLength(10);
  });

  it("splits 21 items into 10 + 10 + 1 across three pages", () => {
    const items = Array.from({ length: 21 }, (_, i) => `item-${i}`);

    const page1 = paginate(items, 1);
    expect(page1.items).toHaveLength(10);
    expect(page1.totalPages).toBe(3);

    const page2 = paginate(items, 2);
    expect(page2.items).toHaveLength(10);

    const page3 = paginate(items, 3);
    expect(page3.items).toHaveLength(1);
    expect(page3.hasPrev).toBe(true);
    expect(page3.hasNext).toBe(false);
  });

  it("clamps page number above totalPages", () => {
    const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
    const result = paginate(items, 999);

    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(5);
  });

  it("clamps page number below 1 to page 1", () => {
    const items = Array.from({ length: 25 }, (_, i) => `item-${i}`);
    const result = paginate(items, -5);

    expect(result.currentPage).toBe(1);
    expect(result.items).toHaveLength(10);
  });

  it("respects custom pageSize", () => {
    const items = Array.from({ length: 12 }, (_, i) => `item-${i}`);
    const result = paginate(items, 1, 4);

    expect(result.totalPages).toBe(3);
    expect(result.items).toHaveLength(4);
  });

  it("uses PAGE_SIZE constant as default pageSize", () => {
    expect(PAGE_SIZE).toBe(10);
  });

  it("no item is silently lost across all pages (11 items)", () => {
    const items = Array.from({ length: 11 }, (_, i) => `item-${i}`);
    const seen: string[] = [];
    for (let page = 1; page <= 2; page++) {
      const result = paginate(items, page);
      seen.push(...result.items);
    }
    expect(seen.sort()).toEqual(items.slice().sort());
  });

  it("no item is silently lost across all pages (21 items)", () => {
    const items = Array.from({ length: 21 }, (_, i) => `item-${i}`);
    const seen: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const result = paginate(items, page);
      seen.push(...result.items);
    }
    expect(seen.sort()).toEqual(items.slice().sort());
  });

  it("every item appears exactly once across pages", () => {
    const items = Array.from({ length: 21 }, (_, i) => `item-${i}`);
    const seen: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const result = paginate(items, page);
      seen.push(...result.items);
    }
    // No duplicates
    expect(new Set(seen).size).toBe(seen.length);
    // No items lost
    expect(seen).toHaveLength(21);
  });
});

// ---------------------------------------------------------------------------
// parsePageParam()
// ---------------------------------------------------------------------------

describe("parsePageParam", () => {
  it("returns fallback for undefined", () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  it("returns fallback for null", () => {
    expect(parsePageParam(null)).toBe(1);
  });

  it("returns fallback for empty string", () => {
    expect(parsePageParam("")).toBe(1);
  });

  it("returns fallback for non-numeric string", () => {
    expect(parsePageParam("abc")).toBe(1);
  });

  it("returns fallback for 0", () => {
    expect(parsePageParam("0")).toBe(1);
  });

  it("returns fallback for negative numbers", () => {
    expect(parsePageParam("-3")).toBe(1);
  });

  it("returns parsed page number for valid input", () => {
    expect(parsePageParam("2")).toBe(2);
    expect(parsePageParam("5")).toBe(5);
  });

  it("accepts custom fallback", () => {
    expect(parsePageParam(undefined, 3)).toBe(3);
    expect(parsePageParam("invalid", 7)).toBe(7);
  });

  it("parses numeric string with whitespace", () => {
    expect(parsePageParam("  3  ")).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// generatePageNumbers()
// ---------------------------------------------------------------------------

describe("generatePageNumbers", () => {
  it("returns all pages when total <= maxVisible", () => {
    expect(generatePageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(generatePageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(generatePageNumbers(2, 1)).toEqual([1]);
  });

  it("returns all pages when total <= maxVisible (no ellipsis)", () => {
    const pages = generatePageNumbers(1, 4);
    expect(pages).not.toContain("...");
  });

  it("includes ellipsis when total > maxVisible", () => {
    const pages = generatePageNumbers(5, 10);
    expect(pages).toContain("...");
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(10);
  });

  it("always shows first and last page", () => {
    const pages = generatePageNumbers(5, 10);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(10);
  });

  it("positions window around current page", () => {
    // Current page 2 of 10: window of 3 pages (2,3,4) around current
    const pages1 = generatePageNumbers(2, 10);
    expect(pages1).toEqual([1, 2, 3, 4, "...", 10]);

    // Current page 9 of 10: window re-anchored near the end
    const pages2 = generatePageNumbers(9, 10);
    expect(pages2).toEqual([1, "...", 7, 8, 9, 10]);
  });

  it("handles single page (totalPages=1)", () => {
    expect(generatePageNumbers(1, 1)).toEqual([1]);
  });
});
