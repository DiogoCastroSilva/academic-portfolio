# Shared Test Helpers

This directory provides shared utilities for testing across the workspace.

## Available Modules

### `@academic-portfolio/utils/test-helpers/a11y`

```ts
import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";

// Run after rendering your component
const { container } = render(<MyComponent />);
await expectNoA11yViolations(container);
```

Throws a descriptive error listing any accessibility violations found by axe-core.

### `@academic-portfolio/utils/test-helpers/next-mocks`

```ts
import { mockNextLink } from "@academic-portfolio/utils/test-helpers/next-mocks";

// In your test-setup.ts
vi.mock("next/link", () => mockNextLink);
```

Renders an `<a>` element with forwarded props, suitable for testing components that use Next.js Link.

## Note for `libs/navigation`

The navigation library cannot import from `@academic-portfolio/utils` due to Nx module boundary rules. It maintains local copies of these helpers in `libs/navigation/src/lib/test-utils/`.
