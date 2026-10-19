"use client";

import Link from "next/link";
import { getNavigation, type NavigationItem } from "../feature/config.js";

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
          aria-current={currentPath === item.href ? "page" : undefined}
          className="aria-current/page:border-l-2 aria-current/page:border-white block px-3 py-2 text-base font-medium transition-all duration-200 hover:bg-white/5 hover:text-cyan-200 focus-visible:bg-white/5 focus-visible:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:text-white"
          onClick={onNavigate}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
