/** 文件职责：验证作者模板具备三种 Tier 且无法被误认成发布内容。 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { levelArticleSchema } from "@/lib/content/schema";
import { editorialArticleSchema } from "@/lib/content/editorial-schema";

const tiers = ["video", "enhanced-video", "full-guide"] as const;

describe("content templates", () => {
  for (const tier of tiers) {
    it(`keeps ${tier} as a safe draft`, async () => {
      const source = JSON.parse(
        await readFile(path.resolve(`templates/content/level-${tier}.json`), "utf8"),
      ) as unknown;
      const template = levelArticleSchema.parse(source);
      expect(template.status).toBe("draft");
      expect(template.contentTier).toBe(tier);
      expect(template.sourceReferences).toEqual([]);
      expect(template.variants.every((variant) => !variant.video)).toBe(true);
    });
  }
});

const editorialKinds = ["obstacle", "booster", "guide", "update"] as const;

describe("editorial templates", () => {
  for (const kind of editorialKinds) {
    it(`keeps ${kind} as an evidence-free draft`, async () => {
      const source = JSON.parse(
        await readFile(path.resolve(`templates/editorial/${kind}.json`), "utf8"),
      ) as unknown;
      const template = editorialArticleSchema.parse(source);
      expect(template.kind).toBe(kind);
      expect(template.status).toBe("draft");
      expect(template.sourceReferences).toEqual([]);
    });
  }
});
