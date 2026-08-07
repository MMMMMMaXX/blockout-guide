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
import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages, interpolate } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/locale-path";

type SearchExplorerProps = {
  entries: readonly SearchEntry[];
  initialQuery: string;
  initialType: SearchType;
  initialPage: number;
};

const typeLabels: Record<SearchType, (t: ReturnType<typeof getMessages>) => string> = {
  all: (t) => t.difficulty.all,
  level: (t) => t.nav.levels,
  obstacle: (t) => t.nav.obstacles,
  booster: (t) => t.nav.boosters,
  guide: (t) => t.nav.guides,
  update: (t) => t.nav.updates,
};

/** 查询变化时用 replaceState 写入 URL，避免每次按键都产生浏览器历史记录。 */
export function SearchExplorer({
  entries,
  initialQuery,
  initialType,
  initialPage,
}: SearchExplorerProps) {
  const locale = useLocale();
  const t = getMessages(locale);
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
    window.history.replaceState(null, "", withLocale(locale, `/search/${suffix}`));
  }, [locale, pagination.page, query, type]);

  // 静态预渲染下服务端拿不到客户端地址栏；挂载后从 URL 同步查询/类型/页码，保证深链（?q=）可用。
  // 首屏仍用服务端 initial 值渲染以匹配 HTML，避免 hydration 不匹配，随后再校正。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const parameters = new URLSearchParams(window.location.search);
    const urlQuery = parameters.get("q") ?? "";
    const urlType = parameters.get("type");
    const urlPage = Number.parseInt(parameters.get("page") ?? "1", 10);
    setQuery(urlQuery);
    setType(urlType && searchTypes.includes(urlType as SearchType) ? (urlType as SearchType) : "all");
    setPage(Number.isSafeInteger(urlPage) && urlPage > 0 ? urlPage : 1);
    // 仅挂载时同步一次；后续 URL 由上方 replaceState 维护。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 类型切换复位分页，防止旧页码超出新的结果范围。 */
  function selectType(nextType: SearchType) {
    setType(nextType);
    setPage(1);
  }

  return (
    <section className="search-explorer" aria-label={t.aria.siteSearch}>
      <label className="search-field">
        <span>{t.search.label}</span>
        <input
          type="search"
          value={query}
          autoFocus
          placeholder={t.search.inputPlaceholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
      </label>
      <div className="filter-buttons" aria-label={t.aria.contentType}>
        {searchTypes.map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={type === option}
            onClick={() => selectType(option)}
          >
            {typeLabels[option](t)}
          </button>
        ))}
      </div>

      {query.trim().length === 0 ? (
        <div className="empty-state">
          <span>{interpolate(t.search.indexedArticles, { count: entries.length })}</span>
          <h2>{t.search.emptyTitle}</h2>
          <p>{t.search.emptyCopy}</p>
        </div>
      ) : pagination.total === 0 ? (
        <div className="empty-state">
          <span>{interpolate(t.search.resultCount, { count: 0 })}</span>
          <h2>{interpolate(t.search.noMatchTitle, { query: query.trim() })}</h2>
          <p>{t.search.noMatchCopy}</p>
        </div>
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            {interpolate(t.search.resultCount, { count: pagination.total })}
          </p>
          <div className="search-results">
            {pagination.items.map((entry) => (
              <Link className="search-result" href={entry.href} key={entry.id}>
                <span className="badge">{typeLabels[entry.type](t)}</span>
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
            <nav className="pagination" aria-label={t.aria.searchResultPages}>
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
