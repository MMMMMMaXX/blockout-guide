/** 文件职责：提供稳定关卡查询语义，并统一隔离 draft/archived 内容。
 *
 * 多语言策略：关卡核心数据（棋盘、视频、难度、颜色）与语言无关，全站只维护一份。
 * 受支持语言的本地化正文放在 `content/<locale>/levels/<N>.json`，由 discovery 聚合后与
 * `en` 源数据按 `levelNumber` 匹配；返回对象带 `sourceLocale` 标记实际来源语言。
 * 当目标语言暂无本地化文件时，回退到 `en` 源内容，不再隐藏任何模块。
 *
 * 体积策略：聚合页/搜索/Sitemap 仅消费 LevelMeta 同步数据；详情正文通过 import.meta.glob
 * 按需加载（Vite 会把每个 JSON 拆成独立 chunk），避免 ~30MB 内容被内联进 Worker bundle。
 */
import { levelMeta } from "virtual:blockout-content";
import type { Difficulty, LevelArticle, LevelMeta, Locale } from "./types";

/** 在元数据上附加展示语言与来源语言，供页面控制长文本可见性。 */
export type ResolvedLevel = LevelMeta & { sourceLocale: Locale };

/** 按关卡号取并集，并优先选择来源语言即目标语言的实体，避免重复路由。 */
function unionByNumber(levels: readonly LevelMeta[], locale: Locale): ResolvedLevel[] {
  const byNumber = new Map<number, LevelMeta>();
  for (const level of levels) {
    const existing = byNumber.get(level.levelNumber);
    if (!existing) byNumber.set(level.levelNumber, level);
    else if (existing.sourceLocale !== locale && level.sourceLocale === locale)
      byNumber.set(level.levelNumber, level);
  }
  return [...byNumber.values()]
    .sort((left, right) => left.levelNumber - right.levelNumber)
    .map((level) => ({ ...level, sourceLocale: level.sourceLocale }));
}

/** 懒加载每个关卡 JSON 的 Vite 代码分割入口；保留源路径作为 key 以便回退查找。 */
const levelLoaders = import.meta.glob<{ default: LevelArticle }>(
  "../../content/*/levels/*.json",
);

/** 只返回允许被页面、搜索和 SEO 消费的已发布关卡（任意语言可取得核心数据）。 */
export function getPublishedLevels(locale: Locale): readonly ResolvedLevel[] {
  const published = levelMeta.filter((level) => level.status === "published");
  return unionByNumber(published, locale);
}

/** 返回本地内容预览清单；调用方必须显式维持 noindex。 */
export function getPreviewLevels(locale: Locale): readonly ResolvedLevel[] {
  return unionByNumber(levelMeta, locale);
}

/** 按关卡号查询草稿或发布元数据，用于详情模板导航和本地审核。 */
export function getPreviewLevelByNumber(
  locale: Locale,
  levelNumber: number,
): ResolvedLevel | undefined {
  return getPreviewLevels(locale).find((level) => level.levelNumber === levelNumber);
}

/** 按关卡号查询已发布元数据；用于生成静态参数和需要同步取 ID 的场景。 */
export function getPublishedLevelMetaByNumber(
  locale: Locale,
  levelNumber: number,
): ResolvedLevel | undefined {
  return getPublishedLevels(locale).find((level) => level.levelNumber === levelNumber);
}

const hardDifficulties = new Set<Difficulty>(["hard", "expert", "super-hard"]);

/** 只从已发布边界派生高难关卡，避免未来聚合页意外泄露草稿。 */
export function getPublishedHardLevels(locale: Locale): readonly ResolvedLevel[] {
  return getPublishedLevels(locale).filter(
    (level) => level.difficulty !== null && hardDifficulties.has(level.difficulty),
  );
}

/** 按关卡号异步加载完整已发布关卡；非目标语言回退到 `en` 源内容。 */
export async function getPublishedLevelByNumber(
  locale: Locale,
  levelNumber: number,
): Promise<(LevelArticle & { sourceLocale: Locale }) | undefined> {
  for (const tryLocale of [locale, "en"] as const) {
    const path = `../../content/${tryLocale}/levels/${levelNumber}.json`;
    const loader = levelLoaders[path];
    if (!loader) continue;
    const mod = await loader();
    if (mod.default.status === "published") {
      return { ...mod.default, sourceLocale: mod.default.locale };
    }
  }
  return undefined;
}