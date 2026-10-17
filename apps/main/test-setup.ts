import "@testing-library/jest-dom";
import { vi } from "vitest";

import { mockNextLink } from "@katie-portfolio/utils/test-helpers/next-mocks";

// Mock next/link globally for component tests in happy-dom environment.
// Renders an <a> element and forwards all props (including aria-* attributes).
vi.mock("next/link", () => mockNextLink);
