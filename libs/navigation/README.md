# @katie-portfolio/navigation

Navigation configuration and NavBar component for the portfolio site.

## Exports

- `navigation` — Array of navigation items (`{ name, href }`)
- `NavBar` — Client-side navigation bar with mobile menu

## Usage

```tsx
import { NavBar, navigation } from "@katie-portfolio/navigation";
```

The NavBar component is a client component (uses `usePathname` and `useState` hooks).
MobileMenuButton and MobileNavLinks are client components for mobile navigation.

## Configuration

Navigation items are defined in `src/lib/feature/config.ts`:

| Name         | Href            |
| ------------ | --------------- |
| Projects     | `/projects`     |
| Publications | `/publications` |
| About        | `/about`        |

To add a new navigation item, add an entry to the `navigation` array.

## Tests

```bash
npx nx run @katie-portfolio/navigation:test
```

Runs Vitest tests validating the navigation configuration structure.
