/** 文件职责：把各领域 published Repository 组合为页面可消费的本地搜索索引。 */
import {
  getPublishedBoosters,
  getPublishedGuides,
  getPublishedObstacles,
  getPublishedUpdates,
} from "@/lib/content/editorial-repository";
import { getPublishedLevels } from "@/lib/content/level-repository";
import type { Locale } from "@/lib/content/types";
import { buildSearchIndex } from "./search-index";

/** 搜索入口不读取文件系统，也不接收 preview 内容。 */
export function getPublishedSearchIndex(locale: Locale) {
  return buildSearchIndex({
    levels: getPublishedLevels(locale),
    obstacles: getPublishedObstacles(locale),
    boosters: getPublishedBoosters(locale),
    guides: getPublishedGuides(locale),
    updates: getPublishedUpdates(locale),
  });
}
