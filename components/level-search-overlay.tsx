/** 文件职责：提供可唤起“全关卡列表”浮层的搜索触发器；点击后列出全部已发布关卡，支持按关卡号或关键词过滤。 */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/use-locale";
import { withLocale } from "@/lib/i18n/locale-path";
import { getMessages } from "@/lib/i18n/messages";

/** 传给客户端浮层的最小关卡投影，避免把完整文章对象序列化进页面。 */
export type LevelSearchItem = {
  levelNumber: number;
  title: string;
  difficulty: string | null;
  boardImage: string | null;
};

type LevelSearchTriggerProps = {
  levels: LevelSearchItem[];
  size?: "bar" | "hero";
  placeholder?: string;
};

/**
 * 触发器本身是一个按钮，点击展开模态浮层；浮层内才是真正的输入框。
 * 这样可避免把隐藏输入框暴露在页面中，也更易做键盘可达与焦点管理。
 */
export function LevelSearchTrigger({ levels, size = "bar", placeholder }: LevelSearchTriggerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const t = getMessages(locale);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const list = normalized
      ? levels.filter((level) =>
          `${level.levelNumber} ${level.title}`.toLocaleLowerCase().includes(normalized),
        )
      : levels;
    return list.slice(0, 80);
  }, [levels, query]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`level-search-trigger level-search-trigger--${size}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="level-search-trigger__icon" aria-hidden="true">
          ⌕
        </span>
        <span className="level-search-trigger__label">
          {size === "hero" ? t.home.searchPlaceholder : t.nav.search}
        </span>
        {size === "hero" ? (
          <span className="level-search-trigger__cta">{t.common.browse}</span>
        ) : null}
      </button>

      {open ? (
        <div
          className="level-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t.aria.allLevels}
        >
          <div className="level-search-backdrop" onClick={() => setOpen(false)} />
          <div className="level-search-panel">
            <div className="level-search-field">
              <span aria-hidden="true">⌕</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                placeholder={placeholder ?? t.levels.searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="button"
                className="level-search-close"
                onClick={() => setOpen(false)}
                aria-label={t.nav.closeNav}
              >
                ×
              </button>
            </div>
            <p className="level-search-count" aria-live="polite">
              {query.trim()
                ? `${results.length} of ${levels.length} levels`
                : `Showing ${results.length} of ${levels.length} levels`}
            </p>
            <ul className="level-search-results">
              {results.map((level) => (
                <li key={level.levelNumber}>
                  <Link
                    href={withLocale(locale, `/levels/${level.levelNumber}/`)}
                    onClick={() => setOpen(false)}
                  >
                    {level.boardImage ? (
                      <img src={level.boardImage} alt="" loading="lazy" />
                    ) : (
                      <span className="level-search-results__placeholder" aria-hidden="true" />
                    )}
                    <span className="level-search-results__num">Level {level.levelNumber}</span>
                    <span className="level-search-results__title">{level.title}</span>
                    {level.difficulty ? (
                      <span className={`badge badge--${level.difficulty}`}>{level.difficulty}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
              {results.length === 0 ? (
                <li className="level-search-empty">{t.search.noResults}</li>
              ) : null}
            </ul>
            <Link
              className="level-search-all"
              href={withLocale(locale, "/levels/")}
              onClick={() => setOpen(false)}
            >
              {t.levelDetail.openFullLibrary} →
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
