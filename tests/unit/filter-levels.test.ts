/** 文件职责：验证 Levels 聚合页的筛选、分组和分页纯规则。 */
import { describe, expect, it } from "vitest";
import type { LevelArticle } from "@/lib/content/types";
import { filterLevels, groupLevelsByRange, paginateLevels } from "@/lib/levels/filter-levels";

/** 构造最小类型安全样例，避免单测依赖实际内容文件。 */
function level(levelNumber: number, difficulty: LevelArticle["difficulty"]): LevelArticle {
  return {
    id: `test-${levelNumber}`,
    locale: "en",
    levelNumber,
    title: `Block Out Level ${levelNumber}`,
    summary: `Verified test summary for level ${levelNumber}`,
    status: "published",
    contentTier: "video",
    difficulty,
    obstacleIds: [],
    relatedLevelNumbers: [],
    variants: [],
    sourceReferences: [],
    updatedAt: "2026-08-02",
  };
}

describe("level filters", () => {
  const levels = [level(2, "easy"), level(51, "hard"), level(106, "super-hard")];

  it("matches number text and structured difficulty", () => {
    expect(filterLevels(levels, { query: "51", difficulty: "hard" })).toEqual([levels[1]]);
    expect(filterLevels(levels, { query: "", difficulty: "easy" })).toEqual([levels[0]]);
  });

  it("groups sorted levels into stable ranges", () => {
    expect(groupLevelsByRange(levels).map((group) => [group.start, group.end])).toEqual([
      [1, 50],
      [51, 100],
      [101, 150],
    ]);
  });

  it("accepts a custom range size", () => {
    expect(groupLevelsByRange(levels, 30).map((group) => [group.start, group.end])).toEqual([
      [1, 30],
      [31, 60],
      [91, 120],
    ]);
  });

  it("clamps requested pages and returns a stable page count", () => {
    const result = paginateLevels(levels, 9, 2);
    expect(result.page).toBe(2);
    expect(result.pageCount).toBe(2);
    expect(result.items).toEqual([levels[2]]);
  });
});
