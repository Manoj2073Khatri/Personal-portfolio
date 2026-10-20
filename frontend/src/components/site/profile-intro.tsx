import { FaDribbble, FaGithub, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { HiOutlineDocumentText, HiOutlineGlobeAlt, HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import type { IconType } from "react-icons";
import type { SiteSettings, SocialLink } from "@/lib/cms/types";
import { safeHref } from "@/lib/format";
import { CmsImage, Initials } from "./cms-image";
import { Markdown } from "./markdown";

const ICONS: Record<SocialLink["platform"], IconType> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  x: FaXTwitter,
  email: HiOutlineMail,
  website: HiOutlineGlobeAlt,
  dribbble: FaDribbble,
  youtube: FaYoutube,
  other: HiOutlineGlobeAlt,
};

const linkClass =
  "text-[13px] text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:decoration-2 focus:outline-hidden dark:text-neutral-500 dark:hover:text-neutral-400";

export function ProfileIntro({ settings }: { settings: SiteSettings }) {
  const contacts: { icon: IconType; label: string; href?: string }[] = [];
  if (settings.email) contacts.push({ icon: HiOutlineMail, label: settings.email, href: `mailto:${settings.email}` });
  for (const link of settings.socialLinks) {
    const href = safeHref(link.url);
    if (href) contacts.push({ icon: ICONS[link.platform] ?? HiOutlineGlobeAlt, label: link.label || href, href });
  }
  const resume = safeHref(settings.resumeUrl);
  if (resume) contacts.push({ icon: HiOutlineDocumentText, label: "Résumé", href: resume });
  if (settings.location) contacts.push({ icon: HiOutlineLocationMarker, label: settings.location });

  return (
    <section id="intro" aria-label="Introduction">
      <div className="flex items-center gap-x-3">
        <CmsImage
          media={settings.profileImage}
          alt={settings.name}
          width={64}
          height={64}
          priority
          className="size-16 shrink-0 rounded-full object-cover"
          fallback={<Initials name={settings.name} className="size-16 text-base" />}
        />
        <div className="grow">
          <h1 className="text-lg font-medium text-gray-800 dark:text-neutral-200">{settings.name}</h1>
          {settings.title && <p className="text-sm text-gray-600 dark:text-neutral-400">{settings.title}</p>}
        </div>
      </div>

      {(settings.intro || settings.bio) && (
        <div className="mt-8 space-y-3">
          {settings.intro && <p className="text-sm text-gray-800 dark:text-neutral-200">{settings.intro}</p>}
          {settings.bio && <Markdown>{settings.bio}</Markdown>}
        </div>
      )}

      {contacts.length > 0 && (
        <ul className="mt-5 flex flex-col gap-y-3">
          {contacts.map(({ icon: Icon, label, href }) => (
            <li key={label} className="flex items-center gap-x-2.5 text-gray-500 dark:text-neutral-500">
              <Icon aria-hidden="true" className="shrink-0" />
              {href ? (
                <a
                  className={linkClass}
                  href={href}
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {label}
                </a>
              ) : (
                <span className="text-[13px]">{label}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
