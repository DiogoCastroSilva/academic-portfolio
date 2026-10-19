"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileMenuButton } from "../ui/MobileMenuButton.js";
import { MobileNavLinks } from "../ui/MobileNavLinks.js";
import { getNavigation, isPathActive, type NavigationItem } from "./config.js";

export type { NavigationItem };

type NavBarProps = {
  currentPath?: string;
  /** Display name shown in the NavBar brand link. */
  name?: string;
  /** Override navigation items (e.g. conditionally hide Blog). */
  items?: NavigationItem[];
};

export function NavBar({
  currentPath,
  name = "Portfolio",
  items: navItems,
}: NavBarProps) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const isHome = activePath === "/" || activePath === "";
  const items = navItems ?? getNavigation(true);

  return (
    <nav
      className="relative after:pointer-events-none after:absolute after:inset-x-0"
      aria-label="Main"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link
                href="/"
                aria-current={isHome ? "page" : undefined}
                className="aria-current/page:border-b-2 aria-current/page:border-white transition-all duration-200 hover:text-cyan-200 focus-visible:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:text-white"
              >
                {name}
              </Link>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="hidden space-x-4 md:flex">
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={
                    isPathActive(activePath, item.href) ? "page" : undefined
                  }
                  className="aria-current/page:border-b-2 aria-current/page:border-white transition-all duration-200 hover:text-cyan-200 focus-visible:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <MobileMenuButton
              isMenuOpen={isMenuOpen}
              onToggleMenu={toggleMenu}
            />
          </div>
        </div>
      </div>
      <MobileNavLinks
        currentPath={activePath}
        isMenuOpen={isMenuOpen}
        onNavigate={() => setIsMenuOpen(false)}
        items={items}
      />
    </nav>
  );
}
