"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { FormActions } from "@/components/admin/form-actions";
import { Field, FormSection } from "@/components/admin/form-fields";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { SeoPanel } from "@/components/admin/seo-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { nullIfEmpty, useEntityForm } from "@/lib/admin/use-entity-form";
import type { HomepageSection, HomepageSectionKey, MediaRef, NavLink, SiteSettings, SocialLink } from "@/lib/cms/types";

const PLATFORMS: SocialLink["platform"][] = ["github", "linkedin", "x", "email", "website", "dribbble", "youtube", "other"];

const SECTION_LABEL: Record<HomepageSectionKey, string> = {
  projects: "Projects",
  testimonials: "Testimonials",
  skills: "Skills",
  experience: "Work experience",
  education: "Education",
  certifications: "Certifications",
  articles: "Articles",
  contact: "Contact form",
};

type Values = {
  name: string;
  title: string;
  intro: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  resumeUrl: string;
  resumeMedia: MediaRef | null;
  profileImage: MediaRef | null;
  socialLinks: SocialLink[];
  navigation: NavLink[];
  footerText: string;
  homepageSections: HomepageSection[];
  seoTitle: string;
  seoDescription: string;
  siteUrl: string;
  ogImage: MediaRef | null;
};

const initial = (s: SiteSettings): Values => ({
  name: s.name,
  title: s.title,
  intro: s.intro,
  bio: s.bio,
  email: s.email ?? "",
  phone: s.phone ?? "",
  location: s.location ?? "",
  // resumeUrl in the response is the effective URL; keep the raw field only when no file is set.
  resumeUrl: s.resumeMedia ? "" : s.resumeUrl ?? "",
  resumeMedia: s.resumeMedia,
  profileImage: s.profileImage,
  socialLinks: s.socialLinks,
  navigation: s.navigation,
  footerText: s.footerText,
  homepageSections: s.homepageSections,
  seoTitle: s.seoTitle ?? "",
  seoDescription: s.seoDescription ?? "",
  siteUrl: s.siteUrl ?? "",
  ogImage: s.ogImage,
});

