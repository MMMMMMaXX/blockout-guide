/** 文件职责：渲染障碍规则、策略、避坑点及已发布关联关卡。 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelCard } from "@/components/level-card";
import {
  getPublishedObstacleBySlug,
  getPublishedObstacles,
  getPublishedRelatedLevels,
} from "@/lib/content/editorial-repository";

type PageProps = { params: Promise<{ slug: string }> };

/** 只为真实内容实体生成详情参数，不批量制造机制空页。 */
export function generateStaticParams() {
  return getPublishedObstacles("en").map((article) => ({ slug: article.slug }));
}

/** 草稿机制显式 noindex，发布后使用独立 SEO 或内容摘要。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getPublishedObstacleBySlug("en", (await params).slug);
  if (!article) return {};
  return {
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.summary,
    alternates: { canonical: `/en/obstacles/${article.slug}/` },
    robots: "index, follow",
  };
}

/** 关联关卡必须再次经过 published Repository，避免草稿泄露。 */
export default async function ObstacleDetailPage({ params }: PageProps) {
  const article = getPublishedObstacleBySlug("en", (await params).slug);
  if (!article) notFound();
  const relatedLevels = getPublishedRelatedLevels("en", article.relatedLevelNumbers);
  return (
    <div className="shell page editorial-detail">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/en/">Home</Link>
        <span>/</span>
        <Link href="/en/obstacles/">Obstacles</Link>
        <span>/</span>
        <span>{article.title}</span>
      </nav>
      <header className="article-hero">
        <p className="eyebrow">OBSTACLE · {article.category}</p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <div className="article-facts">
          <span>Priority: {article.priority}</span>
          <span>Verified: {article.verifiedAt ?? article.updatedAt}</span>
          <span>Updated: {article.updatedAt}</span>
        </div>
      </header>
      <div className="article-columns">
        <div className="article-main">
          <section className="content-panel">
            <p className="eyebrow">MECHANIC RULES</p>
            <h2>How Ivy works</h2>
            <ul className="plain-list">
              {article.rules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="content-panel">
            <p className="eyebrow">DECISION PRIORITY</p>
            <h2>Strategy checks</h2>
            <ul className="plain-list plain-list--good">
              {article.strategyPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="content-panel">
            <p className="eyebrow">AVOID</p>
            <h2>Common mistakes</h2>
            <ul className="plain-list plain-list--warn">
              {article.avoidPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="article-side content-panel">
          <p className="eyebrow">EVIDENCE RECORD</p>
          <h2>Sources and scope</h2>
          <p>{article.sourceReferences.length} source references recorded.</p>
          <p>Facts were checked on {article.verifiedAt ?? article.updatedAt}.</p>
        </aside>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RELATED LEVELS</p>
            <h2>Verified levels using this obstacle</h2>
          </div>
        </div>
        {relatedLevels.length > 0 ? (
          <div className="level-grid">
            {relatedLevels.map((level) => (
              <LevelCard key={level.id} level={level} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>0 verified links</span>
            <h2>No level-specific example is linked</h2>
            <p>The obstacle rules above remain complete without an inferred level relationship.</p>
          </div>
        )}
      </section>
    </div>
  );
}
