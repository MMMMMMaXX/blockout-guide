/** 文件职责：验证三类关卡内容和 published 失败关闭规则。 */
import { describe, expect, it } from "vitest";
import { levelArticleSchema } from "@/lib/content/schema";

/** 构造可发布的最小 video 内容，单项测试只覆盖自己关心的差异。 */
function createPublishedLevel() {
  return {
    id: "en-level-1",
    locale: "en",
    levelNumber: 1,
    title: "Block Out Level 1",
    summary: "Verified solution for the matching board variant.",
    status: "published",
    contentTier: "video",
    difficulty: "easy",
    obstacleIds: [],
    relatedLevelNumbers: [2],
    sourceReferences: ["https://www.youtube.com/watch?v=abc123"],
    seo: {
      title: "Block Out Level 1 Solution",
      description:
        "Match the correct board variant and watch a verified solution for Block Out Level 1.",
    },
    variants: [
      {
        id: "ios-a",
        gameVersion: "729",
        platforms: ["ios"],
        boardImage: "/images/levels/1/ios-a.webp",
        boardHash: "12345678",
        verifiedAt: "2026-08-02",
        boosterUsage: "none",
        verificationStatus: "fully-verified",
        video: {
          provider: "youtube",
          videoId: "abc123",
          publisherLabel: "Creator one",
          sourceUrl: "https://www.youtube.com/watch?v=abc123",
          embedAllowed: true,
          rightsBasis: "youtube-embed",
        },
      },
    ],
    updatedAt: "2026-08-02",
  };
}

describe("levelArticleSchema", () => {
  it("allows an incomplete draft without granting publication", () => {
    const draft = { ...createPublishedLevel(), status: "draft", variants: [] };
    expect(levelArticleSchema.parse(draft).status).toBe("draft");
  });

  it("accepts a complete video tier", () => {
    expect(levelArticleSchema.parse(createPublishedLevel()).status).toBe("published");
  });

  it("rejects a published variant without board and video", () => {
    const article = createPublishedLevel();
    const incompleteVariant: Partial<(typeof article.variants)[number]> = {
      ...article.variants[0],
    };
    delete incompleteVariant.boardImage;
    delete incompleteVariant.video;
    article.variants = [incompleteVariant as (typeof article.variants)[number]];
    expect(levelArticleSchema.safeParse(article).success).toBe(false);
  });

  it("requires chapters and tips for enhanced video", () => {
    const article = { ...createPublishedLevel(), contentTier: "enhanced-video" };
    expect(levelArticleSchema.safeParse(article).success).toBe(false);
  });

  it("requires steps and failure points for a full guide", () => {
    const base = createPublishedLevel();
    const article = {
      ...base,
      contentTier: "full-guide",
      variants: [
        {
          ...base.variants[0],
          chapters: [
            { seconds: 0, label: "Start" },
            { seconds: 10, label: "Space" },
            { seconds: 20, label: "Exit" },
          ],
          quickTips: ["One", "Two", "Three"],
        },
      ],
    };
    expect(levelArticleSchema.safeParse(article).success).toBe(false);
  });
});
