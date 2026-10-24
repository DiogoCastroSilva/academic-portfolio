import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex h-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="bg-surface-card ring-border rounded-3xl p-10 shadow-sm ring-1">
        <p className="text-link text-sm font-semibold tracking-[0.3em] uppercase">
          404
        </p>
        <h1 className="text-text-primary mt-4 text-4xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="text-text-secondary mt-4 max-w-xl text-base leading-7">
          The page you are looking for does not exist or has been moved. Please
          check the URL or return to the homepage.
        </p>
        <Link
          href="/"
          className="bg-accent text-text-on-accent hover:bg-accent-hover focus-visible:outline-focus mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
