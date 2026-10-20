import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col justify-center px-4 sm:px-6 lg:px-8">
      <p className="font-mono text-xs text-gray-500 dark:text-neutral-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
        <span className="highlight-stroke">Page not found</span>
      </h1>
      <p className="mt-3 text-sm text-gray-600 dark:text-neutral-400">
        The link may be out of date, or the page was unpublished.
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="underline decoration-highlight decoration-2 underline-offset-4">
          Go to the homepage
        </Link>
        <Link href="/articles" className="text-gray-500 underline underline-offset-4 dark:text-neutral-400">
          Browse articles
        </Link>
      </div>
    </main>
  );
}
