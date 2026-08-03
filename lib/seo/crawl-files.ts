/** 文件职责：从固定公开页和 published 清单生成 robots.txt 与单文件 Sitemap。 */
import type { EditorialArticle, LevelArticle } from "@/lib/content/types";
import { getPublicPaths } from "@/lib/routing/public-paths";

const baseUrl = "https://blockout.stratlore.com";

/** robots 明确隔离搜索、规划功能和开发路由；路径前缀覆盖所有语言。 */
export function buildRobotsText(): string {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /search/",
    "Disallow: /board-matcher/",
    "Disallow: /__design-system/",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

/** 路径源已过滤 published；内容页同时输出由 Schema 校验的 ISO 更新日期。 */
export function buildSitemapXml(
  levels: readonly LevelArticle[],
  editorial: readonly EditorialArticle[],
): string {
  const updatedByPath = new Map<string, string>();
  for (const level of levels.filter((article) => article.status === "published")) {
    updatedByPath.set(`/${level.locale}/levels/${level.levelNumber}/`, level.updatedAt);
  }
  const segments: Record<EditorialArticle["kind"], string> = {
    obstacle: "obstacles",
    booster: "boosters",
    guide: "guides",
    update: "updates",
  };
  for (const article of editorial.filter((item) => item.status === "published")) {
    updatedByPath.set(
      `/${article.locale}/${segments[article.kind]}/${article.slug}/`,
      article.updatedAt,
    );
  }
  const urls = getPublicPaths(levels, editorial)
    .map((pathname) => {
      const lastModified = updatedByPath.get(pathname);
      return `  <url><loc>${baseUrl}${pathname}</loc>${lastModified ? `<lastmod>${lastModified}</lastmod>` : ""}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
