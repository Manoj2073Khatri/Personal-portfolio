import Link from "next/link";

export function Section({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-10 scroll-mt-8 sm:mt-14">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 id={`${id}-heading`} className="font-medium text-gray-800 dark:text-neutral-200">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-gray-800 hover:decoration-highlight dark:text-neutral-500 dark:decoration-neutral-700 dark:hover:text-neutral-300"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main id="content" className="mx-auto w-full max-w-2xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">{children}</main>;
}
