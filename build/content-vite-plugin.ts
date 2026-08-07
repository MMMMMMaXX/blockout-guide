/** 文件职责：把构建期校验后的内容清单注入应用，避免 Worker 运行时读取文件系统。 */
import type { Plugin } from "vite";
import { loadEditorialManifest, loadLevelManifest } from "../lib/content/discovery.server";
import type { EditorialMeta, LevelMeta } from "../lib/content/types";

const virtualId = "virtual:blockout-content";
const resolvedVirtualId = `\0${virtualId}`;

/** 把全量 LevelArticle 缩减为聚合页/搜索/Sitemap 所需的轻量元数据，避免 Worker bundle 内联 ~30MB JSON。
 * 关卡核心数据（棋盘/视频/难度/标题/摘要）与语言无关，每个 levelNumber 只保留一条源语言条目，
 * 不同语言聚合页通过 unionByNumber 复用同一条目，从而把元数据体积压缩约十倍。 */
function toLevelMeta(levels: Awaited<ReturnType<typeof loadLevelManifest>>): LevelMeta[] {
  const byNumber = new Map<number, LevelMeta>();
  for (const level of levels) {
    const variant = level.variants[0];
    const meta: LevelMeta = {
      id: level.id,
      levelNumber: level.levelNumber,
      locale: level.locale,
      sourceLocale: level.locale,
      slug: String(level.levelNumber),
      title: level.title,
      summary: level.summary,
      difficulty: level.difficulty ?? null,
      contentTier: level.contentTier,
      boardImage: variant?.boardImage ?? null,
      videoId: variant?.video?.videoId ?? null,
      obstacleIds: level.obstacleIds,
      updatedAt: level.updatedAt,
      status: level.status,
    };
    const existing = byNumber.get(level.levelNumber);
    if (!existing || (existing.locale !== "en" && level.locale === "en")) {
      byNumber.set(level.levelNumber, meta);
    }
  }
  return [...byNumber.values()];
}

/** 编辑内容同样只发出展示/路由所需的元数据，详情正文走 import.meta.glob 按需加载。 */
function toEditorialMeta(editorial: Awaited<ReturnType<typeof loadEditorialManifest>>): EditorialMeta[] {
  return editorial.map((article): EditorialMeta => {
    const base = {
      id: article.id,
      locale: article.locale,
      sourceLocale: article.locale,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      updatedAt: article.updatedAt,
      status: article.status,
    };
    switch (article.kind) {
      case "obstacle":
        return { ...base, kind: "obstacle", category: article.category, priority: article.priority, rules: article.rules };
      case "booster":
        return { ...base, kind: "booster", effect: article.effect, useWhen: article.useWhen, avoidWhen: article.avoidWhen };
      case "guide":
        return { ...base, kind: "guide", question: article.question, obstacleIds: article.obstacleIds, boosterIds: article.boosterIds };
      case "update":
        return { ...base, kind: "update", version: article.version, changes: article.changes };
    }
  });
}

/** 开发和生产共享同一发现逻辑；内容变化时 Vite 会重建虚拟模块。 */
export function blockoutContent(): Plugin {
  let root = process.cwd();
  return {
    name: "blockout-content",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      return id === virtualId ? resolvedVirtualId : null;
    },
    async load(id) {
      if (id !== resolvedVirtualId) return null;
      const [levels, editorial] = await Promise.all([
        loadLevelManifest(root),
        loadEditorialManifest(root),
      ]);
      const levelMeta = toLevelMeta(levels);
      const editorialMeta = toEditorialMeta(editorial);
      return `export const levelMeta = ${JSON.stringify(levelMeta)}; export const editorialMeta = ${JSON.stringify(editorialMeta)};`;
    },
  };
}