const toPayload = (v: Values) => ({
  name: v.name.trim(),
  title: v.title.trim(),
  intro: v.intro,
  bio: v.bio,
  email: nullIfEmpty(v.email),
  phone: nullIfEmpty(v.phone),
  location: nullIfEmpty(v.location),
  resumeUrl: nullIfEmpty(v.resumeUrl),
  resumeMediaId: v.resumeMedia?.id ?? null,
  profileImageId: v.profileImage?.id ?? null,
  socialLinks: v.socialLinks.filter((l) => l.url.trim()).map((l) => ({ ...l, label: l.label.trim() || l.platform })),
  navigation: v.navigation.filter((n) => n.label.trim() && n.href.trim()),
  footerText: v.footerText,
  homepageSections: v.homepageSections,
  seoTitle: nullIfEmpty(v.seoTitle),
  seoDescription: nullIfEmpty(v.seoDescription),
  siteUrl: nullIfEmpty(v.siteUrl),
  ogImageId: v.ogImage?.id ?? null,
});

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const next = [...list];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const form = useEntityForm<Values, SiteSettings>(initial(settings), { endpoint: "settings", singleton: true, toPayload });
  const { values: v, set, errorFor } = form;

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.save(); }} className="grid gap-6">
      <FormSection title="Profile" description="The introduction at the top of the homepage.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required error={errorFor("name")}>
            {(p) => <Input {...p} value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={100} required />}
          </Field>
          <Field label="Professional title" error={errorFor("title")}>
            {(p) => <Input {...p} value={v.title} onChange={(e) => set("title", e.target.value)} maxLength={150} />}
          </Field>
        </div>
        <Field label="Profile photo" error={errorFor("profileImageId")}>
          {() => <MediaPicker value={v.profileImage} onChange={(m) => set("profileImage", m)} />}
        </Field>
        <Field label="Introduction" hint="Optional one-liner shown above the bio." error={errorFor("intro")}>
          {(p) => <Textarea {...p} value={v.intro} onChange={(e) => set("intro", e.target.value)} maxLength={500} rows={2} />}
        </Field>
        <Field label="Bio" hint="Markdown." error={errorFor("bio")}>
          {(p) => <MarkdownEditor {...p} value={v.bio} onChange={(x) => set("bio", x)} rows={10} variant="compact" />}
        </Field>
      </FormSection>

      <FormSection title="Contact & résumé">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Email" error={errorFor("email")}>
            {(p) => <Input {...p} type="email" value={v.email} onChange={(e) => set("email", e.target.value)} />}
          </Field>
          <Field label="Phone" error={errorFor("phone")}>
            {(p) => <Input {...p} value={v.phone} onChange={(e) => set("phone", e.target.value)} maxLength={40} />}
          </Field>
          <Field label="Location" error={errorFor("location")}>
            {(p) => <Input {...p} value={v.location} onChange={(e) => set("location", e.target.value)} maxLength={120} />}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Résumé file (PDF)" hint="Takes precedence over the URL." error={errorFor("resumeMediaId")}>
            {() => <MediaPicker kind="DOCUMENT" value={v.resumeMedia} onChange={(m) => set("resumeMedia", m)} />}
          </Field>
          <Field label="Résumé URL" error={errorFor("resumeUrl")}>
            {(p) => <Input {...p} type="url" value={v.resumeUrl} onChange={(e) => set("resumeUrl", e.target.value)} placeholder="https://" disabled={!!v.resumeMedia} />}
          </Field>
        </div>
        <Field label="Social links" error={errorFor("socialLinks")}>
          {() => (
            <div className="grid gap-2">
              {v.socialLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-[8rem_1fr] gap-1 sm:grid-cols-[8rem_10rem_1fr_auto]">
                  <NativeSelect aria-label="Platform" value={link.platform} onChange={(e) => set("socialLinks", v.socialLinks.map((l, j) => (j === i ? { ...l, platform: e.target.value as SocialLink["platform"] } : l)))}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </NativeSelect>
                  <Input aria-label="Label" placeholder="Label" value={link.label} maxLength={60} onChange={(e) => set("socialLinks", v.socialLinks.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))} />
                  <Input aria-label="URL" placeholder="https:// or mailto:" value={link.url} aria-invalid={!!errorFor(`socialLinks.${i}`)} onChange={(e) => set("socialLinks", v.socialLinks.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))} className="col-span-2 sm:col-span-1" />
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove link" onClick={() => set("socialLinks", v.socialLinks.filter((_, j) => j !== i))}><X /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => set("socialLinks", [...v.socialLinks, { platform: "github", label: "GitHub", url: "" }])}>
                <Plus /> Add link
              </Button>
            </div>
          )}
        </Field>
      </FormSection>

      <FormSection title="Homepage" description="Choose which sections appear and in what order. Empty sections are hidden automatically.">
        <ul className="divide-y rounded-lg border">
          {v.homepageSections.map((section, i) => (
            <li key={section.key} className="flex items-center justify-between gap-2 px-3 py-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-primary" checked={section.enabled} onChange={(e) => set("homepageSections", v.homepageSections.map((s, j) => (j === i ? { ...s, enabled: e.target.checked } : s)))} />
                {SECTION_LABEL[section.key]}
              </label>
              <span className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" disabled={i === 0} aria-label={`Move ${SECTION_LABEL[section.key]} up`} onClick={() => set("homepageSections", move(v.homepageSections, i, -1))}><ArrowUp /></Button>
                <Button type="button" variant="ghost" size="icon" disabled={i === v.homepageSections.length - 1} aria-label={`Move ${SECTION_LABEL[section.key]} down`} onClick={() => set("homepageSections", move(v.homepageSections, i, 1))}><ArrowDown /></Button>
              </span>
            </li>
          ))}
        </ul>
      </FormSection>

      <FormSection title="Navigation & footer">
        <Field label="Header links" hint="Paths like /articles, anchors like #projects, or https URLs." error={errorFor("navigation")}>
          {() => (
            <div className="grid gap-2">
              {v.navigation.map((item, i) => (
                <div key={i} className="flex gap-1">
                  <Input aria-label="Link label" placeholder="Label" value={item.label} maxLength={40} onChange={(e) => set("navigation", v.navigation.map((n, j) => (j === i ? { ...n, label: e.target.value } : n)))} className="w-40" />
                  <Input aria-label="Link target" placeholder="/articles" value={item.href} aria-invalid={!!errorFor(`navigation.${i}`)} onChange={(e) => set("navigation", v.navigation.map((n, j) => (j === i ? { ...n, href: e.target.value } : n)))} />
                  <Button type="button" variant="ghost" size="icon" disabled={i === 0} aria-label="Move up" onClick={() => set("navigation", move(v.navigation, i, -1))}><ArrowUp /></Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => set("navigation", v.navigation.filter((_, j) => j !== i))}><X /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-fit" disabled={v.navigation.length >= 10} onClick={() => set("navigation", [...v.navigation, { label: "", href: "/" }])}>
                <Plus /> Add link
              </Button>
            </div>
          )}
        </Field>
        <Field label="Footer text" error={errorFor("footerText")}>
          {(p) => <Input {...p} value={v.footerText} onChange={(e) => set("footerText", e.target.value)} maxLength={300} />}
        </Field>
      </FormSection>

      <SeoPanel
        values={v}
        onChange={(k, x) => set(k as keyof Values, x as never)}
        errorFor={errorFor}
        path="/"
        fallbackTitle={[v.name, v.title].filter(Boolean).join(" — ")}
        fallbackDescription=""
        fallbackImageLabel="profile photo"
        siteName=""
      />
      <FormSection title="Site address">
        <Field label="Site URL" hint="Canonical origin, e.g. https://www.example.com. Set NEXT_PUBLIC_SITE_URL to the same value." error={errorFor("siteUrl")}>
          {(p) => <Input {...p} type="url" value={v.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} placeholder="https://" />}
        </Field>
      </FormSection>

      <FormActions onSave={() => void form.save()} saving={form.saving} dirty={form.dirty} savedAt={form.savedAt} formError={form.formError} />
    </form>
  );
}
