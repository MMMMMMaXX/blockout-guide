/** 文件职责：验证公共路径只包含静态首页和已发布真实实体。 */
import { describe, expect, it } from "vitest";
import { getPublicPaths } from "@/lib/routing/public-paths";
import type { EditorialArticle, LevelArticle } from "@/lib/content/types";

describe("getPublicPaths", () => {
  it("excludes draft and archived levels", () => {
    const levels = [
      { locale: "en", levelNumber: 1, status: "draft" },
      { locale: "en", levelNumber: 2, status: "archived" },
      { locale: "en", levelNumber: 3, status: "published", difficulty: "easy" },
    ] as LevelArticle[];
    expect(getPublicPaths(levels)).toEqual([
      "/en/",
      "/en/about/",
      "/en/legal/",
      "/en/levels/",
      "/en/levels/3/",
    ]);
  });

  it("adds the hard-level collection when a published hard level exists", () => {
    const levels = [
      { locale: "en", levelNumber: 14, status: "published", difficulty: "hard" },
    ] as LevelArticle[];
    expect(getPublicPaths(levels)).toContain("/en/hard-levels/");
  });

  it("includes only published editorial details and their collection", () => {
    const editorial = [
      { locale: "en", kind: "guide", slug: "draft-guide", status: "draft" },
      { locale: "en", kind: "obstacle", slug: "verified-obstacle", status: "published" },
    ] as EditorialArticle[];
    expect(getPublicPaths([], editorial)).toEqual([
      "/en/",
      "/en/about/",
      "/en/legal/",
      "/en/obstacles/",
      "/en/obstacles/verified-obstacle/",
    ]);
  });
});
