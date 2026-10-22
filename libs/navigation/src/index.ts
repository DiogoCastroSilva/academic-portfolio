export * from "./lib/feature/NavBar.js";
export {
  THEME_STORAGE_KEY,
  applyThemeAttribute,
  detectSystemTheme,
  resolvePreference,
  useTheme,
  type ResolvedTheme,
  type ThemePreference,
  type UseThemeResult,
} from "./lib/hooks/useTheme.js";
export { themeInitScript } from "./lib/hooks/theme-init.js";
export {
  baseNavigation,
  blogNavigationItem,
  getNavigation,
  isPathActive,
  navigation,
} from "./lib/feature/config.js";
export type { NavigationItem } from "./lib/feature/config.js";
