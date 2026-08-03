/** 文件职责：校验 content 中真实文章生成即发布，且不存在待审核字段或占位债务。 */
import { loadEditorialManifest, loadLevelManifest } from "../lib/content/discovery.server.ts";
import { assertProductionArticle } from "../lib/content/publication-policy.ts";
import { getPublicPaths } from "../lib/routing/public-paths.ts";
import { buildSearchIndex } from "../lib/search/search-index.ts";

const [levels, editorial] = await Promise.all([loadLevelManifest(), loadEditorialManifest()]);

for (const article of levels) assertProductionArticle(article, `Level ${article.id}`);
for (const article of editorial) assertProductionArticle(article, `${article.kind} ${article.id}`);

const publicPaths = getPublicPaths(levels, editorial);
const kindSegments = {
  obstacle: "obstacles",
  booster: "boosters",
  guide: "guides",
  update: "updates",
} as const;

for (const level of levels) {
  const route = `/${level.locale}/levels/${level.levelNumber}/`;
  if (!publicPaths.includes(route)) throw new Error(`${level.id}: 生成后未进入公共路径 ${route}`);
}
for (const article of editorial) {
  const route = `/${article.locale}/${kindSegments[article.kind]}/${article.slug}/`;
  if (!publicPaths.includes(route)) throw new Error(`${article.id}: 生成后未进入公共路径 ${route}`);
}

const searchEntries = buildSearchIndex({
  levels,
  obstacles: editorial.filter((article) => article.kind === "obstacle"),
  boosters: editorial.filter((article) => article.kind === "booster"),
  guides: editorial.filter((article) => article.kind === "guide"),
  updates: editorial.filter((article) => article.kind === "update"),
});
for (const article of [...levels, ...editorial]) {
  if (!searchEntries.some((entry) => entry.id === article.id)) {
    throw new Error(`${article.id}: 生成后未进入搜索索引`);
  }
}

console.log(
  `生产内容校验通过（${levels.length + editorial.length} 篇均为 published、可路由、可搜索内容）。`,
);
