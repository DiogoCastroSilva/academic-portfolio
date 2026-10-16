# Accessibility Testing Guide

This document explains how to write and run accessibility (a11y) tests using Vitest-Axe.

## Overview

The project uses **Vitest-Axe** to run automated accessibility audits on components during unit testing. This approach allows catching WCAG violations early in the development cycle, right alongside other unit tests.

### Key Dependencies

| Package                     | Version    | Purpose                                                         |
| --------------------------- | ---------- | --------------------------------------------------------------- |
| `vitest-axe`                | `^0.1.0`   | Vitest integration for axe-core                                 |
| `happy-dom`                 | `^15.11.7` | DOM environment for tests (provides browser-like APIs)          |
| `@testing-library/dom`      | `^10.4.2`  | DOM testing utilities (peer dep of `@testing-library/jest-dom`) |
| `@testing-library/jest-dom` | `^7.0.1`   | Custom DOM matchers like `toBeInTheDocument()`                  |

> **Note:** `axe-core` is **not** listed as a direct dependency — it comes in transitively via `vitest-axe`.

## Running A11y Tests

### Run all tests

```bash
npx nx run-many --target=test --all
```

### Run navigation library tests only

```bash
npx nx run navigation:test
```

### Run with verbose output (to see individual test names)

```bash
npx nx run navigation:test --verbose
```

## Writing A11y Tests

### Basic Pattern

A typical accessibility test file follows this structure:

```tsx
/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { axe } from "vitest-axe";

import { MyComponent } from "./MyComponent.js";

// Mock next/navigation if needed
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Helper to check for no violations
function expectNoViolations(results: { violations: unknown[] }) {
  expect(results.violations).toHaveLength(0);
}

describe("MyComponent accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expectNoViolations(results);
  });
});
```

### What `@vitest-environment happy-dom` Does

The docblock pragma `@vitest-environment happy-dom` tells Vitest to run the test file in a browser-like environment (as opposed to the default Node environment). This is required for:

- React component rendering
- DOM APIs (`render`, `screen`, `fireEvent`)
- `axe()` scanning of rendered DOM

### Why `@testing-library/jest-dom`?

The `@testing-library/jest-dom` package provides custom matchers like:

- `toBeInTheDocument()`
- `toHaveAttribute()`
- `toHaveTextContent()`
- `toBeDisabled()`, `toBeChecked()`, etc.

Import it once at the top of each test file that uses these matchers:

```tsx
import "@testing-library/jest-dom";
```

### Testing Interactive States

For components with interactive states (dropdowns, modals, expanded menus), test all states:

```tsx
it("has no violations when menu is open", async () => {
  const { container } = render(<NavBar currentPath="/" />);
  const menuButton = screen.getByRole("button");
  fireEvent.click(menuButton); // Open the menu

  const results = await axe(container);
  expectNoViolations(results);
});
```

### Mocking Next.js Modules

Components that use Next.js modules like `next/navigation` or `next/link` need to be mocked for happy-dom testing:

```tsx
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));
```

## Common Accessibility Violations and Fixes

### `aria-hidden-focus`

**Problem:** An element with `aria-hidden="true"` contains focusable children.

**Fix:** Use the native `hidden` attribute instead of `aria-hidden`:

```tsx
// ❌ Before — aria-hidden with focusable children
<div aria-hidden={!isMenuOpen}>
  <a href="/link">Link</a>
</div>

// ✅ After — native hidden attribute removes from tab order
<div hidden={!isMenuOpen}>
  <a href="/link">Link</a>
</div>
```

### `color-contrast`

**Problem:** Text color doesn't have sufficient contrast against its background.

**Fix:** Ensure a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.

### Missing `alt` Attributes

**Problem:** `img` elements lack descriptive `alt` text.

**Fix:** Always provide an `alt` attribute:

```tsx
// ✅ Meaningful alt text
<img src="/photo.jpg" alt="Project screenshot" />

// ✅ Empty alt for decorative images
<img src="/decoration.svg" alt="" />
```

## Troubleshooting

### Error: `Cannot find package 'axe-core'`

This means `axe-core` was accidentally removed from `node_modules`. It should be installed transitively via `vitest-axe`. Run:

```bash
npm install
```

### Error: `Cannot find package '@testing-library/dom'`

`@testing-library/dom` must be at the root `node_modules` level (not nested under `@testing-library/jest-dom`) because it's imported from the ESM build of `@testing-library/jest-dom`. Ensure it's a direct dev dependency in the root `package.json`.

### Tests pass locally but fail in CI

- Ensure the `@vitest-environment happy-dom` pragma is at the top of each test file
- Verify all mocks are set up correctly for Next.js modules
- Check that `happy-dom` is listed in devDependencies

## References

- [Axe Core Rules](https://www.deque.com/axe/core-documentation/)
- [Vitest-Axe GitHub](https://github.com/lkalebbs/vitest-axe)
- [Testing Library Docs](https://testing-library.com/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
