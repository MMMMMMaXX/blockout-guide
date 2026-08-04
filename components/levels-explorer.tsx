/** 文件职责：实现关卡库的客户端搜索、难度筛选、快速范围跳转、分组与分页交互。 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ResolvedLevel } from "@/lib/content/level-repository";
import {
  filterLevels,
  groupLevelsByRange,
  paginateLevels,
  type DifficultyFilter,
} from "@/lib/levels/filter-levels";
import { LevelCard } from "./level-card";
import { LevelJumpDropdown } from "./level-jump-dropdown";
import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages, interpolate } from "@/lib/i18n/messages";

const RANGE_SIZE = 30;

function buildRanges(minLevel: number, maxLevel: number): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  for (let start = minLevel; start <= maxLevel; start += RANGE_SIZE) {
    const end = Math.min(start + RANGE_SIZE - 1, maxLevel);
    ranges.push({ start, end });
  }
  return ranges;
}

type LevelsExplorerProps = {
  levels: readonly ResolvedLevel[];
};

/** 每次改变检索条件都回到第一页，避免用户落在已经不存在的页码。 */
export function LevelsExplorer({ levels }: LevelsExplorerProps) {
  const locale = useLocale();
  const t = getMessages(locale);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const [page, setPage] = useState(1);
  const [isJumpMenuOpen, setJumpMenuOpen] = useState(false);
  const searchFieldRef = useRef<HTMLDivElement | null>(null);

  const difficultyOptions: readonly [DifficultyFilter, string][] = [
    ["all", t.difficulty.all],
    ["easy", t.difficulty.easy],
    ["medium", t.difficulty.medium],
    ["hard", t.difficulty.hard],
    ["expert", t.difficulty.expert],
    ["super-hard", t.difficulty["super-hard"]],
  ];

  /**
   * 关闭点击外部事件：仅在关卡下拉打开时挂载监听，避免全局点击噪声。
   * 搜索框聚焦或下拉内部点击不应触发关闭逻辑。
   */
  useEffect(() => {
    if (!isJumpMenuOpen) return undefined;
    function handlePointerDown(event: PointerEvent) {
      const root = searchFieldRef.current;
      if (root && !root.contains(event.target as Node)) {
        setJumpMenuOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setJumpMenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isJumpMenuOpen]);

  const { minLevel, maxLevel } = useMemo(() => {
    const nums = levels.map((level) => level.levelNumber);
    return { minLevel: Math.min(...nums), maxLevel: Math.max(...nums) };
  }, [levels]);
  const ranges = useMemo(() => {
    const allRanges = buildRanges(minLevel, maxLevel);
    return allRanges.filter((item) =>
      levels.some((level) => level.levelNumber >= item.start && level.levelNumber <= item.end),
    );
  }, [minLevel, maxLevel, levels]);

  const baseFiltered = useMemo(
    () => filterLevels(levels, { query, difficulty }),
    [levels, query, difficulty],
  );
  const filtered = useMemo(() => {
    if (!range) return baseFiltered;
    return baseFiltered.filter(
      (level) => level.levelNumber >= range.start && level.levelNumber <= range.end,
    );
  }, [baseFiltered, range]);
  // 选择具体范围时在当前页展示全部关卡，避免范围内再分页导致前半段缺失。
  const pageSize = range ? RANGE_SIZE : 24;
  const pagination = paginateLevels(filtered, page, pageSize);
  const groups = groupLevelsByRange(pagination.items, RANGE_SIZE);

  /** 筛选器改变后同步复位分页，维持结果总数与页码一致。 */
  function selectDifficulty(value: DifficultyFilter) {
    setDifficulty(value);
    setPage(1);
  }

  function selectRange(next: { start: number; end: number } | null) {
    setRange(next);
    setPage(1);
  }

  return (
    <section className="levels-explorer" aria-label={t.nav.levels}>
      <div className="level-filters">
        <div className="level-filters__search" ref={searchFieldRef}>
          <label>
            <span>{t.levels.searchLabel}</span>
            <input
              type="search"
              value={query}
              placeholder={t.levels.searchPlaceholder}
              onFocus={() => setJumpMenuOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                setJumpMenuOpen(true);
              }}
            />
          </label>
          {isJumpMenuOpen ? (
            <LevelJumpDropdown levels={levels} onClose={() => setJumpMenuOpen(false)} />
          ) : null}
        </div>
        <fieldset>
          <legend>{t.difficulty.label}</legend>
          <div className="filter-buttons">
            {difficultyOptions.map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={difficulty === value}
                onClick={() => selectDifficulty(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="quick-range-selector">
        <span>{t.levels.quickJump}</span>
        <div className="range-pills">
          <button type="button" aria-pressed={range === null} onClick={() => selectRange(null)}>
            {t.difficulty.all}
          </button>
          {ranges.map((item) => (
            <button
              type="button"
              key={`${item.start}-${item.end}`}
              aria-pressed={range?.start === item.start}
              onClick={() => selectRange(item)}
            >
              {item.start}-{item.end}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count" aria-live="polite">
        {interpolate(t.levels.resultCount, { count: filtered.length })}
      </p>

      {levels.length === 0 ? (
        <div className="empty-state">
          <span>{interpolate(t.levels.publishedCount, { count: 0 })}</span>
          <h2>{t.levels.empty.title}</h2>
          <p>{t.levels.empty.copy}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>{interpolate(t.levels.resultCount, { count: 0 })}</span>
          <h2>{t.levels.noMatch.title}</h2>
          <p>{t.levels.noMatch.copy}</p>
        </div>
      ) : (
        <>
          <div className="level-groups">
            {groups.map((group) => {
              const headingId = `levels-${group.start}-${group.end}`;
              return (
                <section key={headingId} aria-labelledby={headingId}>
                  <h2 id={headingId}>
                    {interpolate(t.levels.levelRange, { start: group.start, end: group.end })}
                  </h2>
                  <div className="level-grid">
                    {group.levels.map((level) => (
                      <LevelCard key={level.id} level={level} locale={locale} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          {pagination.pageCount > 1 ? (
            <nav className="pagination" aria-label={t.nav.levels}>
              <button
                type="button"
                disabled={pagination.page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                {t.common.previous}
              </button>
              <span>
                {pagination.page} / {pagination.pageCount}
              </span>
              <button
                type="button"
                disabled={pagination.page === pagination.pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                {t.common.next}
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
