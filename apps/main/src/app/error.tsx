"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="bg-surface-card ring-border rounded-3xl p-10 shadow-sm ring-1">
        <p className="text-text-error text-sm font-semibold tracking-[0.3em] uppercase">
          Something went wrong
        </p>
        <h1 className="text-text-primary mt-4 text-4xl font-bold tracking-tight">
          Unexpected error
        </h1>
        <p className="text-text-secondary mt-4 max-w-xl text-base leading-7">
          Sorry, we couldn’t load this page. Please try again or return to the
          homepage.
        </p>
        {process.env.NODE_ENV === "development" && error instanceof Error && (
          <pre className="text-text-error mt-4 max-w-xl text-left text-xs">
            {error.stack}
          </pre>
        )}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-accent text-text-on-accent hover:bg-accent-hover focus-visible:outline-focus inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Retry
          </button>
          <Link
            href="/"
            className="border-border bg-surface-card text-text-primary hover:bg-surface-tinted focus-visible:outline-focus inline-flex rounded-full border px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
