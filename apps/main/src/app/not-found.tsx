import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex h-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
        <p className="text-sm font-semibold tracking-[0.3em] text-sky-600 uppercase dark:text-sky-400">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
          The page you are looking for does not exist or has been moved. Please
          check the URL or return to the homepage.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
