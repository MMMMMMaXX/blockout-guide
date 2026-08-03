/** 文件职责：提供已发布 Booster 决策指南的聚合入口。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedBoosters } from "@/lib/content/editorial-repository";

/** 空 Booster 库保持 noindex，防止只有产品名的薄内容进入搜索。 */
export function generateMetadata(): Metadata {
  const hasPublished = getPublishedBoosters("en").length > 0;
  return {
    title: "Block Out boosters",
    description: "Decide when a verified Block Out booster helps and when it does not.",
    alternates: { canonical: "/en/boosters/" },
    robots: hasPublished ? "index, follow" : "noindex, follow",
  };
}

/** 页面只呈现通过使用/不使用条件门禁的 published 指南。 */
export default function BoostersPage() {
  const boosters = getPublishedBoosters("en");
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">DECISION LIBRARY</p>
        <h1>Block Out booster guides</h1>
        <p>Start with the failure reason, then decide whether a booster changes the outcome.</p>
      </header>
      <EditorialCollection
        items={boosters}
        routeSegment="boosters"
        emptyTitle="No booster decision guide is published yet"
        emptyCopy="Add a complete published booster guide to make it appear here automatically."
      />
    </div>
  );
}
