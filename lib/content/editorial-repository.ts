/** 文件职责：为 Phase 2 内容提供统一发布过滤、按 Slug 查询和关联关卡解析。
 *
 * 体积策略：聚合页/搜索仅消费 EditorialMeta 同步数据；详情正文通过 import.meta.glob
 * 按需加载，与关卡仓库共享同一懒加载机制。
 */
import { editorialMeta } from "virtual:blockout-content";
import type {
  BoosterArticle,
  EditorialArticle,
  EditorialKind,
  EditorialMeta,
  GuideArticle,
  Locale,
  ObstacleArticle,
  UpdateArticle,
} from "./types";
import { getPublishedLevels } from "./level-repository";

type ResolvedEditorial<K extends EditorialKind = EditorialKind> = (EditorialMeta & {
  kind: K;
}) & { sourceLocale: Locale };

/** 保持类型收窄的公共查询核心，页面只使用下方领域入口。 */
function getByKind<K extends EditorialKind>(locale: Locale, kind: K): readonly ResolvedEditorial<K>[] {
  const filtered = editorialMeta.filter(
    (article): article is EditorialMeta & { kind: K } =>
      article.locale === locale && article.kind === kind,
  );
  return filtered.map((article) => ({ ...article, sourceLocale: article.sourceLocale }));
}

/** published-only 查询供聚合、搜索和未来 Sitemap 使用。 */
function getPublishedByKind<K extends EditorialKind>(
  locale: Locale,
  kind: K,
): readonly ResolvedEditorial<K>[] {
  return getByKind(locale, kind).filter((article) => article.status === "published");
}

/** 非英文语言回退到英文源内容，避免聚合页为空、详情页 404（与关卡 Tier A 一致）。 */
function getPublishedByKindFallback<K extends EditorialKind>(
  locale: Locale,
  kind: K,
): readonly ResolvedEditorial<K>[] {
  const localized = getPublishedByKind(locale, kind);
  if (localized.length > 0 || locale === "en") return localized;
  return getPublishedByKind("en", kind);
}

/** 编辑内容的懒加载入口；Vite 把每个 JSON 拆成独立 chunk，按需加载详情正文。 */
const editorialLoaders = import.meta.glob<{ default: EditorialArticle }>(
  "../../content/*/{obstacles,boosters,guides,updates}/*.json",
);

/** EditorialKind（单数）映射到内容目录（复数），避免懒加载路径与磁盘目录不匹配。 */
const kindDirectory: Record<EditorialKind, string> = {
  obstacle: "obstacles",
  booster: "boosters",
  guide: "guides",
  update: "updates",
};

/** 异步按 slug 解析已发布编辑内容；非目标语言回退到 `en` 源内容。 */
async function loadEditorialBySlug<K extends EditorialKind>(
  locale: Locale,
  kind: K,
  slug: string,
): Promise<Extract<EditorialArticle, { kind: K }> | undefined> {
  for (const tryLocale of [locale, "en"] as const) {
    const path = `../../content/${tryLocale}/${kindDirectory[kind]}/${slug}.json`;
    const loader = editorialLoaders[path];
    if (!loader) continue;
    const mod = await loader();
    if (mod.default.status === "published" && mod.default.kind === kind) {
      return mod.default as Extract<EditorialArticle, { kind: K }>;
    }
  }
  return undefined;
}

/** 解析关联关卡时再次经过 published 边界，禁止详情页生成草稿卡片。 */
export function getPublishedRelatedLevels(locale: Locale, levelNumbers: readonly number[]) {
  const allowed = new Set(levelNumbers);
  return getPublishedLevels(locale).filter((level) => allowed.has(level.levelNumber));
}

export const getPreviewObstacles = (locale: Locale) =>
  getByKind(locale, "obstacle");
export const getPublishedObstacles = (locale: Locale) =>
  getPublishedByKindFallback(locale, "obstacle");
export const getPublishedObstacleBySlug = (locale: Locale, slug: string) =>
  loadEditorialBySlug(locale, "obstacle" as const, slug) as Promise<ObstacleArticle | undefined>;
export const getPreviewObstacleBySlug = (locale: Locale, slug: string) =>
  loadEditorialBySlug(locale, "obstacle" as const, slug) as Promise<ObstacleArticle | undefined>;

export const getPreviewBoosters = (locale: Locale) =>
  getByKind(locale, "booster");
export const getPublishedBoosters = (locale: Locale) =>
  getPublishedByKindFallback(locale, "booster");
export const getPublishedBoosterBySlug = (locale: Locale, slug: string) =>
  loadEditorialBySlug(locale, "booster" as const, slug) as Promise<BoosterArticle | undefined>;
export const getPreviewBoosterBySlug = (locale: Locale, slug: string) =>
  loadEditorialBySlug(locale, "booster" as const, slug) as Promise<BoosterArticle | undefined>;

export const getPreviewGuides = (locale: Locale) =>
  getByKind(locale, "guide");
export const getPublishedGuides = (locale: Locale) =>
  getPublishedByKindFallback(locale, "guide");
export const getPublishedGuideBySlug = (locale: Locale, slug: string) =>
  loadEditorialBySlug(locale, "guide" as const, slug) as Promise<GuideArticle | undefined>;
export const getPreviewGuideBySlug = (locale: Locale, slug: string) =>
  loadEditorialBySlug(locale, "guide" as const, slug) as Promise<GuideArticle | undefined>;

export const getPreviewUpdates = (locale: Locale) =>
  getByKind(locale, "update");
export const getPublishedUpdates = (locale: Locale) =>
  getPublishedByKindFallback(locale, "update");
export const getPublishedUpdateBySlug = (locale: Locale, slug: string) =>
  loadEditorialBySlug(locale, "update" as const, slug) as Promise<UpdateArticle | undefined>;
export const getPreviewUpdateBySlug = (locale: Locale, slug: string) =>
  loadEditorialBySlug(locale, "update" as const, slug) as Promise<UpdateArticle | undefined>;