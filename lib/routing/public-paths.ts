/** 文件职责：集中枚举允许预渲染和索引的公共路径。 */
import type { ContentStatus, Difficulty, EditorialKind } from "@/lib/content/types";
import { supportedLocales } from "../i18n/locales.ts";

/** 静态页（首页/关于/法律）为每种受支持语言生成一次。 */
export const staticPublicPaths: string[] = supportedLocales.flatMap((locale) => [
  `/${locale}/`,
  `/${locale}/about/`,
  `/${locale}/legal/`,
]);

/** 同时接受 LevelArticle / LevelMeta（关卡）与 EditorialArticle / EditorialMeta（编辑内容）；只读取路由所需字段。 */
type LevelLike = {
  status: ContentStatus;
  difficulty?: Difficulty | null | undefined;
  levelNumber: number;
};
type EditorialLike = {
  status: ContentStatus;
  kind: EditorialKind;
  slug: string;
};

/** 从已校验内容生成公共路径，draft/archived 永远不会进入结果。 */
export function getPublicPaths(
  levels: readonly LevelLike[],
  editorial: readonly EditorialLike[] = [],
): string[] {
  const publishedLevels = levels.filter((level) => level.status === "published");
  const hasHard = publishedLevels.some(
    (level) =>
      level.difficulty != null && ["hard", "expert", "super-hard"].includes(level.difficulty),
  );

  // 关卡详情与聚合页为每种受支持语言生成：非英文关卡页是 Tier A（视频 + 本地化界面），可索引。
  const levelDetailPaths = supportedLocales.flatMap((locale) =>
    publishedLevels.map((level) => `/${locale}/levels/${level.levelNumber}/`),
  );
  const levelCollectionPaths = supportedLocales.flatMap((locale) => {
    const paths = [`/${locale}/levels/`];
    return hasHard ? [...paths, `/${locale}/hard-levels/`] : paths;
  });

  const kindSegments: Record<EditorialKind, string> = {
    obstacle: "obstacles",
    booster: "boosters",
    guide: "guides",
    update: "updates",
  };
  const publishedEditorial = editorial.filter((article) => article.status === "published");
  // 编辑内容仅英文源，但为非英文语言预渲染（Tier A：英文正文 + 本地化界面），可索引。
  const detailPaths = supportedLocales.flatMap((locale) =>
    publishedEditorial.map(
      (article) => `/${locale}/${kindSegments[article.kind as EditorialKind]}/${article.slug}/`,
    ),
  );
  const collectionPaths = supportedLocales.flatMap((locale) =>
    publishedEditorial.map((article) => `/${locale}/${kindSegments[article.kind as EditorialKind]}/`),
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

/** 搜索页为静态壳 + 客户端检索，且 robots noindex，故不进入 sitemap / 索引清单。
 *  单独枚举供预渲染，确保线上可用，同时避开公共路径的「不可 noindex」门禁。 */
export function getSearchPaths(): string[] {
  return supportedLocales.map((locale) => `/${locale}/search/`);
}