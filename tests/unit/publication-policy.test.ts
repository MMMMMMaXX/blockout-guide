/** 文件职责：验证真实文章不能以草稿或待处理标记进入生产内容。 */
import { describe, expect, it } from "vitest";
import { assertProductionArticle, isStructureTemplate } from "@/lib/content/publication-policy";

describe("publication policy", () => {
  it("allows only template-prefixed drafts", () => {
    expect(isStructureTemplate({ id: "template-level-one", status: "draft" })).toBe(true);
    expect(isStructureTemplate({ id: "en-level-one", status: "draft" })).toBe(false);
  });

  it("rejects even a structure template when it is placed in production content", () => {
    expect(() =>
      assertProductionArticle(
        { id: "template-level-one", status: "draft" } as never,
        "content/en/levels/one.json",
      ),
    ).toThrow(/templates/);
  });

  it("rejects a real draft before it becomes an article backlog", () => {
    expect(() =>
      assertProductionArticle({ id: "en-level-9", status: "draft" } as never, "fixture"),
    ).toThrow(/生成即 published/);
  });

  it("rejects deferred fields even on a published object", () => {
    expect(() =>
      assertProductionArticle(
        { id: "en-level-9", status: "published", pendingReview: true } as never,
        "fixture",
      ),
    ).toThrow(/deferred-field/);
  });

  it("treats a standalone todo placeholder as deferred but not the Spanish word todos", () => {
    expect(() =>
      assertProductionArticle(
        { id: "en-level-9", status: "published", summary: "todo" } as never,
        "fixture",
      ),
    ).toThrow(/todo/);
    expect(() =>
      assertProductionArticle(
        { id: "es-level-9", status: "published", summary: "todos los niveles" } as never,
        "fixture",
      ),
    ).not.toThrow();
  });
});
