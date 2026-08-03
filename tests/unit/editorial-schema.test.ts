/** 文件职责：验证 Phase 2 内容类型和共同发布失败关闭规则。 */
import { describe, expect, it } from "vitest";
import {
  boosterArticleSchema,
  guideArticleSchema,
  obstacleArticleSchema,
  updateArticleSchema,
} from "@/lib/content/editorial-schema";

const publishedBase = {
  locale: "en",
  title: "Verified editorial article",
  summary: "A summary with a clear evidence boundary.",
  status: "published",
  sourceReferences: ["https://example.com/primary-source"],
  seo: {
    title: "Verified Block Out editorial article",
    description: "A sufficiently detailed description for a verified Block Out editorial article.",
  },
  verifiedAt: "2026-08-02",
  updatedAt: "2026-08-02",
} as const;

describe("editorial schemas", () => {
  it("accepts complete published domain articles", () => {
    expect(
      obstacleArticleSchema.parse({
        ...publishedBase,
        kind: "obstacle",
        id: "obstacle-test",
        slug: "obstacle-test",
        category: "cover",
        priority: "medium",
        rules: ["Observed rule one", "Observed rule two"],
        strategyPoints: ["Verified strategy one", "Verified strategy two"],
        avoidPoints: ["Verified failure"],
        relatedLevelNumbers: [],
        relatedObstacleIds: [],
      }).status,
    ).toBe("published");
    expect(
      boosterArticleSchema.parse({
        ...publishedBase,
        kind: "booster",
        id: "booster-test",
        slug: "booster-test",
        effect: "Verified effect",
        useWhen: ["Case one", "Case two"],
        avoidWhen: ["Case three", "Case four"],
        decisionChecks: ["Check one"],
        relatedLevelNumbers: [],
      }).status,
    ).toBe("published");
    expect(
      guideArticleSchema.parse({
        ...publishedBase,
        kind: "guide",
        id: "guide-test",
        slug: "guide-test",
        question: "How does the verified decision work?",
        sections: [
          { heading: "First", body: ["Reviewed answer"] },
          { heading: "Second", body: ["Reviewed example"] },
        ],
        obstacleIds: [],
        boosterIds: [],
        relatedLevelNumbers: [],
      }).status,
    ).toBe("published");
    expect(
      updateArticleSchema.parse({
        ...publishedBase,
        kind: "update",
        id: "update-test",
        slug: "version-test",
        version: "test",
        releasedAt: "2026-08-01",
        changes: ["Verified change"],
        affectedLevelNumbers: [],
        affectedObstacleIds: [],
        impactCheckedAt: "2026-08-02",
      }).status,
    ).toBe("published");
  });

  it("rejects published content without evidence", () => {
    const result = obstacleArticleSchema.safeParse({
      ...publishedBase,
      kind: "obstacle",
      id: "missing-evidence",
      slug: "missing-evidence",
      category: "unknown",
      priority: "state-dependent",
      rules: ["Only one"],
      strategyPoints: ["Only one"],
      avoidPoints: [],
      relatedLevelNumbers: [],
      relatedObstacleIds: [],
      sourceReferences: [],
      verifiedAt: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["sourceReferences", "verifiedAt", "rules", "strategyPoints"]),
      );
    }
  });
});
