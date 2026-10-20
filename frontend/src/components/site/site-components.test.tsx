import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ArticleSummary, MediaRef } from "@/lib/cms/types";
import { ArticleList } from "./article-list";
import { CmsImage, Initials } from "./cms-image";
import { Markdown } from "./markdown";
import { ProjectGrid } from "./project-grid";
import { SiteFooter } from "./site-footer";

const image: MediaRef = { id: "m1", kind: "IMAGE", url: "https://cdn.test/a.png", alt: "Alt text", mimeType: "image/png", width: 10, height: 10 };

describe("Markdown", () => {
  it("renders formatting but never raw HTML", () => {
    const { container } = render(<Markdown>{"**bold** <script>alert(1)</script> <img src=x onerror=alert(1)>"}</Markdown>);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("neutralises javascript: links and opens external links safely", () => {
    render(<Markdown>{"[bad](javascript:alert(1)) [ext](https://example.com) [int](/articles)"}</Markdown>);
    expect(screen.getByText("bad").closest("a")).toBeNull();
    const ext = screen.getByText("ext").closest("a")!;
    expect(ext.getAttribute("rel")).toContain("noopener");
    expect(ext.getAttribute("target")).toBe("_blank");
    expect(screen.getByText("int").closest("a")?.getAttribute("href")).toBe("/articles");
  });
});

describe("CmsImage", () => {
  it("renders the fallback when there is no media", () => {
    render(<CmsImage media={null} fallback={<Initials name="Manoj Khatri" />} />);
    expect(screen.getByText("MK")).toBeTruthy();
  });

  it("switches to the fallback when the image fails to load", () => {
    render(<CmsImage media={image} fallback={<span>fallback</span>} />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("fallback")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});

describe("empty and optional content", () => {
  it("project cards work without images or summaries", () => {
    render(<ProjectGrid projects={[{ slug: "p", title: "Project P", summary: "", thumbnail: null }]} />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/projects/p");
    expect(screen.getAllByText("Project P").length).toBeGreaterThan(0);
  });

  it("article list groups by year and handles undated items", () => {
    const base: ArticleSummary = { id: "1", title: "A", slug: "a", excerpt: "", tags: [], readingTimeMinutes: 3, publishedAt: "2025-03-02T00:00:00.000Z", coverImage: null, updatedAt: "" };
    render(<ArticleList articles={[base, { ...base, id: "2", title: "B", slug: "b", publishedAt: "2024-01-01T00:00:00.000Z" }, { ...base, id: "3", title: "C", slug: "c", publishedAt: null }]} />);
    expect(screen.getByText("2025")).toBeTruthy();
    expect(screen.getByText("2024")).toBeTruthy();
    expect(screen.getByText("Undated")).toBeTruthy();
    expect(screen.getAllByText("3 min read")).toHaveLength(3);
  });

  it("footer renders nothing when there is no content and drops unsafe links", () => {
    const { container } = render(<SiteFooter footerText="" socialLinks={[]} />);
    expect(container.innerHTML).toBe("");
    render(<SiteFooter footerText="© Me" socialLinks={[{ platform: "other", label: "Evil", url: "javascript:alert(1)" }]} />);
    expect(screen.getByText("© Me")).toBeTruthy();
    expect(screen.queryByText("Evil")).toBeNull();
  });
});
