import type { Testimonial } from "@/lib/cms/types";
import { CmsImage, Initials } from "./cms-image";

type Item = Omit<Testimonial, "status">;

export function TestimonialList({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 sm:grid-cols-2 sm:gap-x-3 sm:divide-x sm:divide-y-0 dark:divide-neutral-700 dark:border-neutral-700">
      {items.map((item) => {
        const byline = [item.authorTitle, item.authorCompany].filter(Boolean).join(", ");
        return (
          <figure key={item.id} className="py-6 sm:px-4 sm:first:-ms-4">
            <blockquote className="text-sm text-gray-800 dark:text-neutral-200">{item.quote}</blockquote>
            <figcaption className="mt-3 flex items-center gap-x-2">
              <CmsImage
                media={item.avatar}
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0 rounded-full object-cover"
                fallback={<Initials name={item.authorName} className="size-5 text-[8px]" />}
              />
              <span className="text-xs text-gray-500 dark:text-neutral-500">
                {item.authorName}
                {byline && <span className="text-gray-400 dark:text-neutral-600"> · {byline}</span>}
              </span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
