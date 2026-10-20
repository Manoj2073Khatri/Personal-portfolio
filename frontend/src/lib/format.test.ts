import { describe, expect, it } from "vitest";
import { formatRange, isExternal, safeHref } from "./format";

describe("safeHref", () => {
  it.each(["https://example.com", "http://example.com/a", "mailto:me@example.com", "/articles", "#projects"])(
    "allows %s",
    (url) => expect(safeHref(url)).toBe(url),
  );

  it.each(["javascript:alert(1)", "JAVASCRIPT:alert(1)", "data:text/html,<script>", "//evil.com", "vbscript:x", "not a url", "", null, undefined])(
    "rejects %s",
    (url) => expect(safeHref(url)).toBeUndefined(),
  );
});

describe("formatRange", () => {
  it("formats month ranges and current roles", () => {
    expect(formatRange("2023-05-01T00:00:00.000Z", null, { current: true })).toBe("May 2023 – Present");
    expect(formatRange("2021-12-01T00:00:00.000Z", "2023-03-31T00:00:00.000Z")).toBe("Dec 2021 – Mar 2023");
  });

  it("formats year ranges and collapses identical ends", () => {
    expect(formatRange("2016-01-01T00:00:00.000Z", "2020-12-31T00:00:00.000Z", { yearsOnly: true })).toBe("2016 – 2020");
    expect(formatRange("2020-01-01T00:00:00.000Z", "2020-06-01T00:00:00.000Z", { yearsOnly: true })).toBe("2020");
  });

  it("handles missing dates", () => {
    expect(formatRange(null, null)).toBe("");
    expect(formatRange(null, "2020-06-01T00:00:00.000Z", { yearsOnly: true })).toBe("2020");
  });
});

it("isExternal detects absolute http(s) URLs", () => {
  expect(isExternal("https://x.com")).toBe(true);
  expect(isExternal("/about")).toBe(false);
});
