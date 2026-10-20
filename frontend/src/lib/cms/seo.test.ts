import { describe, expect, it } from "vitest";
import { contentMetadata, metaDescription } from "./seo";
import type { SiteSettings } from "./types";

const settings = {
  name: "Manoj Khatri",
  seoDescription: "Default description",
  ogImage: null,
  profileImage: { id: "p", kind: "IMAGE", url: "https://cdn.test/me.jpg", alt: "", mimeType: "image/jpeg", width: null, height: null },
} as unknown as SiteSettings;

describe("metaDescription", () => {
  it("uses the first non-empty candidate and collapses whitespace", () => {
    expect(metaDescription(null, "  ", "First\n\nreal   text")).toBe("First real text");
  });

  it("trims long text on a word boundary to about 160 characters", () => {
    const out = metaDescription("word ".repeat(60))!;
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });

  it("returns undefined when nothing is usable", () => {
    expect(metaDescription(undefined, "")).toBeUndefined();
  });
});

describe("contentMetadata", () => {
  it("builds canonical, Open Graph article data and falls back to the profile image", () => {
    const meta = contentMetadata({
      settings,
      title: "Post",
      description: "About the post",
      path: "/articles/post",
      type: "article",
      publishedTime: "2026-01-01T00:00:00.000Z",
      tags: ["react"],
    });
    expect(meta.alternates?.canonical).toBe("/articles/post");
    expect(meta.robots).toBeUndefined();
    expect(meta.openGraph).toMatchObject({ type: "article", url: "/articles/post", tags: ["react"], images: [{ url: "https://cdn.test/me.jpg" }] });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("honours a cross-post canonical URL and noindex", () => {
    const meta = contentMetadata({ settings, title: "Post", path: "/articles/post", canonical: "https://dev.to/me/post", noIndex: true });
    expect(meta.alternates?.canonical).toBe("https://dev.to/me/post");
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.description).toBe("Default description");
  });
});
