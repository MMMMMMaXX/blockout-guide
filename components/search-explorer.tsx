/** 文件职责：实现 URL 同步的本地混合搜索、类型筛选和分页交互。 */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  paginateSearchResults,
  searchIndex,
  searchTypes,
  type SearchEntry,
  type SearchType,
} from "@/lib/search/search-index";

type SearchExplorerProps = {
  entries: readonly SearchEntry[];
  initialQuery: string;
  initialType: SearchType;
  initialPage: number;
};

const typeLabels: Record<SearchType, string> = {
  all: "All",
  level: "Levels",
  obstacle: "Obstacles",
  booster: "Boosters",
  guide: "Guides",
  update: "Updates",
};

/** 查询变化时用 replaceState 写入 URL，避免每次按键都产生浏览器历史记录。 */
export function SearchExplorer({
  entries,
  initialQuery,
  initialType,
  initialPage,
}: SearchExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchType>(initialType);
  const [page, setPage] = useState(initialPage);
  const results = useMemo(() => searchIndex(entries, { query, type }), [entries, query, type]);
  const pagination = paginateSearchResults(results, page);

  useEffect(() => {
    const parameters = new URLSearchParams();
    if (query.trim()) parameters.set("q", query.trim());
    if (type !== "all") parameters.set("type", type);
    if (pagination.page > 1) parameters.set("page", String(pagination.page));
    const suffix = parameters.size > 0 ? `?${parameters.toString()}` : "";
    window.history.replaceState(null, "", `/en/search/${suffix}`);
  }, [pagination.page, query, type]);

  /** 类型切换复位分页，防止旧页码超出新的结果范围。 */
  function selectType(nextType: SearchType) {
    setType(nextType);
    setPage(1);
  }

  return (
    <section className="search-explorer" aria-label="Site search">
      <label className="search-field">
        <span>Search published content</span>
        <input
          type="search"
          value={query}
          autoFocus
          placeholder="Level number, obstacle, booster or question"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
      </label>
      <div className="filter-buttons" aria-label="Content type">
        {searchTypes.map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={type === option}
            onClick={() => selectType(option)}
          >
            {typeLabels[option]}
          </button>
        ))}
      </div>

      {query.trim().length === 0 ? (
        <div className="empty-state">
          <span>{entries.length} indexed articles</span>
          <h2>Enter a level number or topic</h2>
          <p>Only verified, published content is searchable.</p>
        </div>
      ) : pagination.total === 0 ? (
        <div className="empty-state">
          <span>0 results</span>
          <h2>No published match for “{query.trim()}”</h2>
          <p>Try another title, level number, obstacle, booster or update keyword.</p>
        </div>
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            {pagination.total} {pagination.total === 1 ? "result" : "results"}
          </p>
          <div className="search-results">
            {pagination.items.map((entry) => (
              <Link className="search-result" href={entry.href} key={entry.id}>
                <span className="badge">{entry.type}</span>
                <div>
                  <h2>{entry.title}</h2>
                  <p>{entry.summary}</p>
                  <small>{entry.href}</small>
                </div>
                <strong aria-hidden="true">→</strong>
              </Link>
            ))}
          </div>
          {pagination.pageCount > 1 ? (
            <nav className="pagination" aria-label="Search result pages">
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
