/** 文件职责：提供可检索、筛选和分页的已发布关卡聚合入口。 */
import type { Metadata } from "next";
import { LevelsExplorer } from "@/components/levels-explorer";
import { getPublishedLevels } from "@/lib/content/level-repository";

/** 空目录暂不参与索引；首次发布内容后自动开放索引。 */
export function generateMetadata(): Metadata {
  const hasPublishedLevels = getPublishedLevels("en").length > 0;
  return {
    title: "All levels",
    description: "Browse verified Block Out! level guides by number and difficulty.",
    alternates: { canonical: "/en/levels/" },
    robots: hasPublishedLevels ? "index, follow" : "noindex, follow",
  };
}

/** 聚合页始终消费 published 查询，禁止把草稿当作空状态回退内容。 */
export default function LevelsPage() {
  const published = getPublishedLevels("en");
  return (
    <div className="shell page page--library">
      <header className="page-heading page-heading--compact">
        <p className="eyebrow">LEVEL LIBRARY</p>
        <h1>All Block Out levels</h1>
        <p>Search by level number, then confirm the board variant before following a solution.</p>
      </header>
      <LevelsExplorer levels={published} />
    </div>
  );
}
