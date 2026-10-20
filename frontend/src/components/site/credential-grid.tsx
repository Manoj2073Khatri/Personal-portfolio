import type { Credential } from "@/lib/cms/types";
import { formatRange, safeHref } from "@/lib/format";
import { CmsImage, Initials } from "./cms-image";

type Item = Omit<Credential, "status">;

export function CredentialGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const verify = safeHref(item.credentialUrl);
        const subtitle = [item.institution, item.location].filter(Boolean).join(", ");
        return (
          <div key={item.id} className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <CmsImage
              media={item.logo}
              alt={`${item.institution} logo`}
              width={48}
              height={48}
              className="mb-3 size-12 shrink-0 object-contain"
              fallback={<Initials name={item.institution} className="mb-3 size-12 rounded-lg" />}
            />
            <p className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
              {formatRange(item.startDate, item.endDate, { yearsOnly: true })}
            </p>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
              {item.title}
              {item.field && <span className="font-normal"> · {item.field}</span>}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">{subtitle}</p>
            {item.description && <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">{item.description}</p>}
            {verify && (
              <a
                href={verify}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-gray-500 underline hover:text-gray-800 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                Verify credential{item.credentialId ? ` (${item.credentialId})` : ""}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
