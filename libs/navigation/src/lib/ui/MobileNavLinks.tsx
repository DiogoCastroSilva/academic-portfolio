"use client";

import Link from "next/link";
import { navigation } from "../feature/config.js";

type MobileNavLinksProps = {
  currentPath?: string;
  isMenuOpen: boolean;
  onNavigate?: () => void;
};

export function MobileNavLinks({
  currentPath,
  isMenuOpen,
  onNavigate,
}: MobileNavLinksProps) {
  return (
    <div
      id="mobile-navigation"
      className={`space-y-1 px-2 pt-2 pb-3 sm:px-3 ${isMenuOpen ? "block" : "hidden"} md:hidden`}
      aria-hidden={!isMenuOpen}
    >
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          aria-current={currentPath === item.href ? "page" : undefined}
          className="block px-3 py-2 text-base font-medium hover:bg-white/5 hover:text-cyan-200 dark:text-white"
          onClick={onNavigate}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
