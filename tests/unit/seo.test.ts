/** 文件职责：验证 canonical、真实 hreflang 与结构化数据只使用可见事实。 */
import { describe, expect, it } from "vitest";
import { buildAlternates } from "@/lib/seo/metadata";
import { buildRobotsText, buildSitemapXml } from "@/lib/seo/crawl-files";
import { buildWebsiteJsonLd } from "@/lib/seo/structured-data";

describe("SEO helpers", () => {
  it("omits hreflang when no translated entity exists", () => {
    expect(buildAlternates("/en/levels/1/")).toEqual({ canonical: "/en/levels/1/" });
  });

  it("maps only explicitly supplied translation paths", () => {
    expect(
      buildAlternates("/en/levels/1/", [{ locale: "zh-cn", path: "/zh-cn/levels/1/" }]),
    ).toEqual({
      canonical: "/en/levels/1/",
      languages: { "zh-cn": "/zh-cn/levels/1/" },
    });
  });

  it("keeps the WebSite search target aligned with the real query parameter", () => {
    expect(JSON.stringify(buildWebsiteJsonLd("en"))).toContain("search_term_string");
    expect(JSON.stringify(buildWebsiteJsonLd("en"))).toContain("/en/search/?q=");
  });

  it("keeps drafts out of Sitemap and search out of robots", () => {
    const xml = buildSitemapXml(
      [
        { locale: "en", levelNumber: 1, status: "published" },
        { locale: "en", levelNumber: 2, status: "draft" },
      ] as never,
      [],
    );
    expect(xml).toContain("/en/levels/1/");
    expect(xml).not.toContain("/en/levels/2/");
    expect(buildRobotsText()).toContain("Disallow: /*/search/");
  });
});
