/** 文件职责：在关卡页滚动约 1/4 屏后，于屏幕底部常驻悬浮条，承载上一关/搜索/下一关快速导航。 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FloatingLevelSearch } from "./floating-level-search";
import type { LevelSearchItem } from "./level-search-overlay";
import type { Locale } from "@/lib/content/types";
import { withLocale } from "@/lib/i18n/locale-path";
import { getMessages } from "@/lib/i18n/messages";

type AdjacentLevel = { levelNumber: number; title: string } | null;

type FloatingLevelBarProps = {
  locale: Locale;
  previousLevel: AdjacentLevel;
  nextLevel: AdjacentLevel;
  levels: LevelSearchItem[];
};

/**
 * 悬浮条用 transform/opacity 显隐，而非 display:none，使其中的上/下关链接始终留在 DOM，
 * 既保证无脚本与爬虫可见，又能在滚动时平滑浮现。
 */
export function FloatingLevelBar({
  locale,
  previousLevel,
  nextLevel,
  levels,
}: FloatingLevelBarProps) {
  const [visible, setVisible] = useState(false);
  const t = getMessages(locale);

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
            className="floating-level-bar__nav floating-level-bar__nav--previous"
            href={withLocale(locale, `/levels/${previousLevel.levelNumber}/`)}
            aria-label={t.levelDetail.previous}
          >
            <span className="floating-level-bar__nav-arrow" aria-hidden="true">
              ←
            </span>
            <span className="floating-level-bar__nav-label">{t.levelDetail.previous}</span>
            <strong>{previousLevel.levelNumber}</strong>
          </Link>
        ) : (
          <span
            className="floating-level-bar__nav floating-level-bar__nav--disabled floating-level-bar__nav--previous"
            aria-disabled="true"
          >
            <span className="floating-level-bar__nav-arrow" aria-hidden="true">
              ←
            </span>
            <span className="floating-level-bar__nav-label">{t.levelDetail.previous}</span>
          </span>
        )}
        <div className="floating-level-bar__search">
          <FloatingLevelSearch levels={levels} />
        </div>
        {nextLevel ? (
          <Link
            className="floating-level-bar__nav floating-level-bar__nav--next"
            href={withLocale(locale, `/levels/${nextLevel.levelNumber}/`)}
            aria-label={t.levelDetail.next}
          >
            <span className="floating-level-bar__nav-label">{t.levelDetail.next}</span>
            <strong>{nextLevel.levelNumber}</strong>
            <span className="floating-level-bar__nav-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ) : (
          <span
            className="floating-level-bar__nav floating-level-bar__nav--disabled floating-level-bar__nav--next"
            aria-disabled="true"
          >
            <span className="floating-level-bar__nav-label">{t.levelDetail.next}</span>
            <span className="floating-level-bar__nav-arrow" aria-hidden="true">
              →
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
