"use client";

import { PageContainer } from "@/components/site/section";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageContainer>
      <h1 className="text-lg font-medium text-gray-800 dark:text-neutral-200">This page couldn’t load</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
        The content service didn’t respond. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900 dark:bg-white dark:text-neutral-800"
      >
        Try again
      </button>
    </PageContainer>
  );
}
