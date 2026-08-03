/** 文件职责：在关卡底部悬浮条内提供轻量数字跳转菜单，不打开遮挡页面的全屏搜索浮层。 */
"use client";

import { useEffect, useRef, useState } from "react";
import type { LevelSearchItem } from "./level-search-overlay";
import { LevelJumpDropdown } from "./level-jump-dropdown";

type FloatingLevelSearchProps = {
  levels: LevelSearchItem[];
};

/** 底部导航搜索：点击后在输入框上方展开与首页一致的分组关卡号列表。 */
export function FloatingLevelSearch({ levels }: FloatingLevelSearchProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="floating-level-search" ref={rootRef}>
      <button
        type="button"
        className={`floating-level-search__trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="floating-level-search__icon" aria-hidden="true">
          ⌕
        </span>
        <span className="floating-level-search__label">Search all levels</span>
        <span className="floating-level-search__hint">Browse numbers</span>
      </button>
      {open ? (
        <div className="floating-level-search__menu">
          <LevelJumpDropdown levels={levels} onClose={() => setOpen(false)} showHeader={false} />
        </div>
      ) : null}
    </div>
  );
}
