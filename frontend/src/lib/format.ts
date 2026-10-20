const monthYear = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function formatMonthYear(iso: string | null | undefined): string {
  return iso ? monthYear.format(new Date(iso)) : "";
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? fullDate.format(new Date(iso)) : "";
}

export function yearOf(iso: string | null | undefined): string {
  return iso ? String(new Date(iso).getUTCFullYear()) : "";
}

/** "May 2023 – Present", "2016 – 2020", or a single date. */
export function formatRange(
  start: string | null | undefined,
  end: string | null | undefined,
  { current = false, yearsOnly = false } = {},
): string {
  const fmt = yearsOnly ? yearOf : formatMonthYear;
  const from = fmt(start);
  const to = current ? "Present" : fmt(end);
  if (from && to) return from === to ? from : `${from} – ${to}`;
  return from || to;
}

/** Only http(s), mailto and site-relative links are ever rendered as hrefs. */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (url.startsWith("#")) return url;
  try {
    const { protocol } = new URL(url);
    return ["http:", "https:", "mailto:"].includes(protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
