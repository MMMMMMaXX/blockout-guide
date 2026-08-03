/** 文件职责：提供稳定关卡查询语义，并统一隔离 draft/archived 内容。 */
import levelManifest from "virtual:blockout-content";
import type { Difficulty, LevelArticle, Locale } from "./types";

/** 只返回允许被页面、搜索和 SEO 消费的已发布关卡。 */
export function getPublishedLevels(locale: Locale): readonly LevelArticle[] {
  return levelManifest.filter((level) => level.locale === locale && level.status === "published");
}

/** 返回本地内容预览清单；调用方必须显式维持 noindex。 */
export function getPreviewLevels(locale: Locale): readonly LevelArticle[] {
  return levelManifest.filter((level) => level.locale === locale);
}

/** 按关卡号查询草稿或发布内容，用于详情模板和本地审核。 */
export function getPreviewLevelByNumber(
  locale: Locale,
  levelNumber: number,
): LevelArticle | undefined {
  return getPreviewLevels(locale).find((level) => level.levelNumber === levelNumber);
}

/** 按关卡号查询已发布内容，未来 API 或 Sitemap 必须使用此入口。 */
export function getPublishedLevelByNumber(
  locale: Locale,
  levelNumber: number,
): LevelArticle | undefined {
  return getPublishedLevels(locale).find((level) => level.levelNumber === levelNumber);
}

const hardDifficulties = new Set<Difficulty>(["hard", "expert", "super-hard"]);

/** 只从已发布边界派生高难关卡，避免未来聚合页意外泄露草稿。 */
export function getPublishedHardLevels(locale: Locale): readonly LevelArticle[] {
  return getPublishedLevels(locale).filter(
    (level) => level.difficulty !== undefined && hardDifficulties.has(level.difficulty),
  );
}
