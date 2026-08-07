/** 文件职责：构建仅含已发布实体的本地混合搜索索引，并提供稳定排序与分页。 */
import type { ContentStatus, Difficulty, EditorialKind, Locale } from "@/lib/content/types";

export const searchTypes = ["all", "level", "obstacle", "booster", "guide", "update"] as const;
export type SearchType = (typeof searchTypes)[number];
export type SearchEntryType = Exclude<SearchType, "all">;

export type SearchEntry = {
  id: string;
  type: SearchEntryType;
  title: string;
  summary: string;
  href: string;
  updatedAt: string;
  keywords: readonly string[];
  levelNumber?: number;
};

/** 搜索索引只读取展示/路由字段；关卡与编辑内容都可用 Article 或 Meta 提供，故用结构类型而非具体 Article/Meta。 */
export type SearchLevelLike = {
  id: string;
  locale: Locale;
  levelNumber: number;
  title: string;
  summary: string;
  status: ContentStatus;
  difficulty?: Difficulty | null | undefined;
  obstacleIds: readonly string[];
  updatedAt: string;
};

type SearchEditorialBase = {
  id: string;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  status: ContentStatus;
  updatedAt: string;
  kind: EditorialKind;
};

export type SearchObstacleLike = SearchEditorialBase & {
  kind: "obstacle";
  category: string;
  priority: string;
  rules: readonly string[];
};
export type SearchBoosterLike = SearchEditorialBase & {
  kind: "booster";
  effect: string;
  useWhen: readonly string[];
  avoidWhen: readonly string[];
};
export type SearchGuideLike = SearchEditorialBase & {
  kind: "guide";
  question: string;
  obstacleIds: readonly string[];
  boosterIds: readonly string[];
};
export type SearchUpdateLike = SearchEditorialBase & {
  kind: "update";
  version: string;
  changes: readonly string[];
};

export type SearchIndexInput = {
  levels: readonly SearchLevelLike[];
  obstacles: readonly SearchObstacleLike[];
  boosters: readonly SearchBoosterLike[];
  guides: readonly SearchGuideLike[];
  updates: readonly SearchUpdateLike[];
};

/** 防御性过滤 published，确保调用方即使误传 preview 清单也不会泄露草稿。 */
export function buildSearchIndex(input: SearchIndexInput): readonly SearchEntry[] {
  const levels = input.levels
    .filter((item) => item.status === "published")
    .map((item): SearchEntry => ({
      id: item.id,
      type: "level",
      title: item.title,
      summary: item.summary,
      href: `/${item.locale}/levels/${item.levelNumber}/`,
      updatedAt: item.updatedAt,
      keywords: [String(item.levelNumber), item.difficulty ?? "", ...item.obstacleIds],
      levelNumber: item.levelNumber,
    }));
  const mapEditorial = <T extends SearchEditorialBase>(
    items: readonly T[],
    type: Exclude<SearchEntryType, "level">,
    segment: string,
    getKeywords: (item: T) => readonly string[],
  ): SearchEntry[] =>
    items
      .filter((item) => item.status === "published")
      .map((item) => ({
        id: item.id,
        type,
        title: item.title,
        summary: item.summary,
        href: `/${item.locale}/${segment}/${item.slug}/`,
        updatedAt: item.updatedAt,
        keywords: [item.slug, ...getKeywords(item)],
      }));

  return [
    ...levels,
    ...mapEditorial(input.obstacles, "obstacle", "obstacles", (item) => [
      item.category,
      item.priority,
      ...item.rules,
    ]),
    ...mapEditorial(input.boosters, "booster", "boosters", (item) => [
      item.effect,
      ...item.useWhen,
      ...item.avoidWhen,
    ]),
    ...mapEditorial(input.guides, "guide", "guides", (item) => [
      item.question,
      ...item.obstacleIds,
      ...item.boosterIds,
    ]),
    ...mapEditorial(input.updates, "update", "updates", (item) => [item.version, ...item.changes]),
  ].sort((first, second) => first.title.localeCompare(second.title));
}

export type SearchOptions = { query: string; type: SearchType };

/** 精确关卡号优先，其次按标题、关键词和摘要命中排序。 */
export function searchIndex(
  entries: readonly SearchEntry[],
  options: SearchOptions,
): readonly SearchEntry[] {
  const query = options.query.trim().toLocaleLowerCase();
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  return entries
    .filter((entry) => options.type === "all" || entry.type === options.type)
    .map((entry) => {
      const title = entry.title.toLocaleLowerCase();
      const summary = entry.summary.toLocaleLowerCase();
      const keywords = entry.keywords.join(" ").toLocaleLowerCase();
      const exactLevel = entry.levelNumber !== undefined && query === String(entry.levelNumber);
      const matchesAll = tokens.every(
        (token) => title.includes(token) || summary.includes(token) || keywords.includes(token),
      );
      const score =
        (exactLevel ? 1000 : 0) +
        tokens.reduce(
          (total, token) =>
            total +
            (title.startsWith(token) ? 80 : title.includes(token) ? 50 : 0) +
            (keywords.includes(token) ? 20 : 0) +
            (summary.includes(token) ? 10 : 0),
          0,
        );
      return { entry, matchesAll, score };
    })
    .filter((result) => result.matchesAll)
    .sort(
      (first, second) =>
        second.score - first.score ||
        second.entry.updatedAt.localeCompare(first.entry.updatedAt) ||
        first.entry.title.localeCompare(second.entry.title),
    )
    .map((result) => result.entry);
}

/** 搜索分页固定每页 10 条，并对异常页码执行边界修正。 */
export function paginateSearchResults(
  entries: readonly SearchEntry[],
  requestedPage: number,
  pageSize = 10,
) {
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  return {
    page,
    pageCount,
    total: entries.length,
    items: entries.slice((page - 1) * pageSize, page * pageSize),
  } as const;
}