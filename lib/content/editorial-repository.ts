/** 文件职责：为 Phase 2 内容提供统一发布过滤、按 Slug 查询和关联关卡解析。 */
import { editorial } from "virtual:blockout-content";
import type {
  BoosterArticle,
  EditorialArticle,
  GuideArticle,
  Locale,
  ObstacleArticle,
  UpdateArticle,
} from "./types";
import { getPublishedLevels } from "./level-repository";

type EditorialKind = EditorialArticle["kind"];

/** 保持类型收窄的公共查询核心，页面只使用下方领域入口。 */
function getByKind<K extends EditorialKind>(locale: Locale, kind: K) {
  return editorial.filter(
    (article): article is Extract<EditorialArticle, { kind: K }> =>
      article.locale === locale && article.kind === kind,
  );
}

/** published-only 查询供聚合、搜索和未来 Sitemap 使用。 */
function getPublishedByKind<K extends EditorialKind>(locale: Locale, kind: K) {
  return getByKind(locale, kind).filter((article) => article.status === "published");
}

/** 解析关联关卡时再次经过 published 边界，禁止详情页生成草稿卡片。 */
export function getPublishedRelatedLevels(locale: Locale, levelNumbers: readonly number[]) {
  const allowed = new Set(levelNumbers);
  return getPublishedLevels(locale).filter((level) => allowed.has(level.levelNumber));
}

export const getPreviewObstacles = (locale: Locale): readonly ObstacleArticle[] =>
  getByKind(locale, "obstacle");
export const getPublishedObstacles = (locale: Locale): readonly ObstacleArticle[] =>
  getPublishedByKind(locale, "obstacle");
export const getPublishedObstacleBySlug = (locale: Locale, slug: string) =>
  getPublishedObstacles(locale).find((article) => article.slug === slug);
export const getPreviewObstacleBySlug = (locale: Locale, slug: string) =>
  getPreviewObstacles(locale).find((article) => article.slug === slug);

export const getPreviewBoosters = (locale: Locale): readonly BoosterArticle[] =>
  getByKind(locale, "booster");
export const getPublishedBoosters = (locale: Locale): readonly BoosterArticle[] =>
  getPublishedByKind(locale, "booster");
export const getPublishedBoosterBySlug = (locale: Locale, slug: string) =>
  getPublishedBoosters(locale).find((article) => article.slug === slug);
export const getPreviewBoosterBySlug = (locale: Locale, slug: string) =>
  getPreviewBoosters(locale).find((article) => article.slug === slug);

export const getPreviewGuides = (locale: Locale): readonly GuideArticle[] =>
  getByKind(locale, "guide");
export const getPublishedGuides = (locale: Locale): readonly GuideArticle[] =>
  getPublishedByKind(locale, "guide");
export const getPublishedGuideBySlug = (locale: Locale, slug: string) =>
  getPublishedGuides(locale).find((article) => article.slug === slug);
export const getPreviewGuideBySlug = (locale: Locale, slug: string) =>
  getPreviewGuides(locale).find((article) => article.slug === slug);

export const getPreviewUpdates = (locale: Locale): readonly UpdateArticle[] =>
  getByKind(locale, "update");
export const getPublishedUpdates = (locale: Locale): readonly UpdateArticle[] =>
  getPublishedByKind(locale, "update");
export const getPublishedUpdateBySlug = (locale: Locale, slug: string) =>
  getPublishedUpdates(locale).find((article) => article.slug === slug);
export const getPreviewUpdateBySlug = (locale: Locale, slug: string) =>
  getPreviewUpdates(locale).find((article) => article.slug === slug);
