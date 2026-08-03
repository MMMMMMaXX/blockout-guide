/** 文件职责：验证内容发现排序、Schema 校验和冲突门禁。 */
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadEditorialManifest, loadLevelManifest } from "@/lib/content/discovery.server";

/** 写入满足生产合同的最小发布关卡，用于验证发现和路由冲突。 */
async function writePublishedLevel(
  root: string,
  levelNumber: number,
  id = `en-level-${levelNumber}`,
) {
  const directory = path.join(root, "content/en/levels");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, `${levelNumber}.json`),
    JSON.stringify({
      id,
      locale: "en",
      levelNumber,
      title: `Level ${levelNumber}`,
      summary: "A complete source-backed solution summary for this published fixture level.",
      status: "published",
      contentTier: "video",
      difficulty: "easy",
      obstacleIds: [],
      relatedLevelNumbers: [],
      variants: [
        {
          id: "ios-a",
          gameVersion: "765",
          platforms: ["ios"],
          boardProfile: {
            sourceUrl: "https://example.com/board",
            layout:
              "A source-described board layout with enough detail for a stable fixture identity.",
            landmarks: ["top door", "center block", "right rail"],
            colors: ["cyan", "white", "yellow"],
            rightsBasis: "source-described-site-authored",
          },
          verifiedAt: "2026-08-03",
          boosterUsage: "none",
          verificationStatus: "source-verified",
          video: {
            provider: "youtube",
            videoId: `fixture-${levelNumber}`,
            publisherLabel: "Fixture publisher",
            sourceUrl: "https://www.youtube.com/watch?v=fixture",
            embedAllowed: true,
            rightsBasis: "youtube-embed",
          },
        },
      ],
      sourceReferences: ["https://example.com/source"],
      seo: {
        title: `Block Out Level ${levelNumber} Published Fixture`,
        description:
          "A complete source-backed fixture used to validate content discovery and route ordering.",
      },
      updatedAt: "2026-08-02",
    }),
  );
}

describe("loadLevelManifest", () => {
  it("discovers and sorts level files", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "blockout-content-"));
    await writePublishedLevel(root, 2);
    await writePublishedLevel(root, 1);
    expect((await loadLevelManifest(root)).map((level) => level.levelNumber)).toEqual([1, 2]);
  });

  it("rejects duplicate locale and level routes", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "blockout-conflict-"));
    await writePublishedLevel(root, 1, "en-level-first");
    const duplicateDirectory = path.join(root, "content/copy/levels");
    await mkdir(duplicateDirectory, { recursive: true });
    await writeFile(
      path.join(duplicateDirectory, "same.json"),
      JSON.stringify({
        id: "en-level-second",
        locale: "en",
        levelNumber: 1,
        title: "Duplicate",
        summary: "A complete source-backed solution summary for this published fixture level.",
        status: "published",
        contentTier: "video",
        difficulty: "easy",
        obstacleIds: [],
        relatedLevelNumbers: [],
        variants: [
          {
            id: "ios-a",
            gameVersion: "765",
            platforms: ["ios"],
            boardProfile: {
              sourceUrl: "https://example.com/board",
              layout:
                "A source-described board layout with enough detail for a stable fixture identity.",
              landmarks: ["top door", "center block", "right rail"],
              colors: ["cyan", "white", "yellow"],
              rightsBasis: "source-described-site-authored",
            },
            verifiedAt: "2026-08-03",
            boosterUsage: "none",
            verificationStatus: "source-verified",
            video: {
              provider: "youtube",
              videoId: "fixture-duplicate",
              publisherLabel: "Fixture publisher",
              sourceUrl: "https://www.youtube.com/watch?v=fixture",
              embedAllowed: true,
              rightsBasis: "youtube-embed",
            },
          },
        ],
        sourceReferences: ["https://example.com/source"],
        seo: {
          title: "Block Out Level 1 Duplicate Fixture",
          description:
            "A complete source-backed fixture used to verify duplicate route rejection behavior.",
        },
        updatedAt: "2026-08-02",
      }),
    );
    await expect(loadLevelManifest(root)).rejects.toThrow("重复关卡路由");
  });
});

describe("loadEditorialManifest", () => {
  it("discovers and sorts Phase 2 content by kind and slug", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "blockout-editorial-"));
    const directory = path.join(root, "content/en/guides");
    await mkdir(directory, { recursive: true });
    for (const slug of ["z-guide", "a-guide"]) {
      await writeFile(
        path.join(directory, `${slug}.json`),
        JSON.stringify({
          kind: "guide",
          id: `en-${slug}`,
          locale: "en",
          slug,
          title: slug,
          summary:
            "A complete published guide fixture with reusable advice and source-backed context.",
          status: "published",
          question: "How should this published fixture be used?",
          sections: [
            { heading: "First check", body: ["Confirm the board identity before moving."] },
            { heading: "Second check", body: ["Preserve the constrained exit lane."] },
          ],
          obstacleIds: [],
          boosterIds: [],
          relatedLevelNumbers: [],
          sourceReferences: ["https://example.com/guide-source"],
          seo: {
            title: `Block Out ${slug} Published Guide`,
            description:
              "A complete published fixture used to verify editorial discovery and stable sorting.",
          },
          verifiedAt: "2026-08-03",
          updatedAt: "2026-08-02",
        }),
      );
    }
    expect((await loadEditorialManifest(root)).map((article) => article.slug)).toEqual([
      "a-guide",
      "z-guide",
    ]);
  });

  it("rejects a structure draft placed inside content", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "blockout-template-content-"));
    const directory = path.join(root, "content/en/levels");
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, "1.json"),
      JSON.stringify({
        id: "template-level-one",
        locale: "en",
        levelNumber: 1,
        title: "Template",
        summary: "Structure template",
        status: "draft",
        contentTier: "video",
        obstacleIds: [],
        relatedLevelNumbers: [],
        variants: [],
        updatedAt: "2026-08-03",
      }),
    );
    await expect(loadLevelManifest(root)).rejects.toThrow(/templates/);
  });
});
