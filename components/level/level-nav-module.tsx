/** 文件职责：渲染关卡详情的相邻关卡导航（上一关/搜索/下一关）。所有关卡复用同一组件。 */
import Link from "next/link";

type AdjacentLevel = { levelNumber: number; title: string } | null;

type LevelNavModuleProps = {
  previousLevel: AdjacentLevel;
  nextLevel: AdjacentLevel;
};

/** 单关卡相邻导航；修改此组件会同时影响所有关卡页的底部导航。 */
export function LevelNavModule({ previousLevel, nextLevel }: LevelNavModuleProps) {
  return (
    <nav className="mobile-level-nav" aria-label="Adjacent levels">
      {previousLevel ? (
        <Link href={`/en/levels/${previousLevel.levelNumber}/`}>← {previousLevel.levelNumber}</Link>
      ) : (
        <span aria-disabled="true">← Previous</span>
      )}
      <Link href="/en/levels/">Search</Link>
      {nextLevel ? (
        <Link href={`/en/levels/${nextLevel.levelNumber}/`}>{nextLevel.levelNumber} →</Link>
      ) : (
        <span aria-disabled="true">Next →</span>
      )}
    </nav>
  );
}
