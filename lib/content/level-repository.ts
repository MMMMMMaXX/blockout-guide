/** 文件职责：提供稳定关卡查询语义，并统一隔离 draft/archived 内容。
 *
 * 多语言策略：关卡核心数据（棋盘、视频、难度、颜色）与语言无关，全站只维护一份。
 * 任意受支持语言都可通过 union 取得已发布关卡核心数据；返回对象带 `sourceLocale`
 * 标记原始内容语言，页面据此决定是否展示语言相关长文本（quickTips/faq/steps）。
 * 当目标语言没有对应 overlay 时，页面降级为 Tier A（仅视频 + 本地化 UI），绝不显示英文长文本。
 */
import levelManifest from "virtual:blockout-content";
import type { Difficulty, LevelArticle, Locale } from "./types";

/** 在原始发布关卡上附加展示语言与来源语言，供页面控制长文本可见性。 */
export type ResolvedLevel = LevelArticle & { sourceLocale: Locale };

/** 把一个已发布关卡呈现为指定展示语言；来源语言保持不变用于长文本决策。 */
function present(level: LevelArticle, locale: Locale): ResolvedLevel {
  return { ...level, sourceLocale: level.locale, locale };
}

/** 按关卡号取并集，并优先选择来源语言即目标语言的实体，避免重复路由。 */
function unionByNumber(levels: readonly LevelArticle[], locale: Locale): ResolvedLevel[] {
  const byNumber = new Map<number, LevelArticle>();
  for (const level of levels) {
    const existing = byNumber.get(level.levelNumber);
    if (!existing) byNumber.set(level.levelNumber, level);
    else if (existing.locale !== locale && level.locale === locale) byNumber.set(level.levelNumber, level);
  }
  return [...byNumber.values()]
    .sort((left, right) => left.levelNumber - right.levelNumber)
    .map((level) => present(level, locale));
}

/** 只返回允许被页面、搜索和 SEO 消费的已发布关卡（任意语言可取得核心数据）。 */
export function getPublishedLevels(locale: Locale): readonly ResolvedLevel[] {
  const published = levelManifest.filter((level) => level.status === "published");
  return unionByNumber(published, locale);
}

/** 返回本地内容预览清单；调用方必须显式维持 noindex。 */
export function getPreviewLevels(locale: Locale): readonly ResolvedLevel[] {
  return unionByNumber(levelManifest, locale);
}

/** 按关卡号查询草稿或发布内容，用于详情模板和本地审核。 */
export function getPreviewLevelByNumber(
  locale: Locale,
  levelNumber: number,
): ResolvedLevel | undefined {
  return getPreviewLevels(locale).find((level) => level.levelNumber === levelNumber);
}

/** 按关卡号查询已发布内容，未来 API 或 Sitemap 必须使用此入口。 */
export function getPublishedLevelByNumber(
  locale: Locale,
  levelNumber: number,
): ResolvedLevel | undefined {
  return getPublishedLevels(locale).find((level) => level.levelNumber === levelNumber);
}

const hardDifficulties = new Set<Difficulty>(["hard", "expert", "super-hard"]);

/** 只从已发布边界派生高难关卡，避免未来聚合页意外泄露草稿。 */
export function getPublishedHardLevels(locale: Locale): readonly ResolvedLevel[] {
  return getPublishedLevels(locale).filter(
    (level) => level.difficulty !== undefined && hardDifficulties.has(level.difficulty),
  );
}
