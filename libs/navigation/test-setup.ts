import { vi } from "vitest";

// Mock next/navigation globally for all navigation tests
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// happy-dom does not implement window.matchMedia; provide a minimal mock
// so that components using the theme hook work in tests.
// Guard for node-environment tests that don't have a `window` object.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
