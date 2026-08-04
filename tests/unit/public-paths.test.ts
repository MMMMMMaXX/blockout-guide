/** 文件职责：验证公共路径只包含静态首页和已发布真实实体，且覆盖所有语言。 */
import { describe, expect, it } from "vitest";
import { getPublicPaths, staticPublicPaths } from "@/lib/routing/public-paths";
import type { EditorialArticle, LevelArticle } from "@/lib/content/types";

describe("getPublicPaths", () => {
  it("excludes draft and archived levels but lists the published level in every locale", () => {
    const levels = [
      { locale: "en", levelNumber: 1, status: "draft" },
      { locale: "en", levelNumber: 2, status: "archived" },
      { locale: "en", levelNumber: 3, status: "published", difficulty: "easy" },
    ] as LevelArticle[];
    const paths = getPublicPaths(levels);
    expect(paths).not.toContain("/en/levels/1/");
    expect(paths).not.toContain("/en/levels/2/");
    // 已发布关卡在所有受支持语言下都可索引。
    expect(paths).toContain("/en/levels/3/");
    expect(paths).toContain("/zh-cn/levels/3/");
    expect(paths).toContain("/tr/levels/3/");
  });

  it("generates a static home/about/legal entry for every supported locale", () => {
    expect(staticPublicPaths).toContain("/en/");
    expect(staticPublicPaths).toContain("/zh-cn/about/");
    expect(staticPublicPaths).toContain("/tr/legal/");
    expect(staticPublicPaths).not.toContain("/en/search/");
  });

  it("adds the hard-level collection for every locale when a published hard level exists", () => {
    const levels = [
      { locale: "en", levelNumber: 14, status: "published", difficulty: "hard" },
    ] as LevelArticle[];
    const paths = getPublicPaths(levels);
    expect(paths).toContain("/en/hard-levels/");
    expect(paths).toContain("/zh-cn/hard-levels/");
  });

  it("includes only published editorial details and their collection (source locale only)", () => {
    const editorial = [
      { locale: "en", kind: "guide", slug: "draft-guide", status: "draft" },
      { locale: "en", kind: "obstacle", slug: "verified-obstacle", status: "published" },
    ] as EditorialArticle[];
    const paths = getPublicPaths([], editorial);
    expect(paths).toContain("/en/obstacles/");
    expect(paths).toContain("/en/obstacles/verified-obstacle/");
    expect(paths).not.toContain("/en/obstacles/draft-guide/");
  });
});
