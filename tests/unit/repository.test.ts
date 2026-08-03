/** 文件职责：验证 Repository 会公开当前全部生产内容并维持稳定查询语义。 */
import { describe, expect, it } from "vitest";
import {
  getPublishedLevelByNumber,
  getPublishedHardLevels,
  getPublishedLevels,
} from "@/lib/content/level-repository";
import {
  getPublishedBoosters,
  getPublishedGuides,
  getPublishedObstacles,
  getPublishedUpdates,
} from "@/lib/content/editorial-repository";

describe("LevelRepository", () => {
  it("publishes the complete level corpus", () => {
    const levels = getPublishedLevels("en");
    expect(levels.length).toBeGreaterThanOrEqual(150);
    for (let levelNumber = 1; levelNumber <= 150; levelNumber++) {
      expect(getPublishedLevelByNumber("en", levelNumber)?.status).toBe("published");
    }
    expect(getPublishedLevelByNumber("en", 14)?.status).toBe("published");
  });

  it("derives hard levels from published content", () => {
    const hardLevels = getPublishedHardLevels("en");
    expect(hardLevels.length).toBeGreaterThan(0);
    expect(hardLevels.map((level) => level.levelNumber)).toContain(14);
    const hardTiers = new Set(["hard", "expert", "super-hard"]);
    for (const level of hardLevels) {
      expect(hardTiers.has(level.difficulty ?? "")).toBe(true);
    }
  });
});

describe("EditorialRepository", () => {
  it("publishes every current Phase 2 content kind", () => {
    expect(getPublishedObstacles("en").length).toBeGreaterThan(0);
    expect(getPublishedBoosters("en").length).toBeGreaterThan(0);
    expect(getPublishedGuides("en").length).toBeGreaterThan(0);
    expect(getPublishedUpdates("en").length).toBeGreaterThan(0);
  });
});
