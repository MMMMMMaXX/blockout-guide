/** 文件职责：集中枚举允许预渲染和索引的公共路径。 */
import type { EditorialArticle, LevelArticle } from "@/lib/content/types";

export const staticPublicPaths = ["/en/", "/en/about/", "/en/legal/"] as const;

/** 从已校验内容生成公共路径，draft/archived 永远不会进入结果。 */
export function getPublicPaths(
  levels: readonly LevelArticle[],
  editorial: readonly EditorialArticle[] = [],
): string[] {
  const levelPaths = levels
    .filter((level) => level.status === "published")
    .map((level) => `/${level.locale}/levels/${level.levelNumber}/`);
  const publishedLevels = levels.filter((level) => level.status === "published");
  const levelCollectionPaths = publishedLevels.flatMap((level) => {
    const paths = [`/${level.locale}/levels/`];
    return ["hard", "expert", "super-hard"].includes(level.difficulty ?? "")
      ? [...paths, `/${level.locale}/hard-levels/`]
      : paths;
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
      ...levelPaths,
      ...detailPaths,
      ...collectionPaths,
    ]),
  ].sort();
}
