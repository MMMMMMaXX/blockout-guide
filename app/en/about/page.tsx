/** 文件职责：说明站点定位、编辑流程、所有权与内容纠错边界。 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Block Out Guides",
  description: "Learn how StratLore verifies board variants, sources and Block Out guide updates.",
  alternates: { canonical: "/en/about/" },
};

/** About 只陈述已采用的站点规则，不冒充游戏官方信息。 */
export default function AboutPage() {
  return (
    <div className="shell page info-page">
      <header className="article-hero">
        <p className="eyebrow">ABOUT STRATLORE</p>
        <h1>Board-aware help, with an evidence trail</h1>
        <p>
          Block Out Guides is an independent, unofficial guide project designed for players who need
          a matching solution quickly.
        </p>
      </header>
      <div className="info-grid">
        <section className="content-panel">
          <h2>What we publish</h2>
          <p>
            Level solutions, obstacle rules, booster decisions, reusable strategies and
            version-impact notes. Public content must pass its structured publishing gate.
          </p>
        </section>
        <section className="content-panel">
          <h2>How verification works</h2>
          <p>
            Content agents record board layout, platform, game version, source, verification date
            and the applicable Variant before writing a production article. Incomplete research is
            kept outside the public content set.
          </p>
        </section>
        <section className="content-panel">
          <h2>How corrections work</h2>
          <p>
            When a board or video no longer matches, automated checks must replace or remove the
            affected production article instead of creating a hidden content backlog.
          </p>
        </section>
        <section className="content-panel">
          <h2>Ownership</h2>
          <p>
            The guide site is operated by StratLore. Block Out! and its game assets remain the
            property of their respective owners.
          </p>
        </section>
      </div>
    </div>
  );
}
