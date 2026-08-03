/** 文件职责：实现关卡库的客户端搜索、难度筛选、快速范围跳转、分组与分页交互。 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LevelArticle } from "@/lib/content/types";
import {
  filterLevels,
  groupLevelsByRange,
  paginateLevels,
  type DifficultyFilter,
} from "@/lib/levels/filter-levels";
import { LevelCard } from "./level-card";
import { LevelJumpDropdown } from "./level-jump-dropdown";

const difficultyOptions: readonly [DifficultyFilter, string][] = [
  ["all", "All"],
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["hard", "Hard"],
  ["expert", "Expert"],
  ["super-hard", "Super hard"],
];

const RANGE_SIZE = 30;

type LevelRange = { label: string; start: number; end: number };

function buildRanges(minLevel: number, maxLevel: number): LevelRange[] {
  const ranges: LevelRange[] = [];
  for (let start = minLevel; start <= maxLevel; start += RANGE_SIZE) {
    const end = Math.min(start + RANGE_SIZE - 1, maxLevel);
    ranges.push({ label: `${start}-${end}`, start, end });
  }
  return ranges;
}

type LevelsExplorerProps = {
  levels: readonly LevelArticle[];
  emptyTitle?: string;
  emptyCopy?: string;
};

/** 每次改变检索条件都回到第一页，避免用户落在已经不存在的页码。 */
export function LevelsExplorer({
  levels,
  emptyTitle = "The library is waiting for verified content",
  emptyCopy = "Drafts stay out of discovery until board, version and solution checks pass.",
}: LevelsExplorerProps) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [range, setRange] = useState<LevelRange | null>(null);
  const [page, setPage] = useState(1);
  const [isJumpMenuOpen, setJumpMenuOpen] = useState(false);
  const searchFieldRef = useRef<HTMLDivElement | null>(null);

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

  function selectRange(next: LevelRange | null) {
    setRange(next);
    setPage(1);
  }

  return (
    <section className="levels-explorer" aria-label="Level explorer">
      <div className="level-filters">
        <div className="level-filters__search" ref={searchFieldRef}>
          <label>
            <span>Search verified levels</span>
            <input
              type="search"
              value={query}
              placeholder="Level number or keyword"
              onFocus={() => setJumpMenuOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                setJumpMenuOpen(true);
              }}
            />
          </label>
          {isJumpMenuOpen ? <LevelJumpDropdown levels={levels} onClose={() => setJumpMenuOpen(false)} /> : null}
        </div>
        <fieldset>
          <legend>Difficulty</legend>
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
        <span>Quick jump</span>
        <div className="range-pills">
          <button type="button" aria-pressed={range === null} onClick={() => selectRange(null)}>
            All
          </button>
          {ranges.map((item) => (
            <button
              type="button"
              key={item.label}
              aria-pressed={range?.start === item.start}
              onClick={() => selectRange(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count" aria-live="polite">
        {filtered.length} verified {filtered.length === 1 ? "guide" : "guides"}
      </p>

      {levels.length === 0 ? (
        <div className="empty-state">
          <span>0 published levels</span>
          <h2>{emptyTitle}</h2>
          <p>{emptyCopy}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>No matching guides</span>
          <h2>Try another level or difficulty</h2>
          <p>The filters only search verified, published guides.</p>
        </div>
      ) : (
        <>
          <div className="level-groups">
            {groups.map((group) => (
              <section key={group.label} aria-labelledby={group.label.replace(/\s/g, "-")}>
                <h2 id={group.label.replace(/\s/g, "-")}>{group.label}</h2>
                <div className="level-grid">
                  {group.levels.map((level) => (
                    <LevelCard key={level.id} level={level} />
                  ))}
                </div>
              </section>
            ))}
          </div>
          {pagination.pageCount > 1 ? (
            <nav className="pagination" aria-label="Level pages">
              <button
                type="button"
                disabled={pagination.page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pageCount}
              </span>
              <button
                type="button"
                disabled={pagination.page === pagination.pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
