import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CmsApiError } from "./errors";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("public CMS client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("CMS_API_URL", "http://api.test/api/v1/");
    vi.stubEnv("INTERNAL_API_KEY", "k".repeat(40));
  });
  afterEach(() => vi.unstubAllEnvs());

  it("requests published content with the cache tag and internal key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, { slug: "post" }));
    const { getArticle } = await import("./public-api");
    await expect(getArticle("post")).resolves.toEqual({ slug: "post" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next: { tags: string[] } }];
    expect(url).toBe("http://api.test/api/v1/public/articles/post");
    expect(init.next.tags).toContain("cms");
    expect((init.headers as Record<string, string>)["x-internal-api-key"]).toHaveLength(40);
  });

  it("maps 404 to null so pages can render notFound()", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(404, { statusCode: 404, message: "Article not found" }));
    const { getArticle } = await import("./public-api");
    await expect(getArticle("missing")).resolves.toBeNull();
  });

  it("throws CmsApiError for other failures so cached pages are not replaced with errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(500, { statusCode: 500, message: "boom" }));
    const { getHome } = await import("./public-api");
    await expect(getHome()).rejects.toMatchObject({ status: 500, message: "boom" });
  });

  it("fails clearly when CMS_API_URL is missing", async () => {
    vi.stubEnv("CMS_API_URL", "");
    const { getSiteSettings } = await import("./public-api");
    await expect(getSiteSettings()).rejects.toThrow(/CMS_API_URL/);
  });
});

describe("CmsApiError", () => {
  it("extracts field errors from validation responses", async () => {
    const error = await CmsApiError.fromResponse(
      jsonResponse(400, { statusCode: 400, message: "Validation failed", errors: { title: ["title is required"] } }),
    );
    expect(error.status).toBe(400);
    expect(error.fieldErrors.title).toEqual(["title is required"]);
  });

  it("copes with non-JSON error bodies", async () => {
    const error = await CmsApiError.fromResponse(new Response("<html>Bad gateway</html>", { status: 502, statusText: "Bad Gateway" }));
    expect(error.message).toBe("Bad Gateway");
  });
});
