/** 文件职责：提供关卡索引的纯筛选、分组与分页规则，供界面和测试共享。 */
import type { Difficulty, LevelArticle } from "@/lib/content/types";

export type DifficultyFilter = "all" | Difficulty;

export type LevelFilters = {
  query: string;
  difficulty: DifficultyFilter;
};

export type LevelRangeGroup<T extends LevelArticle = LevelArticle> = {
  start: number;
  end: number;
  levels: readonly T[];
};

/** 同时匹配关卡号、标题和摘要；难度筛选严格使用结构化字段。 */
export function filterLevels<T extends LevelArticle>(
  levels: readonly T[],
  filters: LevelFilters,
): readonly T[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return levels.filter((level) => {
    const matchesDifficulty =
      filters.difficulty === "all" || level.difficulty === filters.difficulty;
    const searchable = `${level.levelNumber} ${level.title} ${level.summary}`.toLocaleLowerCase();
    return matchesDifficulty && (query.length === 0 || searchable.includes(query));
  });
}

/** 将结果限制在稳定页长内，并在筛选后自动修正越界页码。 */
export function paginateLevels<T extends LevelArticle>(
  levels: readonly T[],
  requestedPage: number,
  pageSize = 12,
) {
  const pageCount = Math.max(1, Math.ceil(levels.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  return {
    page,
    pageCount,
    items: levels.slice((page - 1) * pageSize, page * pageSize),
  } as const;
}

/** 按每 rangeSize 关分组，帮助大规模内容库保持可扫描性。 */
export function groupLevelsByRange<T extends LevelArticle>(
  levels: readonly T[],
  rangeSize = 50,
): readonly LevelRangeGroup<T>[] {
  const groups = new Map<number, T[]>();
  [...levels]
    .sort((a, b) => a.levelNumber - b.levelNumber)
    .forEach((level) => {
      const start = Math.floor((level.levelNumber - 1) / rangeSize) * rangeSize + 1;
      groups.set(start, [...(groups.get(start) ?? []), level]);
    });
  return [...groups.entries()].map(([start, items]) => ({
    start,
    end: start + rangeSize - 1,
    levels: items,
  }));
}
