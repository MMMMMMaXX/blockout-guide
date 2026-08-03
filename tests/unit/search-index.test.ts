/** 文件职责：验证混合搜索索引的草稿隔离、排序、类型筛选和分页。 */
import { describe, expect, it } from "vitest";
import type { GuideArticle, LevelArticle, ObstacleArticle } from "@/lib/content/types";
import { buildSearchIndex, paginateSearchResults, searchIndex } from "@/lib/search/search-index";

const publishedLevel = {
  id: "level-218",
  locale: "en",
  levelNumber: 218,
  title: "Block Out Level 218",
  summary: "A verified board-first solution.",
  status: "published",
  contentTier: "video",
  difficulty: "easy",
  obstacleIds: ["ivy"],
  relatedLevelNumbers: [],
  variants: [],
  sourceReferences: [],
  updatedAt: "2026-08-02",
} as LevelArticle;

const draftGuide = {
  id: "draft-guide",
  locale: "en",
  slug: "draft-guide",
  kind: "guide",
  title: "Draft guide",
  summary: "Must stay private.",
  status: "draft",
  question: "Draft?",
  sections: [],
  obstacleIds: [],
  boosterIds: [],
  relatedLevelNumbers: [],
  sourceReferences: [],
  updatedAt: "2026-08-02",
} as GuideArticle;

const publishedObstacle = {
  id: "ivy",
  locale: "en",
  slug: "ivy",
  kind: "obstacle",
  title: "Ivy obstacle",
  summary: "Verified Ivy rules.",
  status: "published",
  category: "cover",
  priority: "medium",
  rules: ["Clear the cover"],
  strategyPoints: [],
  avoidPoints: [],
  relatedLevelNumbers: [],
  relatedObstacleIds: [],
  sourceReferences: [],
  updatedAt: "2026-08-01",
} as ObstacleArticle;

describe("search index", () => {
  const entries = buildSearchIndex({
    levels: [publishedLevel],
    obstacles: [publishedObstacle],
    boosters: [],
    guides: [draftGuide],
    updates: [],
  });

  it("indexes published mixed content and excludes drafts", () => {
    expect(entries.map((entry) => entry.id).sort()).toEqual(["ivy", "level-218"]);
    expect(entries.some((entry) => entry.id === "draft-guide")).toBe(false);
  });

  it("prioritizes exact level numbers and supports type filters", () => {
    expect(searchIndex(entries, { query: "218", type: "all" })[0]?.id).toBe("level-218");
    expect(searchIndex(entries, { query: "ivy", type: "obstacle" })[0]?.id).toBe("ivy");
    expect(searchIndex(entries, { query: "ivy", type: "level" })[0]?.id).toBe("level-218");
  });

  it("paginates and clamps out-of-range pages", () => {
    const pagination = paginateSearchResults(entries, 9, 1);
    expect(pagination.page).toBe(2);
    expect(pagination.pageCount).toBe(2);
    expect(pagination.items).toHaveLength(1);
  });
});
