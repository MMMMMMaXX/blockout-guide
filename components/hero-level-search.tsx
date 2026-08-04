/** 文件职责：首页英雄区的关卡搜索 + 数字选择下拉；聚焦后下方展开按 30 关分组的所有关卡号。 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LevelArticle } from "@/lib/content/types";
import { LevelJumpDropdown } from "./level-jump-dropdown";
import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages } from "@/lib/i18n/messages";

type HeroLevelSearchProps = {
  levels: readonly LevelArticle[];
};

/**
 * 首页 hero 搜索框：与关卡列表页一致，聚焦后展开数字选择下拉。
 * 输入关键词时仅改变内部状态；为保持和列表页相同的“数字网格”体验，
 * 下拉始终展示全部关卡号，点击即跳转。
 */
export function HeroLevelSearch({ levels }: HeroLevelSearchProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const locale = useLocale();
  const t = getMessages(locale);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const sorted = useMemo(() => [...levels].sort((a, b) => a.levelNumber - b.levelNumber), [levels]);

  return (
    <div className="hero-level-search" ref={rootRef}>
      <div className="hero-level-search__field">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder={t.home.searchPlaceholder}
          onFocus={() => setOpen(true)}
          onChange={() => setOpen(true)}
          aria-controls={open ? "hero-level-jump" : undefined}
        />
        <span className="hero-level-search__cta">{t.common.browse}</span>
      </div>
      {open ? (
        <div id="hero-level-jump" className="hero-level-search__dropdown">
          <LevelJumpDropdown levels={sorted} onClose={() => setOpen(false)} showHeader={false} />
        </div>
      ) : null}
    </div>
  );
}
