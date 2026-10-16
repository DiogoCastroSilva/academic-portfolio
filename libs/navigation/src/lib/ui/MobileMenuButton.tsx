"use client";

type MobileMenuButtonProps = {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
};

export function MobileMenuButton({
  isMenuOpen,
  onToggleMenu,
}: MobileMenuButtonProps) {
  return (
    <div className="-mr-2 flex md:hidden">
      <button
        type="button"
        className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        onClick={onToggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
      >
        <span className="absolute -inset-0.5"></span>
        <span className="sr-only">
          {isMenuOpen ? "Close main menu" : "Open main menu"}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          data-slot="icon"
          aria-hidden="true"
          className={`size-6 ${isMenuOpen ? "hidden" : "block"}`}
        >
          <path
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          data-slot="icon"
          aria-hidden="true"
          className={`size-6 ${isMenuOpen ? "block" : "hidden"}`}
        >
          <path
            d="M6 18 18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
