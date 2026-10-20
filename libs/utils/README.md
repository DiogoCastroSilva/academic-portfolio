# @academic-portfolio/utils

Shared utility functions used across the application.

## Exports

- `dates` — Date formatting helpers (`formatISODate`, etc.)

## Usage

```ts
import { dates } from "@academic-portfolio/utils";

const formatted = dates.formatISODate("2025-11-01");
```

This library has no UI components. Its date-formatting utility is pure TypeScript; the test-helper modules have their own tests under `src/test-helpers/`. Add focused tests for date formatting as its behavior becomes more complex or more date cases are supported.
