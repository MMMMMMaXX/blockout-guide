/** 文件职责：验证 Playlist 标题解析与完整文章的生成即发布转换。 */
import { describe, expect, it } from "vitest";
import { buildPublishedLevelFromPlaylistItem, parseLevelNumber } from "../../scripts/sync-playlist";

/** 构造已经补齐全部发布事实的 Playlist 条目。 */
function createItem() {
  return {
    videoId: "video-218",
    videoTitle: "Block Out Level 218 solution",
    publisherLabel: "Publisher",
    sourceUrl: "https://www.youtube.com/watch?v=video-218",
    embedAllowed: true,
    article: {
      id: "en-level-218",
      locale: "en",
      levelNumber: 218,
      title: "Block Out Level 218 Solution",
      summary: "Match the recorded board variant and follow the source solution for Level 218.",
      status: "published",
      contentTier: "video",
      difficulty: "easy",
      obstacleIds: [],
      relatedLevelNumbers: [],
      variants: [
        {
          id: "ios-729-a",
          gameVersion: "729",
          platforms: ["ios"],
          boardImage: "/images/levels/218/ios-729-a.webp",
          verifiedAt: "2026-08-02",
          boosterUsage: "none",
          verificationStatus: "fully-verified",
          video: {
            provider: "youtube",
            videoId: "placeholder",
            publisherLabel: "Placeholder publisher",
            sourceUrl: "https://www.youtube.com/watch?v=placeholder",
            embedAllowed: true,
            rightsBasis: "youtube-embed",
          },
        },
      ],
      sourceReferences: ["https://example.com/level-218-board-source"],
      seo: {
        title: "Block Out Level 218 Solution and Matching Board",
        description:
          "Match the verified board variant and watch the direct solution for Block Out Level 218.",
      },
      updatedAt: "2026-08-02",
    },
  };
}

describe("playlist sync", () => {
  it("parses one explicit level number", () => {
    expect(parseLevelNumber("Block Out Level #218 walkthrough")).toBe(218);
    expect(() => parseLevelNumber("Levels 218 and 219")).toThrow(/唯一/);
  });

  it("injects the authoritative video facts into a publishable article", () => {
    const article = buildPublishedLevelFromPlaylistItem(createItem());
    expect(article.status).toBe("published");
    expect(article.variants[0].video?.videoId).toBe("video-218");
    expect(article.sourceReferences).toContain(createItem().sourceUrl);
  });

  it("rejects a title and article level mismatch", () => {
    const item = createItem();
    item.article.levelNumber = 219;
    expect(() => buildPublishedLevelFromPlaylistItem(item)).toThrow(/不一致/);
  });
});
