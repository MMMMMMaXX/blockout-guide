/** 文件职责：聚合所有已发布高难关卡，并提供可复用的失败模式入口。 */
import type { Metadata } from "next";
import { LevelsExplorer } from "@/components/levels-explorer";
import { getPublishedHardLevels } from "@/lib/content/level-repository";

const failurePatterns = [
  ["Board mismatch", "Confirm the opening layout and platform before copying moves."],
  ["Blocked center", "Prioritize space-making moves before clearing convenient edge pieces."],
  ["Move pressure", "Compare the opening sequence before spending boosters on a weak attempt."],
  ["Version drift", "Re-check the verified date when the game changes a level layout."],
] as const;

/** 没有已发布高难内容时保持 noindex，避免空聚合页进入搜索结果。 */
export function generateMetadata(): Metadata {
  const hasPublishedLevels = getPublishedHardLevels("en").length > 0;
  return {
    title: "Hard Block Out levels",
    description: "Browse verified hard, expert and super-hard Block Out level guides.",
    alternates: { canonical: "/en/hard-levels/" },
    robots: hasPublishedLevels ? "index, follow" : "noindex, follow",
  };
}

/** 失败模式卡片提供诊断方向，不虚构尚不存在的攻略链接。 */
export default function HardLevelsPage() {
  const levels = getPublishedHardLevels("en");
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">DIFFICULTY HUB</p>
        <h1>Hard Block Out levels</h1>
        <p>
          Verified hard, expert and super-hard solutions, grouped for fast board-first diagnosis.
        </p>
      </header>
      <section className="failure-patterns" aria-labelledby="failure-pattern-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAILURE PATTERNS</p>
            <h2 id="failure-pattern-heading">Diagnose the attempt before retrying</h2>
          </div>
        </div>
        <div className="feature-grid">
          {failurePatterns.map(([title, copy], index) => (
            <article className="feature-card" key={title}>
              <span>{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="hard-library" aria-labelledby="hard-library-heading">
        <h2 id="hard-library-heading" className="sr-only">
          Verified hard levels
        </h2>
        <LevelsExplorer
          levels={levels}
          emptyTitle="No complete hard-level guide is available"
          emptyCopy="Add a complete published level article to make it appear here automatically."
        />
      </section>
    </div>
  );
}
