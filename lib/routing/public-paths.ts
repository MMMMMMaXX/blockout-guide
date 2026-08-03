/** 文件职责：集中枚举允许预渲染和索引的公共路径。 */
import type { EditorialArticle, LevelArticle } from "@/lib/content/types";
import { supportedLocales } from "../i18n/locales.ts";

/** 静态页（首页/关于/法律）为每种受支持语言生成一次。 */
export const staticPublicPaths: string[] = supportedLocales.flatMap((locale) => [
  `/${locale}/`,
  `/${locale}/about/`,
  `/${locale}/legal/`,
]);

/** 从已校验内容生成公共路径，draft/archived 永远不会进入结果。 */
export function getPublicPaths(
  levels: readonly LevelArticle[],
  editorial: readonly EditorialArticle[] = [],
): string[] {
  const publishedLevels = levels.filter((level) => level.status === "published");
  const hasHard = publishedLevels.some((level) =>
    ["hard", "expert", "super-hard"].includes(level.difficulty ?? ""),
  );

  // 关卡详情与聚合页为每种受支持语言生成：非英文关卡页是 Tier A（视频 + 本地化界面），可索引。
  const levelDetailPaths = supportedLocales.flatMap((locale) =>
    publishedLevels.map((level) => `/${locale}/levels/${level.levelNumber}/`),
  );
  const levelCollectionPaths = supportedLocales.flatMap((locale) => {
    const paths = [`/${locale}/levels/`];
    return hasHard ? [...paths, `/${locale}/hard-levels/`] : paths;
  });

  const kindSegments: Record<EditorialArticle["kind"], string> = {
    obstacle: "obstacles",
    booster: "boosters",
    guide: "guides",
    update: "updates",
  };
  const publishedEditorial = editorial.filter((article) => article.status === "published");
  const detailPaths = publishedEditorial.map(
    (article) => `/${article.locale}/${kindSegments[article.kind]}/${article.slug}/`,
  );
  const collectionPaths = publishedEditorial.map(
    (article) => `/${article.locale}/${kindSegments[article.kind]}/`,
  );

  return [
    ...new Set([
      ...staticPublicPaths,
      ...levelCollectionPaths,
      ...levelDetailPaths,
      ...detailPaths,
      ...collectionPaths,
    ]),
  ].sort();
}
