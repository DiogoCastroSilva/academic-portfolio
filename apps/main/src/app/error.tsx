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
      <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        <p className="text-sm font-semibold tracking-[0.3em] text-red-600 uppercase dark:text-red-400">
          Something went wrong
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-200">
          Unexpected error
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Sorry, we couldn’t load this page. Please try again or return to the
          homepage.
        </p>
        {process.env.NODE_ENV === "development" && error instanceof Error && (
          <pre className="mt-4 max-w-xl text-left text-xs text-red-500 dark:text-red-400">
            {error.stack}
          </pre>
        )}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Retry
          </button>
          <Link
            href="/"
            className="dark:bg-slate-850 inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
