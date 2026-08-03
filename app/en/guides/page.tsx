/** 文件职责：聚合解决跨关卡问题的已发布策略文章。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedGuides } from "@/lib/content/editorial-repository";

/** 没有可用文章时保持 noindex，避免生成内容农场式空列表。 */
export function generateMetadata(): Metadata {
  const hasPublished = getPublishedGuides("en").length > 0;
  return {
    title: "Block Out strategy guides",
    description:
      "Read verified Block Out strategy guides for board variants, mechanics and repeatable decisions.",
    alternates: { canonical: "/en/guides/" },
    robots: hasPublished ? "index, follow" : "noindex, follow",
  };
}

/** Guide 聚合只展示有独立问题和完整正文的 published 内容。 */
export default function GuidesPage() {
  const guides = getPublishedGuides("en");
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">STRATEGY LIBRARY</p>
        <h1>Block Out strategy guides</h1>
        <p>Reusable decisions for problems that appear across more than one verified level.</p>
      </header>
      <EditorialCollection
        items={guides}
        routeSegment="guides"
        emptyTitle="No strategy guide is published yet"
        emptyCopy="Add a complete published guide to make it appear here automatically."
      />
    </div>
  );
}
