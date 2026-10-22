"use client";

import Link from "next/link";
import {
  getNavigation,
  isPathActive,
  type NavigationItem,
} from "../feature/config.js";
import { ThemeToggle } from "./ThemeToggle.js";

type MobileNavLinksProps = {
  currentPath?: string;
  isMenuOpen: boolean;
  onNavigate?: () => void;
  /** Override navigation items (e.g. conditionally hide Blog). */
  items?: NavigationItem[];
};

export function MobileNavLinks({
  currentPath,
  isMenuOpen,
  onNavigate,
  items: navItems,
}: MobileNavLinksProps) {
  const items = navItems ?? getNavigation(true);
  return (
    <div
      id="mobile-navigation"
      className="space-y-1 px-2 pt-2 pb-3 sm:px-3 md:hidden"
      hidden={!isMenuOpen}
    >
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          aria-current={
            isPathActive(currentPath, item.href) ? "page" : undefined
          }
          className="aria-current/page:border-l-2 aria-current/page:border-sky-600 dark:aria-current/page:border-sky-400 flex min-h-11 items-center border-l-2 px-3 py-3 text-base leading-relaxed font-medium transition-colors duration-200 hover:bg-white/5 hover:text-sky-600 focus-visible:bg-white/5 focus-visible:text-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-white"
          onClick={onNavigate}
        >
          {item.name}
        </Link>
      ))}
      {/* Theme toggle in mobile menu — only visible on small screens
          (the `md:hidden` class on the parent container ensures the
          desktop-only toggle in NavBar doesn't duplicate at ≥md). */}
      <div className="flex items-center justify-start border-l-2 border-transparent px-3 py-3">
        <ThemeToggle />
      </div>
    </div>
  );
}
