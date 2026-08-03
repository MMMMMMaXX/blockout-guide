/** 文件职责：把完整 Playlist 元数据原子转换为可直接发布的 Level JSON，不生成审核队列。 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { assertProductionArticle } from "../lib/content/publication-policy.ts";
import { levelArticleSchema } from "../lib/content/schema.ts";
import type { LevelArticle } from "../lib/content/types.ts";

const playlistItemSchema = z.object({
  videoId: z.string().min(1),
  videoTitle: z.string().min(1),
  publisherLabel: z.string().min(1),
  sourceUrl: z.url(),
  embedAllowed: z.literal(true),
  article: z.unknown(),
});

const playlistExportSchema = z.object({
  sourcePlaylistUrl: z.url(),
  items: z.array(playlistItemSchema).min(1),
});

/** 从标题读取唯一关卡号；不明确或出现多个候选时失败关闭。 */
export function parseLevelNumber(title: string): number {
  const matches = [...title.matchAll(/\blevel\s*#?\s*(\d+)\b/gi)].map((match) => Number(match[1]));
  const unique = [...new Set(matches)];
  if (unique.length !== 1 || !Number.isInteger(unique[0]) || unique[0] <= 0) {
    throw new Error(`视频标题无法解析唯一 Level number: ${title}`);
  }
  return unique[0];
}

/** 将 Playlist 事实合并到完整文章，并交给正式 Schema 验证全部发布字段。 */
export function buildPublishedLevelFromPlaylistItem(input: unknown): LevelArticle {
  const item = playlistItemSchema.parse(input);
  const levelNumber = parseLevelNumber(item.videoTitle);
  const candidate = levelArticleSchema.parse(item.article);
  if (candidate.levelNumber !== levelNumber)
    throw new Error(`标题 Level ${levelNumber} 与文章 Level ${candidate.levelNumber} 不一致`);
  if (candidate.status !== "published") throw new Error("Playlist 只能生成 published 文章");
  if (candidate.variants.length !== 1)
    throw new Error("每个 Playlist 条目必须明确对应一个 Variant；多 Variant 请拆分来源后合并");

  const article = levelArticleSchema.parse({
    ...candidate,
    sourceReferences: [...new Set([...candidate.sourceReferences, item.sourceUrl])],
    variants: [
      {
        ...candidate.variants[0],
        video: {
          provider: "youtube",
          videoId: item.videoId,
          publisherLabel: item.publisherLabel,
          sourceUrl: item.sourceUrl,
          embedAllowed: item.embedAllowed,
          rightsBasis: "youtube-embed",
        },
      },
    ],
  });
  assertProductionArticle(article, item.videoTitle);
  return article;
}

/** 先验证整个批次再写入，保证任一失败时 content 不产生半批文件。 */
export async function syncPlaylist(inputFile: string, outputRoot = "content"): Promise<number> {
  const source = playlistExportSchema.parse(JSON.parse(await readFile(inputFile, "utf8")));
  const articles = source.items.map(buildPublishedLevelFromPlaylistItem);
  const routeKeys = new Set<string>();
  for (const article of articles) {
    const key = `${article.locale}:${article.levelNumber}`;
    if (routeKeys.has(key)) throw new Error(`Playlist 批次存在重复路由 ${key}`);
    routeKeys.add(key);
  }
  for (const article of articles) {
    const directory = path.resolve(outputRoot, article.locale, "levels");
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, `${article.levelNumber}.json`),
      `${JSON.stringify(article, null, 2)}\n`,
      { flag: "wx" },
    );
  }
  return articles.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputFile = process.argv[2];
  if (!inputFile) throw new Error("用法: npm run sync:playlist -- research/playlists/export.json");
  const count = await syncPlaylist(inputFile);
  console.log(`Playlist 同步完成（${count} 篇文章均已通过发布门禁）。`);
}
