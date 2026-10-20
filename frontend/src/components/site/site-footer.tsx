import type { SocialLink } from "@/lib/cms/types";
import { safeHref } from "@/lib/format";

export function SiteFooter({ footerText, socialLinks }: { footerText: string; socialLinks: SocialLink[] }) {
  const links = socialLinks.filter((l) => safeHref(l.url));
  if (!footerText && !links.length) return null;

  return (
    <footer className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="border-t border-gray-200 py-6 dark:border-neutral-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {footerText && <p className="text-xs text-gray-600 dark:text-neutral-400">{footerText}</p>}
          {links.length > 0 && (
            <ul className="flex flex-wrap items-center">
              {links.map((link) => (
                <li
                  key={link.url}
                  className="relative inline-block pe-4 text-xs before:absolute before:end-1.5 before:top-1/2 before:size-[3px] before:-translate-y-1/2 before:rounded-full before:bg-gray-400 last:pe-0 last-of-type:before:hidden dark:before:bg-neutral-600"
                >
                  <a
                    href={safeHref(link.url)}
                    target={link.platform === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:decoration-2 focus:outline-hidden dark:text-neutral-500 dark:hover:text-neutral-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
