/** 文件职责：渲染关卡详情的相邻关卡导航（上一关/搜索/下一关）。所有关卡复用同一组件。 */
import Link from "next/link";
import type { Locale } from "@/lib/content/types";
import { withLocale } from "@/lib/i18n/locale-path";
import { getMessages } from "@/lib/i18n/messages";

type AdjacentLevel = { levelNumber: number; title: string } | null;

type LevelNavModuleProps = {
  locale: Locale;
  previousLevel: AdjacentLevel;
  nextLevel: AdjacentLevel;
};

/** 单关卡相邻导航；修改此组件会同时影响所有关卡页的底部导航。 */
export function LevelNavModule({ locale, previousLevel, nextLevel }: LevelNavModuleProps) {
  const t = getMessages(locale);
  return (
    <nav className="mobile-level-nav" aria-label="Adjacent levels">
      {previousLevel ? (
        <Link href={withLocale(locale, `/levels/${previousLevel.levelNumber}/`)}>
          ← {previousLevel.levelNumber}
        </Link>
      ) : (
        <span aria-disabled="true">← {t.levelDetail.previous}</span>
      )}
      <Link href={withLocale(locale, "/levels/")}>{t.nav.search}</Link>
      {nextLevel ? (
        <Link href={withLocale(locale, `/levels/${nextLevel.levelNumber}/`)}>
          {nextLevel.levelNumber} →
        </Link>
      ) : (
        <span aria-disabled="true">{t.levelDetail.next} →</span>
      )}
    </nav>
  );
}
