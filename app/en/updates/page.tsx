/** 文件职责：聚合已核验版本变化和内容复核状态。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedUpdates } from "@/lib/content/editorial-repository";

/** 没有来源充分的更新时保持 noindex，避免转载式薄内容。 */
export function generateMetadata(): Metadata {
  const hasPublished = getPublishedUpdates("en").length > 0;
  return {
    title: "Block Out updates",
    description: "Track verified Block Out version changes and guide revalidation status.",
    alternates: { canonical: "/en/updates/" },
    robots: hasPublished ? "index, follow" : "noindex, follow",
  };
}

/** Updates 页面强调对攻略库的影响，而不是复制普通新闻流。 */
export default function UpdatesPage() {
  const updates = getPublishedUpdates("en");
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">VERSION WATCH</p>
        <h1>Block Out updates</h1>
        <p>Sourced changes, affected content and the verification work required after a release.</p>
      </header>
      <EditorialCollection
        items={updates}
        routeSegment="updates"
        emptyTitle="No version update is published yet"
        emptyCopy="Add a complete published update article to make it appear here automatically."
      />
    </div>
  );
}
