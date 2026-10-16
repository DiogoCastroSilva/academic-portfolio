import { vi } from "vitest";

// Mock next/navigation globally for all navigation tests
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));
