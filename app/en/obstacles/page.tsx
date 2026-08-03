/** 文件职责：提供已发布障碍机制的聚合入口和安全空状态。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedObstacles } from "@/lib/content/editorial-repository";

/** 空机制库保持 noindex；首篇发布后自动开放索引。 */
export function generateMetadata(): Metadata {
  const hasPublished = getPublishedObstacles("en").length > 0;
  return {
    title: "Block Out obstacles",
    description: "Learn verified Block Out obstacle rules, priorities and related levels.",
    alternates: { canonical: "/en/obstacles/" },
    robots: hasPublished ? "index, follow" : "noindex, follow",
  };
}

/** 聚合页不回退展示研究草稿。 */
export default function ObstaclesPage() {
  const obstacles = getPublishedObstacles("en");
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">MECHANIC LIBRARY</p>
        <h1>Block Out obstacles</h1>
        <p>Verified rules, board priorities, failure modes and the published levels they affect.</p>
      </header>
      <EditorialCollection
        items={obstacles}
        routeSegment="obstacles"
        emptyTitle="No obstacle article is published yet"
        emptyCopy="Add a complete published obstacle article to make it appear here automatically."
      />
    </div>
  );
}
