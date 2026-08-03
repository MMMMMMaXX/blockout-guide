/** 文件职责：在关卡页滚动约 1/4 屏后，于屏幕底部常驻悬浮条，承载上一关/搜索/下一关快速导航。 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LevelSearchTrigger, type LevelSearchItem } from "./level-search-overlay";

type AdjacentLevel = { levelNumber: number; title: string } | null;

type FloatingLevelBarProps = {
  previousLevel: AdjacentLevel;
  nextLevel: AdjacentLevel;
  levels: LevelSearchItem[];
};

/**
 * 悬浮条用 transform/opacity 显隐，而非 display:none，使其中的上/下关链接始终留在 DOM，
 * 既保证无脚本与爬虫可见，又能在滚动时平滑浮现。
 */
export function FloatingLevelBar({ previousLevel, nextLevel, levels }: FloatingLevelBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.25);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`floating-level-bar${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <div className="floating-level-bar__inner">
        {previousLevel ? (
          <Link
            className="floating-level-bar__nav"
            href={`/en/levels/${previousLevel.levelNumber}/`}
          >
            <span aria-hidden="true">←</span>
            <span className="floating-level-bar__nav-label">{previousLevel.levelNumber}</span>
          </Link>
        ) : (
          <span
            className="floating-level-bar__nav floating-level-bar__nav--disabled"
            aria-disabled="true"
          >
            <span aria-hidden="true">←</span>
            <span className="floating-level-bar__nav-label">Prev</span>
          </span>
        )}
        <div className="floating-level-bar__search">
          <LevelSearchTrigger levels={levels} size="bar" />
        </div>
        {nextLevel ? (
          <Link
            className="floating-level-bar__nav floating-level-bar__nav--next"
            href={`/en/levels/${nextLevel.levelNumber}/`}
          >
            <span className="floating-level-bar__nav-label">{nextLevel.levelNumber}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span
            className="floating-level-bar__nav floating-level-bar__nav--disabled floating-level-bar__nav--next"
            aria-disabled="true"
          >
            <span className="floating-level-bar__nav-label">Next</span>
            <span aria-hidden="true">→</span>
          </span>
        )}
      </div>
    </div>
  );
}
